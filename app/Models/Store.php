<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'phone',
        'email',
        'address',
        'province',
        'city',
        'whatsapp',
        'instagram',
        'facebook',
        'tiktok',
        'website',
        'logo',
        'banner',
        'primary_color',
        'secondary_color',
        'custom_css',
        'presentation',
        'working_hours',
        'map_iframe',
        'currency',
        'usd_exchange_rate',
        'meta_title',
        'meta_description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'working_hours' => 'array',
        'usd_exchange_rate' => 'decimal:2',
    ];

    /**
     * Get the users associated with this store.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'stores_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get the services offered by this store.
     */
    public function services()
    {
        return $this->hasMany(StoreService::class);
    }

    /**
     * Get the vehicles associated with this store.
     */
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    /**
     * Get all subscriptions for this store.
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the current active/latest subscription for this store.
     */
    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }
}
