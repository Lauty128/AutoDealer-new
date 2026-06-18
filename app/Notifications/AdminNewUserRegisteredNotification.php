<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminNewUserRegisteredNotification extends Notification
{
    use Queueable;

    public User $user;

    /**
     * Create a new notification instance.
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(mixed $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(mixed $notifiable): MailMessage
    {
        $adminDashboardUrl = url('/admin/dashboard');

        return (new MailMessage)
            ->subject('Nuevo usuario registrado en AutoDealer')
            ->greeting('¡Hola, Admin!')
            ->line('Se ha registrado un nuevo usuario en la plataforma AutoDealer con los siguientes datos:')
            ->line('• Nombre: ' . $this->user->name)
            ->line('• Email: ' . $this->user->email)
            ->line('• Teléfono: ' . ($this->user->phone ?: 'No provisto'))
            ->line('• Fecha de registro: ' . ($this->user->created_at ? $this->user->created_at->setTimezone('America/Argentina/Buenos_Aires')->format('d/m/Y H:i') : now()->format('d/m/Y H:i')))
            ->action('Ver Panel de Administración', $adminDashboardUrl)
            ->line('Gracias por utilizar AutoDealer.');
    }
}
