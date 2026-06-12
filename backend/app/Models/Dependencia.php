<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dependencia extends Model
{
    protected $table = 'dependencias';
    protected $fillable = ['nombre', 'abreviatura'];

    public function usuarios()
    {
        return $this->hasMany(User::class);
    }
}