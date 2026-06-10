<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class VehicleMark extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'vehicles_marks';

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
            Cache::forget('vehicles_marks');
        });

        static::deleted(function ($model) {
            Cache::forget('vehicles_marks');
        });
    }

    /**
     * Get the vehicles of this brand/mark.
     */
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'vehicle_mark_id');
    }
}
