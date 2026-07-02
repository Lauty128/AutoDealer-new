<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ $store->name }} - Catálogo Digital Oficial</title>

    @if($store->logo)
        <link rel="icon" type="image/*" href="{{ $store->logo }}">
    @else
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    @endif

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800" rel="stylesheet" />

    <!-- Meta Tags for SEO -->
    <meta name="description"
        content="{{ $store->presentation ?: 'Explora nuestro stock seleccionado de vehículos y encuentra tu próximo auto.' }}">
    <meta name="keywords" content="concesionario, autos, vehiculos, stock, {{ $store->name }}">

    <!-- CSS and assets -->
    @vite(['resources/css/app.css'])

    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">

    <!-- Custom Store Colors and Injected Styles -->
    <style>
        :root {
            --store-primary:
                {{ $store->primary_color ?: '#0f172a' }}
            ;
            --store-secondary:
                {{ $store->secondary_color ?: '#4f46e5' }}
            ;
        }

        .bg-store-primary {
            background-color: var(--store-primary);
        }

        .text-store-primary {
            color: var(--store-primary);
        }

        .border-store-primary {
            border-color: var(--store-primary);
        }

        .bg-store-secondary {
            background-color: var(--store-secondary);
        }

        .text-store-secondary {
            color: var(--store-secondary);
        }

        .border-store-secondary {
            border-color: var(--store-secondary);
        }

        .hover-store-secondary-dark:hover {
            filter: brightness(0.9);
        }
    </style>

    @if($store->custom_css)
        <style>
            {!! $store->custom_css !!}
        </style>
    @endif
</head>

