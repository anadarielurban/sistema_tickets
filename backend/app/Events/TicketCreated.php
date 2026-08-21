<?php

namespace App\Events;

use App\Models\Ticket;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * El ticket recién creado.
     *
     * @var \App\Models\Ticket
     */
    public $ticket;

    /**
     * El nombre del usuario que creó el ticket.
     *
     * @var string
     */
    public $userName;

    /**
     * El rol del usuario que creó el ticket (admin, tecnico, cliente).
     *
     * @var string
     */
    public $userRole;

    /**
     * Create a new event instance.
     *
     * @param  \App\Models\Ticket  $ticket
     * @param  string  $userName
     * @param  string  $userRole
     * @return void
     */
    public function __construct(Ticket $ticket, string $userName, string $userRole)
    {
        $this->ticket = $ticket;
        $this->userName = $userName;
        $this->userRole = $userRole;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\PrivateChannel
     */
    public function broadcastOn()
    {
        // Canal privado para tickets (solo admins y técnicos)
        return new PrivateChannel('tickets');
    }

    /**
     * The event's broadcast name.
     * (Opcional: personaliza el nombre del evento en el frontend)
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'ticket.created';
    }

    /**
     * Get the data to broadcast.
     * Enviamos solo la información necesaria para la notificación.
     *
     * @return array
     */
    public function broadcastWith()
    {
        return [
            'id'          => $this->ticket->id,
            'title'       => $this->ticket->title,
            'user_name'   => $this->userName,
            'user_role'   => $this->userRole,
            'created_at'  => $this->ticket->created_at->diffForHumans(),
            'priority'    => $this->ticket->priority ?? 'normal',
            'category'    => $this->ticket->category ?? 'general',
        ];
    }
}