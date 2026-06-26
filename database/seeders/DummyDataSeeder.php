<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\StoreService;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleDetail;
use App\Models\VehicleImage;
use App\Models\VehicleMark;
use App\Models\VehicleType;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DummyDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
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
                'email_verified_at' => '2026-06-25'
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
                'primary_color' => '#1e1b4b',
                'secondary_color' => '#6366f1',
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
                'primary_color' => '#0f172a',
                'secondary_color' => '#10b981',
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

        // Services for HQ
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

        // Services for Norte
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

        // Add subscriptions
        $plan = Plan::where('slug', 'premium')->first();
        if ($plan) {
            Subscription::updateOrCreate(
                ['store_id' => $storeHq->id],
                [
                    'plan_id' => $plan->id,
                    'status' => 'trialing',
                    'trial_ends_at' => now()->addDays($plan->trial_days),
                ]
            );

            Subscription::updateOrCreate(
                ['store_id' => $storeNorte->id],
                [
                    'plan_id' => $plan->id,
                    'status' => 'trialing',
                    'trial_ends_at' => now()->addDays($plan->trial_days),
                ]
            );
        }

        // 3. Get Types and Marks for Vehicles
        $autoType = VehicleType::where('slug', 'auto')->first();
        $motocicletaType = VehicleType::where('slug', 'motocicleta')->first();
        $camionetaType = VehicleType::where('slug', 'camioneta')->first();

        $toyotaMark = VehicleMark::where('slug', 'toyota')->first();
        $fordMark = VehicleMark::where('slug', 'ford')->first();
        $yamahaMark = VehicleMark::where('slug', 'yamaha')->first();

        // Seed vehicles if types and marks exist
        if ($autoType && $toyotaMark) {
            $corolla = Vehicle::updateOrCreate(
                ['plate' => 'AA123BB'],
                [
                    'store_id' => $storeHq->id,
                    'vehicle_type_id' => $autoType->id,
                    'vehicle_mark_id' => $toyotaMark->id,
                    'model' => 'Corolla',
                    'year' => 2022,
                    'price' => 25000.00,
                    'currency' => 'USD',
                    'cover_image' => 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800',
                    'engine' => '2.0L Dynamic Force',
                    'fuel_type' => 'Nafta',
                    'mileage' => 15000,
                    'description' => 'Excelente estado, único dueño, services oficiales.',
                    'status' => 'available',
                    'cost_price' => 20000.00,
                ]
            );

            $corollaDetails = [
                'Carrocería' => 'Sedán',
                'Cantidad de Puertas' => '4',
            ];
            foreach ($corollaDetails as $lbl => $val) {
                VehicleDetail::updateOrCreate(
                    ['vehicle_id' => $corolla->id, 'label' => $lbl],
                    ['value' => $val]
                );
            }

            VehicleImage::updateOrCreate(
                ['vehicle_id' => $corolla->id, 'path' => 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800'],
                ['sort_order' => 1]
            );
        }

        if ($motocicletaType && $yamahaMark) {
            $fz25 = Vehicle::updateOrCreate(
                ['plate' => '999CCC'],
                [
                    'store_id' => $storeHq->id,
                    'vehicle_type_id' => $motocicletaType->id,
                    'vehicle_mark_id' => $yamahaMark->id,
                    'model' => 'FZ25',
                    'year' => 2023,
                    'price' => 4500.00,
                    'currency' => 'USD',
                    'cover_image' => 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
                    'engine' => '249cc BlueFlex',
                    'fuel_type' => 'Nafta',
                    'mileage' => 2000,
                    'description' => 'Moto ideal para uso diario, consumo bajísimo.',
                    'status' => 'available',
                    'cost_price' => 3500.00,
                ]
            );

            $fz25Details = [
                'Cilindrada' => '249cc',
                'Estilo' => 'Naked',
            ];
            foreach ($fz25Details as $lbl => $val) {
                VehicleDetail::updateOrCreate(
                    ['vehicle_id' => $fz25->id, 'label' => $lbl],
                    ['value' => $val]
                );
            }

            VehicleImage::updateOrCreate(
                ['vehicle_id' => $fz25->id, 'path' => 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'],
                ['sort_order' => 1]
            );
        }

        if ($camionetaType && $fordMark) {
            $ranger = Vehicle::updateOrCreate(
                ['plate' => 'DD456EE'],
                [
                    'store_id' => $storeNorte->id,
                    'vehicle_type_id' => $camionetaType->id,
                    'vehicle_mark_id' => $fordMark->id,
                    'model' => 'Ranger',
                    'year' => 2021,
                    'price' => 35000.00,
                    'currency' => 'USD',
                    'cover_image' => 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
                    'engine' => '3.2L Puma TDCI',
                    'fuel_type' => 'Diesel',
                    'mileage' => 45000,
                    'description' => 'Camioneta 4x4 lista para trabajar y viajar.',
                    'status' => 'available',
                    'cost_price' => 29000.00,
                ]
            );

            $rangerDetails = [
                'Tipo de Cabina' => 'Doble',
                'Tracción' => '4x4 Alta y Baja',
            ];
            foreach ($rangerDetails as $lbl => $val) {
                VehicleDetail::updateOrCreate(
                    ['vehicle_id' => $ranger->id, 'label' => $lbl],
                    ['value' => $val]
                );
            }

            VehicleImage::updateOrCreate(
                ['vehicle_id' => $ranger->id, 'path' => 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'],
                ['sort_order' => 1]
            );
        }
    }
}
