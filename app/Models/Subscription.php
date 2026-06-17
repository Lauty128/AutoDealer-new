<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'plan_id',
        'status', // trialing, active, pending_payment, cancelled, expired
        'trial_ends_at',
        'starts_at',
        'ends_at',
        'mercadopago_preference_id',
        'cancelled_at',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Get the store that owns this subscription.
     */
    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Get the plan for this subscription.
     */
    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Get the payments logged under this subscription.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Check if the subscription is currently active (either trialing or paid active).
     */
    public function isActive(): bool
    {
        if ($this->status === 'active') {
            return is_null($this->ends_at) || $this->ends_at->isFuture();
        }

        if ($this->status === 'trialing') {
            return $this->trial_ends_at && $this->trial_ends_at->isFuture();
        }

        return false;
    }

    /**
     * Check if the subscription is in the free trial period.
     */
    public function isTrial(): bool
    {
        return $this->status === 'trialing' && $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    /**
     * Check if the subscription is expired or cancelled/inactive.
     */
    public function isExpired(): bool
    {
        return !$this->isActive();
    }
}
