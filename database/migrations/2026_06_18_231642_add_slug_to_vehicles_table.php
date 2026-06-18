<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('model');
        });

        // Generate slugs for existing vehicles
        \App\Models\Vehicle::with('mark')->chunk(100, function ($vehicles) {
            foreach ($vehicles as $vehicle) {
                $brandName = $vehicle->mark ? $vehicle->mark->name : '';
                $baseSlug = \Illuminate\Support\Str::slug($brandName . ' ' . $vehicle->model . ' ' . $vehicle->year);
                if (empty($baseSlug)) {
                    $baseSlug = 'vehiculo';
                }
                $slug = $baseSlug;
                $counter = 1;
                while (\App\Models\Vehicle::where('store_id', $vehicle->store_id)->where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter++;
                }
                $vehicle->slug = $slug;
                $vehicle->save();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