<body class="font-sans antialiased min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between pb-12">

    <!-- Public Header Navbar -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
        <div class="max-w-[1300px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                @if($store->logo)
                    <img src="{{ $store->logo }}" alt="{{ $store->name }}"
                        class="h-10 w-10 rounded-lg object-cover border border-slate-200" />
                @else
                    <div
                        class="bg-store-primary text-white font-bold h-10 w-10 rounded-lg flex items-center justify-center">
                        {{ strtoupper(substr($store->name, 0, 2)) }}
                    </div>
                @endif
                <div>
                    <h1 class="font-extrabold text-base tracking-tight text-slate-900 leading-tight">{{ $store->name }}
                    </h1>
                    <p class="text-[10px] text-slate-500 font-medium">Catálogo Digital Oficial</p>
                </div>
            </div>

            @if($store->phone)
                <a href="tel:{!! preg_replace('/\D/', '', $store->phone) !!}"
                    class="bg-store-primary text-white hover:bg-slate-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                    <i class="fa-solid fa-phone"></i>
                    <span class="hidden sm:inline">Llamar Ahora</span>
                </a>
            @endif
        </div>
    </header>

    <!-- Hero Cover Banner -->
    <section class="relative h-64 md:h-[300px] overflow-hidden bg-slate-950 shrink-0">
        @if($store->banner)
            <img src="{{ $store->banner }}" alt="{{ $store->name }}" class="w-full h-full object-cover opacity-90" />
        @else
            <div class="w-full h-full bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 opacity-90" />
        @endif
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        <div class="absolute bottom-6 left-6 right-6 text-white max-w-[1200px] mx-auto px-4">
            <span
                class="bg-store-secondary text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Catálogo Online
            </span>
            <h2 class="text-3xl md:text-4xl font-black mt-2 tracking-tight">{{ $store->name }}</h2>
                <p class="text-slate-200 mt-1 flex items-center gap-1 text-sm">
                    <i class="fa-solid fa-location-dot text-store-secondary shrink-0 mt-0.5"></i>
                    {{ $store->address }}{{ $store->city ? ', ' . $store->city : '' }}{{ $store->province ? ', ' . $store->province : '' }}
                </p>
        </div>
    </section>

    <!-- Main content grid -->
    <main class="max-w-[1300px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 w-full">

        <!-- Store Profile & Dynamic Filters -->
        <div class="lg:col-span-1 space-y-6">
            <!-- Presentation info -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                    <h3 class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Quiénes Somos</h3>
                    <p class="text-sm text-slate-600 mt-1.5 leading-relaxed">
                        {{ $store->presentation ?: 'Bienvenidos a nuestro concesionario oficial digital. Explora nuestro stock seleccionado.' }}
                    </p>
                </div>

                @if($store->services && $store->services->isNotEmpty())
                    <div class="border-t border-slate-100 pt-3">
                        <h3 class="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Servicios Destacados
                        </h3>
                        <div class="flex flex-wrap gap-1.5">
                            @foreach($store->services as $s)
                                <span
                                    class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium cursor-default transition-colors"
                                    title="{{ $s->description }}">
                                    {{ $s->name }}
                                </span>
                            @endforeach
                        </div>
                    </div>
                @endif
            </div>

            <!-- Dynamic Filters Form -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Filtrar Stock
                </h3>
                <form action="{{ route('public.catalog', $store->slug) }}" method="GET" class="space-y-4 text-sm">
                    <div class="space-y-1">
                        <label for="search" class="text-xs font-semibold text-slate-500 uppercase">Modelo</label>
                            <input id="search" type="text" name="search" placeholder="Ej: Corolla, Ranger..."
                                value="{{ request('search') }}"
                                class="w-full bg-slate-50 border border-slate-200 text-slate-950 text-sm rounded-lg focus:ring-store-secondary focus:border-store-secondary block pl-9 pr-2.5 py-2" />
                            <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400"></i>
                    </div>

                    <div class="space-y-1">
                        <label for="brand-filter" class="text-xs font-semibold text-slate-500 uppercase">Marca</label>
                        <select id="brand-filter" name="vehicle_mark_id"
                            class="w-full bg-slate-50 border border-slate-200 text-slate-950 text-sm rounded-lg focus:ring-store-secondary focus:border-store-secondary block p-2">
                            <option value="">Todas las marcas</option>
                            @foreach($marks as $m)
                                <option value="{{ $m->id }}" {{ request('vehicle_mark_id') == $m->id ? 'selected' : '' }}>
                                    {{ $m->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div class="space-y-1">
                        <label for="type-filter" class="text-xs font-semibold text-slate-500 uppercase">Tipo de
                            Vehículo</label>
                        <select id="type-filter" name="vehicle_type_id"
                            class="w-full bg-slate-50 border border-slate-200 text-slate-950 text-sm rounded-lg focus:ring-store-secondary focus:border-store-secondary block p-2">
                            <option value="">Todos los tipos</option>
                            @foreach($types as $t)
                                <option value="{{ $t->id }}" {{ request('vehicle_type_id') == $t->id ? 'selected' : '' }}>
                                    {{ $t->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div class="flex gap-2 pt-2 border-t border-slate-100">
                        <button type="submit"
                            class="bg-store-primary text-white w-full hover:bg-slate-800 font-semibold text-xs py-2 rounded-lg transition-colors">
                            Buscar
                        </button>
                        @if(request('search') || request('vehicle_type_id') || request('vehicle_mark_id'))
                            <a href="{{ route('public.catalog', $store->slug) }}"
                                class="border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs px-3 py-2 rounded-lg shrink-0 flex items-center justify-center">
                                Limpiar
                            </a>
                        @endif
                    </div>
                </form>
            </div>

            <!-- Contact detail information -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Información y Contacto</h3>
                <div class="space-y-3 text-slate-600">
                    @if($store->phone)
                        <div class="flex items-center gap-2.5">
                            <i class="fa-solid fa-phone text-store-secondary shrink-0 text-xs"></i>
                            <span>Teléfono: <strong>{{ $store->phone }}</strong></span>
                        </div>
                    @endif
                    @if($store->email)
                        <div class="flex items-center gap-2.5">
                            <i class="fa-regular fa-envelope text-store-secondary shrink-0 text-sm"></i>
                            <span class="truncate">Email: <strong>{{ $store->email }}</strong></span>
                        </div>
                    @endif
                        <div class="pt-2 border-t border-slate-100">
                            <p class="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                                <i class="fa-regular fa-clock text-store-secondary shrink-0"></i>
                                Horarios de Atención:
                            </p>
                            <div class="space-y-1">
                                @foreach($store->working_hours as $day => $hours)
                                    <div class="flex justify-between">
                                        <span class="capitalize text-slate-500">{{ str_replace('_', ' ', $day) }}</span>
                                        <span class="font-semibold text-slate-700">{{ $hours }}</span>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Vehicles listing catalog -->
        <div class="lg:col-span-3 space-y-4">
            <h3 class="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>Vehículos en Exhibición ({{ $vehicles->count() }})</span>
            </h3>

            @if($vehicles->isEmpty())
                <div class="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-xs">
                    <i class="fa-solid fa-circle-exclamation text-3xl text-slate-300 mx-auto mb-2 block"></i>
                    <h4 class="font-bold text-slate-700">No hay vehículos disponibles</h4>
                    <p class="text-xs text-slate-400 mt-1">Intenta ajustando los filtros de búsqueda.</p>
                </div>
            @else
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @foreach($vehicles as $vehicle)
                            @php
                                $formattedPrice = ($vehicle->currency === 'USD' ? 'US$' : '$') . ' ' . number_format($vehicle->price, 0, ',', '.');

                                $formattedMileage = $vehicle->mileage !== null
                                    ? number_format($vehicle->mileage, 0, ',', '.') . ' km'
                                    : 'N/A';
                            @endphp
                            <a href="{{ route('public.catalog', [$store->slug, $vehicle->slug]) }}"
                                class="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col group">

                                <!-- Cover Image -->
                                <div class="aspect-video relative overflow-hidden bg-slate-100 shrink-0">
                                    @if($vehicle->cover_image)
                                        <img src="{{ $vehicle->cover_image }}" alt="{{ $vehicle->mark->name }} {{ $vehicle->model }}"
                                            class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                                    @else
                                        <div class="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                            Sin Imagen de Portada
                                        </div>
                                    @endif

                                    <!-- Status Badge -->
                                    <span class="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-sm {{
                        $vehicle->status === 'available' ? 'bg-green-600/90' : (
                            $vehicle->status === 'reserved' ? 'bg-amber-500/90' :
                            'bg-red-600/90')
                                                                                                        }}">
                                        {{ $vehicle->status === 'available' ? 'Disponible' : (
                        $vehicle->status === 'reserved' ? 'Reservado' : 'Vendido') }}
                                    </span>
                                </div>

                                <!-- Card Body -->
                                <div class="p-4 flex-1 flex flex-col justify-between gap-4">
                                    <div>
                                        <div class="flex items-center justify-between gap-2">
                                            <span class="text-xs font-bold text-store-secondary uppercase tracking-wider">
                                                {{ $vehicle->mark->name }}
                                            </span>
                                            <span class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                                {{ $vehicle->type->name }}
                                            </span>
                                        </div>

                                        <h4
                                            class="font-extrabold text-base text-slate-900 mt-1 line-clamp-1 group-hover:text-store-secondary transition-colors">
                                            {{ $vehicle->model }}
                                        </h4>

                                        <!-- Technical specs -->
                                        <div
                                            class="grid grid-cols-3 gap-2 mt-3 text-slate-500 text-xs border-t border-slate-100 py-2">
                                            <div class="flex items-center gap-1" title="Año">
                                                <i class="fa-solid fa-calendar-days text-slate-400 shrink-0"></i>
                                                <span>{{ $vehicle->year }}</span>
                                            </div>
                                            <div class="flex items-center gap-1" title="Kilometraje">
                                                <i class="fa-solid fa-gauge-high text-slate-400 shrink-0"></i>
                                                <span class="truncate">{{ $formattedMileage }}</span>
                                            </div>
                                            <div class="flex items-center gap-1" title="Combustible">
                                                <i class="fa-solid fa-gas-pump text-slate-400 shrink-0"></i>
                                                <span class="capitalize truncate">{{ $vehicle->fuel_type ?: 'N/A' }}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex items-center justify-between border-t border-slate-100 pt-2">
                                        <span class="text-xs text-slate-400 font-semibold">Precio</span>
                                        <div class="text-right">
                                            <span class="text-lg font-black text-slate-900 block">
                                                {{ $formattedPrice }}
                                            </span>
                                            @if($vehicle->currency === 'USD' && $store->currency !== 'USD' && $store->usd_exchange_rate > 0)
                                                <span class="text-[10px] text-slate-500 font-medium block">
                                                    ({{ ($store->currency === 'ARS' ? '$' : $store->currency) . ' ' . number_format($vehicle->price * $store->usd_exchange_rate, 0, ',', '.') }})
                                                </span>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </a>
                    @endforeach
                </div>
            @endif
        </div>
    </main>

    <!-- Public Footer -->
    <footer class="max-w-[1200px] mx-auto px-4 mt-12 text-center text-xs text-slate-400 shrink-0">
        &copy; {{ date('Y') }} {{ $store->name }}. Desarrollado con tecnología de AutoDealer. Todos los derechos
        reservados.
    </footer>
</body>

</html>