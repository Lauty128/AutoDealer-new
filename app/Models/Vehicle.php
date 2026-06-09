<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'store_id',
        'vehicle_type_id',
        'vehicle_mark_id',
        'model',
        'year',
        'price',
        'currency',
        'cover_image',
        'plate',
        'engine',
        'suspension',
        'fuel_type',
        'mileage',
        'description',
        'status',
    ];

    /**
     * Get the store that owns this vehicle.
     */
    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Get the type of this vehicle.
     */
    public function type()
    {
        return $this->belongsTo(VehicleType::class, 'vehicle_type_id');
    }

    /**
     * Get the brand/mark of this vehicle.
     */
    public function mark()
    {
        return $this->belongsTo(VehicleMark::class, 'vehicle_mark_id');
    }

    /**
     * Get the dynamic details of this vehicle.
     */
    public function details()
    {
        return $this->hasMany(VehicleDetail::class, 'vehicle_id');
    }

    /**
     * Get the images for this vehicle.
     */
    public function images()
    {
        return $this->hasMany(VehicleImage::class, 'vehicle_id');
    }
}
