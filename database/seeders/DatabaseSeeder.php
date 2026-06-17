<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\StoreService;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleDetail;
use App\Models\VehicleFuel;
use App\Models\VehicleImage;
use App\Models\VehicleMark;
use App\Models\VehicleType;
use App\Models\VehicleTypeTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default User
        $user = User::updateOrCreate(
            ['email' => 'lautarosilverii@gmail.com'],
            [
                'name' => 'Admin AutoDealer',
                'password' => Hash::make('12345'),
                'is_superadmin' => true,
            ]
        );

        // 2. Create Stores
        $storeHq = Store::updateOrCreate(
            ['slug' => 'autodealer-hq'],
            [
                'name' => 'AutoDealer HQ',
                'phone' => '+541112345678',
                'email' => 'hq@autodealer.com',
                'address' => 'Av. del Libertador 1234, CABA',
                'whatsapp' => '541112345678',
                'instagram' => 'https://instagram.com/autodealer_hq',
                'facebook' => 'https://facebook.com/autodealer_hq',
                'primary_color' => '#1e1b4b', // Indigo 950
                'secondary_color' => '#6366f1', // Indigo 500
                'logo' => 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=200',
                'banner' => 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1200',
                'presentation' => 'Bienvenidos a AutoDealer HQ, el concesionario líder en vehículos seleccionados de alta gama y atención de primera clase. Con más de 15 años de trayectoria, te brindamos la mejor experiencia de compra del mercado.',
                'working_hours' => [
                    'lunes_a_viernes' => '09:00 - 19:00',
                    'sabados' => '09:00 - 13:00',
                    'domingos' => 'Cerrado',
                ],
                'custom_css' => '/* Estilos premium para AutoDealer HQ */'."\n".'.store-title { font-weight: 800; text-transform: uppercase; }',
            ]
        );

        $storeNorte = Store::updateOrCreate(
            ['slug' => 'autodealer-norte'],
            [
                'name' => 'AutoDealer Norte',
                'phone' => '+541187654321',
                'email' => 'norte@autodealer.com',
                'address' => 'Av. Santa Fe 5678, San Isidro',
                'whatsapp' => '541187654321',
                'instagram' => 'https://instagram.com/autodealer_norte',
                'facebook' => 'https://facebook.com/autodealer_norte',
                'primary_color' => '#0f172a', // Slate 900
                'secondary_color' => '#10b981', // Emerald 500
                'logo' => 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=200',
                'banner' => 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200',
                'presentation' => 'AutoDealer Norte es tu punto de encuentro con los vehículos más confiables de la zona norte. Contamos con un amplio stock seleccionado para cumplir con tus expectativas de movilidad y seguridad.',
                'working_hours' => [
                    'lunes_a_viernes' => '09:00 - 18:30',
                    'sabados' => '10:00 - 14:00',
                    'domingos' => 'Cerrado',
                ],
            ]
        );

        // Seed services for HQ
        $hqServices = [
            ['name' => 'Venta de vehículos nuevos y usados', 'description' => 'Contamos con un catálogo exclusivo de vehículos cero kilómetro y usados seleccionados.', 'icon' => 'car'],
            ['name' => 'Financiación bancaria a tasa fija', 'description' => 'Planes de financiación adaptados a tu medida con aprobación inmediata.', 'icon' => 'cash'],
            ['name' => 'Toma de usados en parte de pago', 'description' => 'Evaluamos tu vehículo usado al mejor precio del mercado para que te lleves tu nuevo auto.', 'icon' => 'arrow-left-right'],
            ['name' => 'Servicio integral de gestoría', 'description' => 'Nos encargamos de toda la documentación y transferencias para tu total tranquilidad.', 'icon' => 'file-text'],
            ['name' => 'Seguros y cobertura nacional', 'description' => 'Salí a la calle completamente asegurado con las mejores compañías del país.', 'icon' => 'shield'],
        ];
        foreach ($hqServices as $srv) {
            StoreService::updateOrCreate(
                ['store_id' => $storeHq->id, 'name' => $srv['name']],
                ['description' => $srv['description'], 'icon' => $srv['icon']]
            );
        }

        // Seed services for Norte
        $norteServices = [
            ['name' => 'Venta y permutas', 'description' => 'Facilitamos el cambio de tu unidad mediante permutas llave contra llave.', 'icon' => 'car'],
            ['name' => 'Financiación a sola firma', 'description' => 'Financiá tu vehículo presentando únicamente tu DNI.', 'icon' => 'signature'],
            ['name' => 'Consignaciones seguras', 'description' => 'Dejanos tu auto y nosotros nos encargamos de venderlo de forma segura y rápida.', 'icon' => 'shield-check'],
            ['name' => 'Prueba de manejo (Test Drive)', 'description' => 'Probá tu próximo vehículo antes de decidir la compra.', 'icon' => 'gauge'],
            ['name' => 'Garantía mecánica de 6 meses', 'description' => 'Todos nuestros usados cuentan con garantía escrita de motor y transmisión.', 'icon' => 'wrench'],
        ];
        foreach ($norteServices as $srv) {
            StoreService::updateOrCreate(
                ['store_id' => $storeNorte->id, 'name' => $srv['name']],
                ['description' => $srv['description'], 'icon' => $srv['icon']]
            );
        }

        // Associate user with stores
        $user->stores()->syncWithoutDetaching([
            $storeHq->id => ['role' => 'owner'],
            $storeNorte->id => ['role' => 'manager'],
        ]);

        // 3. Create Vehicle Types
        $carType = VehicleType::updateOrCreate(
            ['slug' => 'car'],
            ['name' => 'Car']
        );

        $motorcycleType = VehicleType::updateOrCreate(
            ['slug' => 'motorcycle'],
            ['name' => 'Motorcycle']
        );

        $truckType = VehicleType::updateOrCreate(
            ['slug' => 'truck'],
            ['name' => 'Truck']
        );

        // 4. Create Vehicle Marks
        $toyotaMark = VehicleMark::updateOrCreate(
            ['slug' => 'toyota'],
            ['name' => 'Toyota']
        );

        $fordMark = VehicleMark::updateOrCreate(
            ['slug' => 'ford'],
            ['name' => 'Ford']
        );

        $chevroletMark = VehicleMark::updateOrCreate(
            ['slug' => 'chevrolet'],
            ['name' => 'Chevrolet']
        );

        $yamahaMark = VehicleMark::updateOrCreate(
            ['slug' => 'yamaha'],
            ['name' => 'Yamaha']
        );

        $hondaMark = VehicleMark::updateOrCreate(
            ['slug' => 'honda'],
            ['name' => 'Honda']
        );

        // 4b. Seed Vehicle Fuels
        $fuels = ['Nafta', 'Diesel', 'Híbrido', 'Eléctrico', 'GNC'];
        foreach ($fuels as $fuelName) {
            VehicleFuel::updateOrCreate(['name' => $fuelName]);
        }

        // 5. Create Vehicle Type Templates
        // Templates for Cars
        $carTemplates = [
            ['label' => 'puertas', 'type' => 'number', 'default_value' => '4', 'options' => null],
            ['label' => 'transmision', 'type' => 'select', 'default_value' => 'Manual', 'options' => ['Manual', 'Automático']],
            ['label' => 'aire_acondicionado', 'type' => 'select', 'default_value' => 'Sí', 'options' => ['Sí', 'No']],
        ];
        foreach ($carTemplates as $tpl) {
            VehicleTypeTemplate::updateOrCreate(
                ['vehicle_type_id' => $carType->id, 'label' => $tpl['label']],
                [
                    'type' => $tpl['type'],
                    'options' => $tpl['options'],
                    'default_value' => $tpl['default_value'],
                ]
            );
        }

        // Templates for Motorcycles
        $motorcycleTemplates = [
            ['label' => 'cilindrada', 'type' => 'text', 'default_value' => '150cc', 'options' => null],
            ['label' => 'arranque', 'type' => 'select', 'default_value' => 'Eléctrico', 'options' => ['Eléctrico', 'A patada', 'Ambos']],
        ];
        foreach ($motorcycleTemplates as $tpl) {
            VehicleTypeTemplate::updateOrCreate(
                ['vehicle_type_id' => $motorcycleType->id, 'label' => $tpl['label']],
                [
                    'type' => $tpl['type'],
                    'options' => $tpl['options'],
                    'default_value' => $tpl['default_value'],
                ]
            );
        }

        // 6. Create Vehicles
        // Vehicle 1: Toyota Corolla (Car) in HQ
        $corolla = Vehicle::updateOrCreate(
            ['plate' => 'AA123BB'],
            [
                'store_id' => $storeHq->id,
                'vehicle_type_id' => $carType->id,
                'vehicle_mark_id' => $toyotaMark->id,
                'model' => 'Corolla',
                'year' => 2022,
                'price' => 25000.00,
                'currency' => 'USD',
                'cover_image' => 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800',
                'engine' => '2.0L Dynamic Force',
                'suspension' => 'Independent MacPherson',
                'fuel_type' => 'Nafta',
                'mileage' => 15000,
                'description' => 'Excelente estado, único dueño, services oficiales.',
                'status' => 'available',
                'cost_price' => 20000.00,
            ]
        );

        // Details for Corolla
        $corollaDetails = [
            'puertas' => '4',
            'transmision' => 'Automático',
            'aire_acondicionado' => 'Sí',
        ];
        foreach ($corollaDetails as $lbl => $val) {
            VehicleDetail::updateOrCreate(
                ['vehicle_id' => $corolla->id, 'label' => $lbl],
                ['value' => $val]
            );
        }

        // Images for Corolla
        VehicleImage::updateOrCreate(
            ['vehicle_id' => $corolla->id, 'path' => 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800'],
            ['sort_order' => 1]
        );

        // Vehicle 2: Yamaha FZ25 (Motorcycle) in HQ
        $fz25 = Vehicle::updateOrCreate(
            ['plate' => '999CCC'],
            [
                'store_id' => $storeHq->id,
                'vehicle_type_id' => $motorcycleType->id,
                'vehicle_mark_id' => $yamahaMark->id,
                'model' => 'FZ25',
                'year' => 2023,
                'price' => 4500.00,
                'currency' => 'USD',
                'cover_image' => 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
                'engine' => '249cc BlueFlex',
                'suspension' => 'Telescopic Fork',
                'fuel_type' => 'Nafta',
                'mileage' => 2000,
                'description' => 'Moto ideal para uso diario, consumo bajísimo.',
                'status' => 'available',
                'cost_price' => 3500.00,
            ]
        );

        // Details for FZ25
        $fz25Details = [
            'cilindrada' => '249cc',
            'arranque' => 'Eléctrico',
        ];
        foreach ($fz25Details as $lbl => $val) {
            VehicleDetail::updateOrCreate(
                ['vehicle_id' => $fz25->id, 'label' => $lbl],
                ['value' => $val]
            );
        }

        // Images for FZ25
        VehicleImage::updateOrCreate(
            ['vehicle_id' => $fz25->id, 'path' => 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'],
            ['sort_order' => 1]
        );

        // Vehicle 3: Ford Ranger (Truck) in Norte
        $ranger = Vehicle::updateOrCreate(
            ['plate' => 'DD456EE'],
            [
                'store_id' => $storeNorte->id,
                'vehicle_type_id' => $truckType->id,
                'vehicle_mark_id' => $fordMark->id,
                'model' => 'Ranger',
                'year' => 2021,
                'price' => 35000.00,
                'currency' => 'USD',
                'cover_image' => 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
                'engine' => '3.2L Puma TDCI',
                'suspension' => 'Leaf spring rear suspension',
                'fuel_type' => 'Diesel',
                'mileage' => 45000,
                'description' => 'Camioneta 4x4 lista para trabajar y viajar.',
                'status' => 'available',
                'cost_price' => 29000.00,
            ]
        );

        // Details for Ranger
        $rangerDetails = [
            'transmision' => 'Automático',
            'traccion' => '4x4',
            'aire_acondicionado' => 'Sí',
        ];
        foreach ($rangerDetails as $lbl => $val) {
            VehicleDetail::updateOrCreate(
                ['vehicle_id' => $ranger->id, 'label' => $lbl],
                ['value' => $val]
            );
        }

        // Images for Ranger
        VehicleImage::updateOrCreate(
            ['vehicle_id' => $ranger->id, 'path' => 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'],
            ['sort_order' => 1]
        );
    }
}
