<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up()
    {
        Schema::create('dependencias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('abreviatura')->nullable();
            $table->timestamps();
        });

        DB::table('dependencias')->insert([
            ['nombre' => 'Presidencia Municipal', 'abreviatura' => 'PRES', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Secretaría del Ayuntamiento', 'abreviatura' => 'SA', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Tesorería Municipal', 'abreviatura' => 'TM', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Obras Públicas', 'abreviatura' => 'OP', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Desarrollo Social', 'abreviatura' => 'DS', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Seguridad Pública', 'abreviatura' => 'SP', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Recursos Humanos', 'abreviatura' => 'RH', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Sistemas', 'abreviatura' => 'SIS', 'created_at' => now(), 'updated_at' => now()],
        ]);

        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dependencia_id')->constrained('dependencias');
            $table->string('nombre');
            $table->string('apellido_paterno');
            $table->string('apellido_materno')->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('cargo')->nullable();
            $table->enum('rol', ['solicitante', 'auxiliar', 'admin'])->default('solicitante');
            $table->boolean('activo')->default(true);
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        DB::table('usuarios')->insert([
            ['dependencia_id' => 8, 'nombre' => 'Admin', 'apellido_paterno' => 'Sistemas', 'email' => 'admin@municipio.local', 'password' => Hash::make('admin123'), 'cargo' => 'Director', 'rol' => 'admin', 'created_at' => now(), 'updated_at' => now()],
            ['dependencia_id' => 8, 'nombre' => 'Luis', 'apellido_paterno' => 'Hernández', 'email' => 'luis@municipio.local', 'password' => Hash::make('auxiliar123'), 'cargo' => 'Auxiliar', 'rol' => 'auxiliar', 'created_at' => now(), 'updated_at' => now()],
            ['dependencia_id' => 8, 'nombre' => 'Rosa', 'apellido_paterno' => 'González', 'email' => 'rosa@municipio.local', 'password' => Hash::make('auxiliar123'), 'cargo' => 'Auxiliar', 'rol' => 'auxiliar', 'created_at' => now(), 'updated_at' => now()],
            ['dependencia_id' => 8, 'nombre' => 'Carlos', 'apellido_paterno' => 'López', 'email' => 'carlos2@municipio.local', 'password' => Hash::make('auxiliar123'), 'cargo' => 'Auxiliar', 'rol' => 'auxiliar', 'created_at' => now(), 'updated_at' => now()],
            ['dependencia_id' => 8, 'nombre' => 'Pedro', 'apellido_paterno' => 'Ramírez', 'email' => 'pedro@municipio.local', 'password' => Hash::make('auxiliar123'), 'cargo' => 'Auxiliar', 'rol' => 'auxiliar', 'created_at' => now(), 'updated_at' => now()],
            ['dependencia_id' => 3, 'nombre' => 'María', 'apellido_paterno' => 'García', 'email' => 'maria@municipio.local', 'password' => Hash::make('usuario123'), 'cargo' => 'Contadora', 'rol' => 'solicitante', 'created_at' => now(), 'updated_at' => now()],
            ['dependencia_id' => 4, 'nombre' => 'Juan', 'apellido_paterno' => 'Pérez', 'email' => 'juan@municipio.local', 'password' => Hash::make('usuario123'), 'cargo' => 'Ingeniero', 'rol' => 'solicitante', 'created_at' => now(), 'updated_at' => now()],
        ]);

        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('folio')->unique();
            $table->foreignId('solicitante_id')->constrained('usuarios');
            $table->foreignId('dependencia_id')->constrained('dependencias');
            $table->foreignId('creado_por')->constrained('usuarios');
            $table->foreignId('auxiliar_id')->nullable()->constrained('usuarios');
            $table->enum('tipo', ['computadora', 'impresora', 'red', 'otro']);
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->string('ubicacion')->nullable();
            $table->enum('estado', ['pendiente', 'en_proceso', 'resuelto', 'cancelado'])->default('pendiente');
            $table->string('problema_encontrado')->nullable();
            $table->text('diagnostico')->nullable();
            $table->text('solucion')->nullable();
            $table->enum('causa', ['error_usuario', 'error_sistemas', 'falla_hardware', 'falla_software', 'configuracion', 'otro'])->nullable();
            $table->boolean('equipo_en_sistemas')->default(false);
            $table->dateTime('fecha_ingreso')->nullable();
            $table->dateTime('fecha_salida')->nullable();
            $table->string('entregado_a')->nullable();
            $table->dateTime('inicio_atencion')->nullable();
            $table->dateTime('fin_atencion')->nullable();
            $table->integer('tiempo_minutos')->nullable();
            $table->boolean('es_ayuda')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('historial_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets');
            $table->foreignId('usuario_id')->constrained('usuarios');
            $table->string('accion');
            $table->text('descripcion');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('historial_tickets');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('dependencias');
    }
};