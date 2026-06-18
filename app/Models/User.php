<?php

namespace App\Models;

use App\Notifications\VerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\AdminNewUserRegisteredNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'is_superadmin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_superadmin' => 'boolean',
        ];
    }

    /**
     * Get the stores that the user has access to.
     */
    public function stores()
    {
        return $this->belongsToMany(Store::class, 'stores_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Start impersonating a store owner.
     */
    public function startImpersonation($storeId)
    {
        $this->stopImpersonation();
        $this->stores()->attach($storeId, ['role' => 'owner']);
    }

    /**
     * Stop impersonating and clean up temporary store relations.
     */
    public function stopImpersonation()
    {
        $this->stores()->detach();
    }

    /**
     * Send the email verification notification using the custom branded template.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification());

        // Notify admin about the new registration
        try {
            Notification::route('mail', 'lautarosilverii@gmail.com')
                ->notify(new AdminNewUserRegisteredNotification($this));
        } catch (\Exception $e) {
            Log::error('Error notifying admin of user registration: ' . $e->getMessage());
        }
    }
}
