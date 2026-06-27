<?php

namespace Database\Seeders;

use App\Models\VehicleFuel;
use Illuminate\Database\Seeder;

class VehicleFuelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fuels = ['Nafta', 'Diesel', 'Híbrido', 'Eléctrico', 'GNC'];
        foreach ($fuels as $fuelName) {
            VehicleFuel::updateOrCreate(['name' => $fuelName]);
        }
    }
}
