<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TicketController extends Controller
{
    // Listar tickets (con filtros)
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Ticket::with(['solicitante', 'dependencia', 'auxiliar', 'creadoPor']);

        // Si es solicitante, solo ve sus tickets
        if ($user->esSolicitante()) {
            $query->where('solicitante_id', $user->id);
        }

        // Si es auxiliar, ve los suyos y los pendientes
        if ($user->esAuxiliar()) {
            $query->where(function($q) use ($user) {
                $q->where('auxiliar_id', $user->id)
                  ->orWhereNull('auxiliar_id');
            });
        }

        // Filtros
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

    // Crear ticket
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

        $ticket->registrarHistorial('creacion', 'Ticket creado por ' . $user->nombre_completo);

        return response()->json([
            'success' => true,
            'message' => 'Ticket creado - Folio: ' . $ticket->folio,
            'ticket' => $ticket->load(['solicitante', 'dependencia']),
        ], 201);
    }

    // Ver detalle de ticket
    public function show(Ticket $ticket)
    {
        $ticket->load(['solicitante', 'dependencia', 'auxiliar', 'creadoPor', 'historial.usuario']);

        return response()->json($ticket);
    }

    // Tomar ticket (auxiliar se asigna)
    public function tomar(Ticket $ticket, Request $request)
    {
        $user = $request->user();

        if ($ticket->estado != 'pendiente') {
            return response()->json(['message' => 'Ticket ya fue tomado'], 400);
        }

        $ticket->update([
            'auxiliar_id' => $user->id,
            'estado' => 'en_proceso',
            'inicio_atencion' => now(),
        ]);

        $ticket->registrarHistorial('tomado', 'Tomado por ' . $user->nombre_completo);

        return response()->json([
            'success' => true,
            'message' => 'Ticket tomado',
            'ticket' => $ticket->fresh(['auxiliar']),
        ]);
    }

    // Guardar diagnóstico (auxiliar)
    public function diagnosticar(Ticket $ticket, Request $request)
    {
        $request->validate([
            'problema_encontrado' => 'required|string',
            'diagnostico' => 'required|string',
            'solucion' => 'required|string',
            'causa' => 'required|in:error_usuario,error_sistemas,falla_hardware,falla_software,configuracion,otro',
            'equipo_en_sistemas' => 'boolean',
        ]);

        $ticket->update([
            'problema_encontrado' => $request->problema_encontrado,
            'diagnostico' => $request->diagnostico,
            'solucion' => $request->solucion,
            'causa' => $request->causa,
            'estado' => 'resuelto',
            'fin_atencion' => now(),
            'tiempo_minutos' => $ticket->inicio_atencion 
                ? now()->diffInMinutes($ticket->inicio_atencion) 
                : null,
            'equipo_en_sistemas' => $request->equipo_en_sistemas ?? false,
            'fecha_ingreso' => $request->equipo_en_sistemas ? now() : null,
        ]);

        $ticket->registrarHistorial('resuelto', 'Resuelto por ' . $request->user()->nombre_completo);

        return response()->json([
            'success' => true,
            'message' => 'Diagnóstico guardado',
            'ticket' => $ticket->fresh(),
        ]);
    }

    // Cancelar ticket
    public function cancelar(Ticket $ticket, Request $request)
    {
        $ticket->update(['estado' => 'cancelado']);
        $ticket->registrarHistorial('cancelado', 'Cancelado por ' . $request->user()->nombre_completo);

        return response()->json([
            'success' => true,
            'message' => 'Ticket cancelado',
        ]);
    }

    // Mis tickets del día (para auxiliar)
    public function misTicketsHoy(Request $request)
    {
        $user = $request->user();

        $tickets = Ticket::where('auxiliar_id', $user->id)
            ->whereDate('updated_at', today())
            ->count();

        $pendientes = Ticket::whereNull('auxiliar_id')
            ->where('estado', 'pendiente')
            ->count();

        return response()->json([
            'resueltos_hoy' => $tickets,
            'pendientes' => $pendientes,
        ]);
    }
}