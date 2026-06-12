<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes;

    protected $table = 'usuarios';

    protected $fillable = [
        'dependencia_id', 'nombre', 'apellido_paterno', 'apellido_materno',
        'email', 'password', 'cargo', 'rol', 'activo',
    ];

    protected $hidden = ['password', 'remember_token'];

    public function dependencia()
    {
        return $this->belongsTo(Dependencia::class);
    }

    public function ticketsResueltos()
    {
        return $this->hasMany(Ticket::class, 'auxiliar_id');
    }

    public function getNombreCompletoAttribute()
    {
        return $this->nombre . ' ' . $this->apellido_paterno . 
               ($this->apellido_materno ? ' ' . $this->apellido_materno : '');
    }

    public function esAdmin() { return $this->rol === 'admin'; }
    public function esAuxiliar() { return $this->rol === 'auxiliar'; }
    public function esSolicitante() { return $this->rol === 'solicitante'; }
}