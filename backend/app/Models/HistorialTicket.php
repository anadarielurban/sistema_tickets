<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistorialTicket extends Model
{
    protected $table = 'historial_tickets';
    protected $fillable = ['ticket_id', 'usuario_id', 'accion', 'descripcion'];

    public function ticket() { return $this->belongsTo(Ticket::class); }
    public function usuario() { return $this->belongsTo(User::class, 'usuario_id'); }
}