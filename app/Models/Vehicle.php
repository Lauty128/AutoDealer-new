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
        'slug',
        'year',
        'price',
        'currency',
        'cover_image',
        'plate',
        'engine',
        'fuel_type',
        'mileage',
        'description',
        'status',
        'cost_price',
    ];

    /**
     * Boot the model events.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($vehicle) {
            if (empty($vehicle->slug) || $vehicle->isDirty('model') || $vehicle->isDirty('vehicle_mark_id') || $vehicle->isDirty('year')) {
                $vehicle->generateSlug();
            }
        });
    }

    /**
     * Generate unique slug within store context.
     */
    public function generateSlug()
    {
        $brandName = $this->mark ? $this->mark->name : '';
        if (!$brandName && $this->vehicle_mark_id) {
            $brandName = VehicleMark::find($this->vehicle_mark_id)?->name ?? '';
        }

        $baseSlug = \Illuminate\Support\Str::slug($brandName . ' ' . $this->model . ' ' . $this->year);
        if (empty($baseSlug)) {
            $baseSlug = 'vehiculo';
        }

        $slug = $baseSlug;
        $counter = 1;

        while (self::where('store_id', $this->store_id)
            ->where('slug', $slug)
            ->where('id', '!=', $this->id)
            ->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        $this->slug = $slug;
    }

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
