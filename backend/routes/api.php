<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\EstadisticasController;
use Illuminate\Support\Facades\Route;

// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/dependencias', [AuthController::class, 'dependencias']);
    Route::get('/dependencias/{id}/personas', [AuthController::class, 'personasPorDependencia']);

    // Tickets
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
    Route::post('/tickets/{ticket}/tomar', [TicketController::class, 'tomar']);
    Route::post('/tickets/{ticket}/diagnosticar', [TicketController::class, 'diagnosticar']);
    Route::post('/tickets/{ticket}/cancelar', [TicketController::class, 'cancelar']);
    Route::get('/mis-tickets-hoy', [TicketController::class, 'misTicketsHoy']);

    // Estadísticas
    Route::get('/estadisticas/dashboard', [EstadisticasController::class, 'dashboard']);
});