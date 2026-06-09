<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleTypeTemplate extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'vehicles_types_templates';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'vehicle_type_id',
        'label',
        'default_value',
    ];

    /**
     * Get the vehicle type that owns this template.
     */
    public function type()
    {
        return $this->belongsTo(VehicleType::class, 'vehicle_type_id');
    }
}
