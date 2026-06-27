<?php

namespace Database\Seeders;

use App\Models\VehicleMark;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VehicleMarkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $marks = ['Toyota', 'Ford', 'Chevrolet', 'Yamaha', 'Honda'];
        foreach ($marks as $markName) {
            VehicleMark::updateOrCreate(
                ['slug' => Str::slug($markName)],
                ['name' => $markName]
            );
        }
    }
}
