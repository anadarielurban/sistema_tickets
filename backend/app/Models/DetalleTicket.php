<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleTicket extends Model
{
    protected $table = 'detalle_tickets';

    protected $fillable = [
        'ticket_id',
        'tipo_equipo',
        'descripcion',
        'foto_evidencia',
        'puntos',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
}