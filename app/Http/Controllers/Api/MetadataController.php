<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VehicleMark;
use App\Models\VehicleType;
use App\Models\VehicleTypeTemplate;
use Illuminate\Support\Facades\Cache;

class MetadataController extends Controller
{
    /**
     * Get the cached list of vehicle marks (brands).
     */
    public function marks()
    {
        $marks = Cache::rememberForever('vehicles_marks', function () {
            return VehicleMark::orderBy('name')->get();
        });

        return response()->json([
            'data' => $marks
        ]);
    }

    /**
     * Get the cached list of vehicle types.
     */
    public function types()
    {
        $types = Cache::rememberForever('vehicles_types', function () {
            return VehicleType::orderBy('name')->get();
        });

        return response()->json([
            'data' => $types
        ]);
    }

    /**
     * Get the cached list of templates for vehicle types.
     */
    public function templates()
    {
        $templates = Cache::rememberForever('vehicles_types_templates', function () {
            return VehicleTypeTemplate::with('type')->get();
        });

        return response()->json([
            'data' => $templates
        ]);
    }
}
