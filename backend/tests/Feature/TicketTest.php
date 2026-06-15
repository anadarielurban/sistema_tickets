<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TicketTest extends TestCase
{
    use RefreshDatabase;

    public function test_crear_ticket()
    {
        $user = User::factory()->create(['rol' => 'solicitante']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/tickets', [
                'solicitante_id' => $user->id,
                'dependencia_id' => 1,
                'tipo' => 'computadora',
                'titulo' => 'PC no enciende',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);
    }

    public function test_solo_auxiliar_puede_tomar_ticket()
    {
        $auxiliar = User::factory()->create(['rol' => 'auxiliar']);
        $ticket = Ticket::factory()->create(['estado' => 'pendiente']);
        $token = $auxiliar->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/tickets/{$ticket->id}/tomar");

        $response->assertStatus(200);
        $this->assertEquals('en_proceso', $ticket->fresh()->estado);
    }
}