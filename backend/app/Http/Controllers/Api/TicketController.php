<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Ticket::with(['solicitante', 'dependencia', 'auxiliar', 'creadoPor']);

        if ($user->esSolicitante()) {
            $query->where('solicitante_id', $user->id);
        }

        if ($user->esAuxiliar()) {
            $query->where(function($q) use ($user) {
                $q->where('auxiliar_id', $user->id)
                  ->orWhereNull('auxiliar_id');
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }
        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }
        if ($request->filled('buscar')) {
            $search = $request->buscar;
            $query->where(function($q) use ($search) {
                $q->where('folio', 'like', "%{$search}%")
                  ->orWhere('titulo', 'like', "%{$search}%");
            });
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate(10);
        return response()->json($tickets);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'solicitante_id' => 'required|exists:usuarios,id',
            'dependencia_id' => 'required|exists:dependencias,id',
            'tipo' => 'required|in:computadora,impresora,red,otro',
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'ubicacion' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();
            
            $ticket = Ticket::create([
                'solicitante_id' => $request->solicitante_id,
                'dependencia_id' => $request->dependencia_id,
                'creado_por' => $user->id,
                'tipo' => $request->tipo,
                'titulo' => $request->titulo,
                'descripcion' => $request->descripcion,
                'ubicacion' => $request->ubicacion,
                'estado' => 'pendiente',
                'es_ayuda' => $user->id != $request->solicitante_id,
            ]);

            $this->registrarHistorial($ticket, 'creacion', 'Ticket creado por ' . $user->nombre_completo);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ticket creado - Folio: ' . $ticket->folio,
                'ticket' => $ticket->load(['solicitante', 'dependencia']),
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show(Ticket $ticket)
    {
        $ticket->load(['solicitante', 'dependencia', 'auxiliar', 'creadoPor', 'historial.usuario']);
        return response()->json($ticket);
    }

    public function tomar(Ticket $ticket, Request $request)
    {
        $user = $request->user();

        if ($ticket->estado != 'pendiente') {
            return response()->json(['success' => false, 'message' => 'Ticket ya fue tomado'], 400);
        }

        try {
            DB::beginTransaction();
            
            $ticket->update([
                'auxiliar_id' => $user->id,
                'estado' => 'en_proceso',
                'inicio_atencion' => now(),
            ]);

            $this->registrarHistorial($ticket, 'tomado', 'Tomado por ' . $user->nombre_completo);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ticket tomado exitosamente',
                'ticket' => $ticket->fresh(['auxiliar']),
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Error al tomar el ticket'], 500);
        }
    }

    // ==========================================
    // ✅ DIAGNÓSTICO CORREGIDO - GUARDA FOTO
    // ==========================================
    public function diagnosticar(Ticket $ticket, Request $request)
    {
        $user = $request->user();

        try {
            $datos = [
                'problema_encontrado' => $request->problema_encontrado ?? '',
                'diagnostico' => $request->diagnostico ?? '',
                'solucion' => $request->solucion ?? '',
                'causa' => $request->causa ?? 'otro',
                'estado' => 'resuelto',
                'fin_atencion' => now(),
                'equipo_en_sistemas' => $request->equipo_en_sistemas ?? false,
                'fecha_ingreso' => $request->equipo_en_sistemas ? now() : null,
            ];

            if ($ticket->inicio_atencion) {
                $datos['tiempo_minutos'] = now()->diffInMinutes($ticket->inicio_atencion);
            }

            // ✅ GUARDAR FOTO
            if ($request->hasFile('foto_comprobacion')) {
                $archivo = $request->file('foto_comprobacion');
                $extension = $archivo->getClientOriginalExtension();
                $nombre = 'ticket_' . $ticket->id . '_' . time() . '.' . $extension;
                $destino = storage_path('app/public/comprobaciones/');
                
                if (!file_exists($destino)) {
                    mkdir($destino, 0777, true);
                }
                
                // Intentar mover el archivo
                try {
                    $archivo->move($destino, $nombre);
                    if (file_exists($destino . $nombre)) {
                        $datos['foto_comprobacion'] = 'comprobaciones/' . $nombre;
                        Log::info('✅ Foto movida con move(): ' . $datos['foto_comprobacion']);
                    }
                } catch (\Exception $e) {
                    Log::error('Error con move(): ' . $e->getMessage());
                }
            } 
            // Si hasFile falla, intentar con $_FILES
            elseif (!empty($_FILES['foto_comprobacion']['tmp_name'])) {
                $extension = pathinfo($_FILES['foto_comprobacion']['name'], PATHINFO_EXTENSION);
                $nombre = 'ticket_' . $ticket->id . '_' . time() . '.' . $extension;
                $destino = storage_path('app/public/comprobaciones/');
                
                if (!file_exists($destino)) {
                    mkdir($destino, 0777, true);
                }
                
                if (move_uploaded_file($_FILES['foto_comprobacion']['tmp_name'], $destino . $nombre)) {
                    $datos['foto_comprobacion'] = 'comprobaciones/' . $nombre;
                    Log::info('✅ Foto movida con move_uploaded_file(): ' . $datos['foto_comprobacion']);
                }
            }

            // ✅ GUARDAR EN BD
            $ticket->update($datos);
            
            Log::info('Datos guardados: ' . json_encode($datos));

            $mensaje = 'Resuelto por ' . $user->nombre_completo;
            if (!empty($datos['foto_comprobacion'])) {
                $mensaje .= ' 📸 Con foto de comprobación';
            }
            $this->registrarHistorial($ticket, 'resuelto', $mensaje);

            return response()->json([
                'success' => true,
                'message' => '✅ Ticket resuelto correctamente',
                'foto_guardada' => $datos['foto_comprobacion'] ?? 'Sin foto',
                'ticket' => $ticket->fresh(['solicitante', 'auxiliar', 'dependencia', 'historial']),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error en diagnosticar: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function cancelar(Ticket $ticket, Request $request)
    {
        try {
            DB::beginTransaction();
            $ticket->update(['estado' => 'cancelado']);
            $this->registrarHistorial($ticket, 'cancelado', 'Cancelado por ' . $request->user()->nombre_completo);
            DB::commit();

            return response()->json(['success' => true, 'message' => 'Ticket cancelado exitosamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Error al cancelar el ticket'], 500);
        }
    }

    public function misTicketsHoy(Request $request)
    {
        $user = $request->user();

        $resueltos = Ticket::where('auxiliar_id', $user->id)->where('estado', 'resuelto')->whereDate('updated_at', today())->count();
        $pendientes = Ticket::whereNull('auxiliar_id')->where('estado', 'pendiente')->count();
        $enProceso = Ticket::where('auxiliar_id', $user->id)->where('estado', 'en_proceso')->count();

        return response()->json([
            'success' => true,
            'resueltos_hoy' => $resueltos,
            'pendientes' => $pendientes,
            'en_proceso' => $enProceso,
        ]);
    }

    private function registrarHistorial(Ticket $ticket, string $accion, string $descripcion)
    {
        try {
            if (DB::getSchemaBuilder()->hasTable('historial_tickets')) {
                DB::table('historial_tickets')->insert([
                    'ticket_id' => $ticket->id,
                    'usuario_id' => auth()->id() ?? 1,
                    'accion' => $accion,
                    'descripcion' => $descripcion,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        } catch (\Exception $e) {
            Log::warning('No se pudo registrar historial: ' . $e->getMessage());
        }
    }
}