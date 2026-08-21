<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class BotUserSeeder extends Seeder
{
    public function run()
    {
        // Buscar si ya existe un usuario con ese email
        $user = User::firstOrCreate(
            ['email' => 'bot_whatsapp@example.com'],
            [
                'name' => 'Bot WhatsApp',
                'password' => Hash::make('seguro'),
            ]
        );

        // Generar el token
        $token = $user->createToken('whatsapp-bot')->plainTextToken;

        // Mostrar en consola el token y el ID
        $this->command->info('✅ Usuario bot creado/obtenido.');
        $this->command->info('🆔 ID: ' . $user->id);
        $this->command->info('🔑 Token: ' . $token);
        $this->command->info('📌 Copia este token y este ID para tu bot.js');
    }
}