<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VehicleType;
use App\Models\VehicleTypeTemplate;
use Illuminate\Support\Str;

class VehicleTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiposVehiculos = [
            [
                'name' => 'Auto',
                'description' => 'Vehículos de uso particular, ciudad y ruta.',
                'templates' => [
                    ['attribute_name' => 'Carrocería', 'default_value' => 'Hatchback / Sedán / Rural'],
                    ['attribute_name' => 'Capacidad de Baúl', 'default_value' => 'Litros'],
                    ['attribute_name' => 'Cantidad de Puertas', 'default_value' => '3 / 4 / 5'],
                ]
            ],
            [
                'name' => 'SUV',
                'description' => 'Vehículos utilitarios deportivos.',
                'templates' => [
                    ['attribute_name' => 'Tracción', 'default_value' => '4x2 / 4x4 / AWD'],
                    ['attribute_name' => 'Filas de Asientos', 'default_value' => '2 Filas (5 plazas) / 3 Filas (7 plazas)'],
                    ['attribute_name' => 'Despeje del Suelo', 'default_value' => 'Milímetros (mm)'],
                ]
            ],
            [
                'name' => 'Camioneta',
                'description' => 'Pick-ups para uso particular, campo o trabajo pesado.',
                'templates' => [
                    ['attribute_name' => 'Tipo de Cabina', 'default_value' => 'Simple / Extendida / Doble'],
                    ['attribute_name' => 'Tracción', 'default_value' => '4x2 / 4x4 Alta y Baja'],
                    ['attribute_name' => 'Capacidad de Carga', 'default_value' => 'Kilogramos (Kg)'],
                    ['attribute_name' => 'Cobertor / Lona de Caja', 'default_value' => 'Sí / No'],
                ]
            ],
            [
                'name' => 'Camión',
                'description' => 'Vehículos pesados para transporte de cargas y logística.',
                'templates' => [
                    ['attribute_name' => 'Configuración de Ejes', 'default_value' => '4x2 / 6x2 / 6x4 / 8x4'],
                    ['attribute_name' => 'Tipo de Acoplado / Chasis', 'default_value' => 'Tractor (Cabina) / Chasis Rígido / Tolva'],
                    ['attribute_name' => 'Capacidad de Remolque', 'default_value' => 'Toneladas (Tn)'],
                    ['attribute_name' => 'Tipo de Freno', 'default_value' => 'Aire / Motor / Retardador'],
                ]
            ],
            [
                'name' => 'Motocicleta',
                'description' => 'Vehículos de dos ruedas para ciudad, ruta o enduro.',
                'templates' => [
                    ['attribute_name' => 'Cilindrada', 'default_value' => 'Centímetros Cúbicos (cc)'],
                    ['attribute_name' => 'Estilo', 'default_value' => 'Street / Naked / Pista / Enduro / Scooter'],
                    ['attribute_name' => 'Tiempos del Motor', 'default_value' => '2 Tiempos / 4 Tiempos'],
                    ['attribute_name' => 'Refrigeración', 'default_value' => 'Aire / Líquida'],
                ]
            ],
        ];

        foreach ($tiposVehiculos as $tipoData) {
            // Creamos el Tipo de Vehículo con name y slug
            $tipo = VehicleType::updateOrCreate([
                'slug' => Str::slug($tipoData['name'])
            ], [
                'name' => $tipoData['name']
            ]);

            // Insertamos los Templates atados a este Tipo
            foreach ($tipoData['templates'] as $template) {
                $defaultValue = $template['default_value'];
                $type = 'text';
                $options = null;

                // Si contiene " / ", lo convertimos en un campo 'select' con opciones parsed
                if (str_contains($defaultValue, ' / ')) {
                    $type = 'select';
                    $options = array_map('trim', explode('/', $defaultValue));
                }

                VehicleTypeTemplate::updateOrCreate([
                    'vehicle_type_id' => $tipo->id,
                    'label'  => $template['attribute_name']
                ], [
                    'type' => $type,
                    'options' => $options,
                    'default_value' => $defaultValue
                ]);
            }
        }
    }
}
