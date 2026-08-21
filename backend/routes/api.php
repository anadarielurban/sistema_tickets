<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\EstadisticasController;
use App\Http\Controllers\Api\ReporteController;
use Illuminate\Support\Facades\Route;


// =============================================
// RUTAS PÚBLICAS (no requieren token)
// =============================================

// Login (para usuarios normales)
Route::post('/login', [AuthController::class, 'login']);

// Reportes PDF (públicos para demo)
Route::get('/reportes/tickets-pdf', [ReporteController::class, 'ticketsPDF']);
Route::get('/reportes/estadisticas-pdf', [ReporteController::class, 'estadisticasPDF']);

// =============================================
// RUTAS PROTEGIDAS (requieren token Sanctum)
// =============================================

Route::middleware('auth:sanctum')->group(function () {
    
    // ---- AUTH ----
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // ---- DEPENDENCIAS Y PERSONAS ----
    Route::get('/dependencias', [AuthController::class, 'dependencias']);
    Route::get('/dependencias/{id}/personas', [AuthController::class, 'personasPorDependencia']);

    // ---- TICKETS ----
    // Crear ticket (lo usa el bot)
    Route::post('/tickets', [TicketController::class, 'store']);

    // Listar, ver, tomar, diagnosticar, cancelar
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
    Route::post('/tickets/{ticket}/tomar', [TicketController::class, 'tomar']);
    Route::post('/tickets/{ticket}/diagnosticar', [TicketController::class, 'diagnosticar']);
    Route::post('/tickets/{ticket}/cancelar', [TicketController::class, 'cancelar']);

    // ✅ NUEVAS RUTAS PARA SOFT DELETE
    // Eliminar (soft delete) – visible para todos los roles
    Route::delete('/tickets/{ticket}', [TicketController::class, 'destroy']);
    // Restaurar un ticket eliminado
    Route::post('/tickets/{ticket}/restaurar', [TicketController::class, 'restore']);

    // ---- ESTADÍSTICAS ----
    Route::get('/estadisticas/dashboard', [EstadisticasController::class, 'dashboard']);

    // ---- MIS TICKETS HOY ----
    Route::get('/mis-tickets-hoy', [TicketController::class, 'misTicketsHoy']);
});