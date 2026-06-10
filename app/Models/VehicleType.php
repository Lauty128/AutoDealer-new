<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class VehicleType extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'vehicles_types';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted()
    {
        static::saved(function ($model) {
            Cache::forget('vehicles_types');
        });

        static::deleted(function ($model) {
            Cache::forget('vehicles_types');
        });
    }

    /**
     * Get the vehicles of this type.
     */
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'vehicle_type_id');
    }

    /**
     * Get the default templates/labels for this type.
     */
    public function templates()
    {
        return $this->hasMany(VehicleTypeTemplate::class, 'vehicle_type_id');
    }
}
