<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use SoftDeletes;

    protected $table = 'tickets';

    protected $fillable = [
        'folio', 'solicitante_id', 'dependencia_id', 'creado_por',
        'auxiliar_id', 'tipo', 'titulo', 'descripcion', 'ubicacion',
        'estado', 'problema_encontrado', 'diagnostico', 'solucion',
        'causa', 'equipo_en_sistemas', 'foto_comprobacion',
        'fecha_ingreso', 'fecha_salida',
        'entregado_a', 'inicio_atencion', 'fin_atencion', 'tiempo_minutos',
        'es_ayuda',
    ];

    protected $casts = [
        'equipo_en_sistemas' => 'boolean',
        'es_ayuda' => 'boolean',
        'fecha_ingreso' => 'datetime',
        'fecha_salida' => 'datetime',
        'inicio_atencion' => 'datetime',
        'fin_atencion' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($ticket) {
            $year = date('Y');
            $count = Ticket::whereYear('created_at', $year)->count() + 1;
            $ticket->folio = 'TKT-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
        });
    }

    public function solicitante() { return $this->belongsTo(User::class, 'solicitante_id'); }
    public function creadoPor() { return $this->belongsTo(User::class, 'creado_por'); }
    public function auxiliar() { return $this->belongsTo(User::class, 'auxiliar_id'); }
    public function dependencia() { return $this->belongsTo(Dependencia::class); }
    public function historial() { return $this->hasMany(HistorialTicket::class); }
    
    // ✅ NUEVA RELACIÓN
    public function detalles() { return $this->hasMany(DetalleTicket::class); }

    public function registrarHistorial($accion, $descripcion)
    {
        return $this->historial()->create([
            'usuario_id' => auth()->id(),
            'accion' => $accion,
            'descripcion' => $descripcion,
        ]);
    }
}