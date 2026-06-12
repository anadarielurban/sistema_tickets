<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EstadisticasController extends Controller
{
    // Dashboard general
    public function dashboard()
    {
        $mesActual = now()->month;
        $añoActual = now()->year;

        return response()->json([
            'total_mes' => Ticket::whereMonth('created_at', $mesActual)->count(),
            'pendientes' => Ticket::where('estado', 'pendiente')->count(),
            'resueltos' => Ticket::where('estado', 'resuelto')->whereMonth('updated_at', $mesActual)->count(),
            'tiempo_promedio' => round(Ticket::whereNotNull('tiempo_minutos')->avg('tiempo_minutos') ?? 0),
            
            'por_tipo' => Ticket::select('tipo', DB::raw('COUNT(*) as total'))
                ->whereMonth('created_at', $mesActual)
                ->groupBy('tipo')
                ->get(),

            'por_auxiliar' => User::where('rol', 'auxiliar')
                ->withCount(['ticketsResueltos' => function($q) use ($mesActual) {
                    $q->whereMonth('updated_at', $mesActual);
                }])
                ->get()
                ->map(function($u) {
                    return [
                        'nombre' => $u->nombre_completo,
                        'total' => $u->ticketsResueltos_count,
                    ];
                }),

            'usuarios_frecuentes' => Ticket::select('solicitante_id', DB::raw('COUNT(*) as total'))
                ->whereMonth('created_at', $mesActual)
                ->groupBy('solicitante_id')
                ->orderByDesc('total')
                ->limit(5)
                ->with('solicitante')
                ->get()
                ->map(function($t) {
                    return [
                        'nombre' => $t->solicitante->nombre_completo,
                        'total' => $t->total,
                    ];
                }),

            'equipos_problematicos' => Ticket::whereNotNull('diagnostico')
                ->where('causa', 'falla_hardware')
                ->select('titulo', DB::raw('COUNT(*) as total'))
                ->groupBy('titulo')
                ->orderByDesc('total')
                ->limit(5)
                ->get(),
        ]);
    }
}