<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Estructura y datos estáticos necesarios tanto para Producción como Local
        $this->call([
            PlanSeeder::class,
            VehicleFuelSeeder::class,
            VehicleMarkSeeder::class,
            VehicleTypeSeeder::class, // Con los tipos de vehículos y plantillas que actualizaste
        ]);

        // 2. Datos ficticios de prueba (Usuarios, Concesionarios y Vehículos)
        // Se cargan automáticamente solo si estamos en entorno local o de pruebas
        if (app()->environment('local', 'testing')) {
            $this->call([
                DummyDataSeeder::class,
            ]);
        }
    }
}
