<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Iniciar sesión
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciales incorrectas'],
            ]);
        }

        $token = $user->createToken('app')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'nombre' => $user->nombre_completo,
                'email' => $user->email,
                'rol' => $user->rol,
                'dependencia' => $user->dependencia->nombre ?? null,
            ],
        ]);
    }

    // Cerrar sesión
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada',
        ]);
    }

    // Obtener usuario actual
    public function user(Request $request)
    {
        $user = $request->user()->load('dependencia');

        return response()->json([
            'id' => $user->id,
            'nombre' => $user->nombre_completo,
            'email' => $user->email,
            'rol' => $user->rol,
            'cargo' => $user->cargo,
            'dependencia' => $user->dependencia->nombre ?? null,
        ]);
    }

    // Listar dependencias (para formularios)
    public function dependencias()
    {
        $dependencias = \App\Models\Dependencia::select('id', 'nombre')->get();

        return response()->json($dependencias);
    }

    // Listar personas de una dependencia
    public function personasPorDependencia($dependenciaId)
    {
        $personas = User::where('dependencia_id', $dependenciaId)
            ->where('activo', true)
            ->select('id', 'nombre', 'apellido_paterno', 'apellido_materno', 'cargo')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'nombre_completo' => $p->nombre_completo,
                    'cargo' => $p->cargo,
                ];
            });

        return response()->json($personas);
    }
}