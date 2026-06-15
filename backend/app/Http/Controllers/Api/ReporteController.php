<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Barryvdh\DomPDF\Facade\Pdf;

class ReporteController extends Controller
{
    public function ticketsPDF()
    {
        $tickets = Ticket::with(['solicitante', 'auxiliar', 'dependencia'])
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        $pdf = Pdf::loadView('reportes.tickets', compact('tickets'));
        return $pdf->download('reporte-tickets.pdf');
    }

    public function estadisticasPDF()
    {
        $stats = [
            'total' => Ticket::count(),
            'pendientes' => Ticket::where('estado', 'pendiente')->count(),
            'resueltos' => Ticket::where('estado', 'resuelto')->count(),
            'tiempo_promedio' => round(Ticket::avg('tiempo_minutos') ?? 0),
        ];

        $pdf = Pdf::loadView('reportes.estadisticas', compact('stats'));
        return $pdf->download('estadisticas.pdf');
    }
}