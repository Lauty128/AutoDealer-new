<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::updateOrCreate(
            ['slug' => 'premium'],
            [
                'name' => 'Plan Premium',
                'description' => 'Acceso ilimitado a plantillas, carga de vehículos e historial de facturación simplificado.',
                'price' => 16000.00,
                'currency' => 'ARS',
                'billing_period' => 'monthly',
                'trial_days' => 90, // 3 months trial
                'is_active' => true,
                'is_default' => true,
            ]
        );
    }
}
