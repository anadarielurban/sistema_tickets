<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\EstadisticasController;
use App\Http\Controllers\Api\ReporteController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Aquí están todas las rutas que tu frontend y tu bot de WhatsApp
| van a consumir.
|
*/

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
    // Estas dos rutas las usa el bot para obtener la lista de departamentos
    // y las personas de cada departamento.
    Route::get('/dependencias', [AuthController::class, 'dependencias']);
    Route::get('/dependencias/{id}/personas', [AuthController::class, 'personasPorDependencia']);

    // ---- TICKETS ----
    // ÉSTA es la ruta que tu bot debe llamar para CREAR un ticket
    Route::post('/tickets', [TicketController::class, 'store']);   // <--- AQUÍ

    // Las demás rutas de tickets (listar, ver, tomar, diagnosticar, cancelar)
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
    Route::post('/tickets/{ticket}/tomar', [TicketController::class, 'tomar']);
    Route::post('/tickets/{ticket}/diagnosticar', [TicketController::class, 'diagnosticar']);
    Route::post('/tickets/{ticket}/cancelar', [TicketController::class, 'cancelar']);
    Route::get('/mis-tickets-hoy', [TicketController::class, 'misTicketsHoy']);

    // ---- ESTADÍSTICAS ----
    Route::get('/estadisticas/dashboard', [EstadisticasController::class, 'dashboard']);
});