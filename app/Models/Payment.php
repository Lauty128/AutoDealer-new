<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'subscription_id',
        'amount',
        'currency',
        'status', // approved, pending, rejected
        'mercadopago_payment_id',
        'mercadopago_preference_id',
        'payment_type',
        'paid_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    /**
     * Get the store that made the payment.
     */
    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Get the subscription associated with this payment.
     */
    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }
}
