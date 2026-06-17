<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'currency',
        'billing_period',
        'trial_days',
        'is_active',
    ];

    /**
     * Get the subscriptions associated with this plan.
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
