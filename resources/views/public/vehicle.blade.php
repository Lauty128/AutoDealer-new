<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    @php
        $formattedPrice = ($vehicle->currency === 'USD' ? 'US$' : '$') . ' ' . number_format($vehicle->price, 0, ',', '.');
        
        $formattedMileage = $vehicle->mileage !== null 
            ? number_format($vehicle->mileage, 0, ',', '.') . ' km' 
            : 'N/A';
            
        $seoTitle = $vehicle->mark->name . " " . $vehicle->model . " (" . $vehicle->year . ") • " . $store->name;
        $seoDesc = "Ficha técnica de " . $vehicle->mark->name . " " . $vehicle->model . " año " . $vehicle->year . ". Kilometraje: " . $formattedMileage . ". Combustible: " . ($vehicle->fuel_type ?: 'N/A') . ". Precio: " . $formattedPrice . " en " . $store->name . ".";
    @endphp

    <title>{{ $seoTitle }}</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800" rel="stylesheet" />

    <!-- SEO Meta Tags -->
    <meta name="description" content="{{ $seoDesc }}">
    <meta name="keywords" content="autos, vehiculos, ficha tecnica, {{ $vehicle->mark->name }}, {{ $vehicle->model }}, {{ $store->name }}">
    
    <!-- Open Graph (Facebook / WhatsApp / LinkedIn) -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ $vehicle->mark->name }} {{ $vehicle->model }} ({{ $vehicle->year }})">
    <meta property="og:description" content="{{ $seoDesc }}">
    <meta property="og:image" content="{{ $vehicle->cover_image ?: asset('assets/logo.png') }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:site_name" content="{{ $store->name }} - AutoDealer">

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $vehicle->mark->name }} {{ $vehicle->model }} ({{ $vehicle->year }})">
    <meta name="twitter:description" content="{{ $seoDesc }}">
    <meta name="twitter:image" content="{{ $vehicle->cover_image ?: asset('assets/logo.png') }}">

    <!-- CSS and assets -->
    @vite(['resources/css/app.css'])

    <!-- Custom Store Colors and Injected Styles -->
    <style>
        :root {
            --store-primary: {{ $store->primary_color ?: '#0f172a' }};
            --store-secondary: {{ $store->secondary_color ?: '#4f46e5' }};
        }
        .bg-store-primary { background-color: var(--store-primary); }
        .text-store-primary { color: var(--store-primary); }
        .border-store-primary { border-color: var(--store-primary); }
        
        .bg-store-secondary { background-color: var(--store-secondary); }
        .text-store-secondary { color: var(--store-secondary); }
        .border-store-secondary { border-color: var(--store-secondary); }
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
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <a href="{{ route('public.catalog', $store->id) }}" class="flex items-center gap-3">
                    @if($store->logo)
                        <img src="{{ $store->logo }}" alt="{{ $store->name }}" class="h-10 w-10 rounded-lg object-cover border border-slate-200" />
                    @else
                        <div class="bg-store-primary text-white font-bold h-10 w-10 rounded-lg flex items-center justify-center">
                            {{ strtoupper(substr($store->name, 0, 2)) }}
                        </div>
                    @endif
                    <div>
                        <h1 class="font-extrabold text-base tracking-tight text-slate-900 leading-tight">{{ $store->name }}</h1>
                        <p class="text-[10px] text-slate-500 font-medium">Catálogo Digital Oficial</p>
                    </div>
                </a>
            </div>

            @if($store->phone)
                <a href="tel:{!! preg_replace('/\D/', '', $store->phone) !!}" 
                   class="bg-store-primary text-white hover:bg-slate-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.5 19.5 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span class="hidden sm:inline">Llamar Ahora</span>
                </a>
            @endif
        </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        
        <!-- Back Link and Navigation -->
        <div class="flex items-center justify-between border-b border-slate-200 pb-4">
            <a href="{{ route('public.catalog', $store->id) }}" 
               class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 text-xs font-bold shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Volver al catálogo
            </a>
            <span class="text-[10px] uppercase font-black tracking-widest text-indigo-600" style="color: var(--store-secondary)">
                AutoDealer Showroom
            </span>
        </div>

        <!-- Vehicle Details Card -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            <!-- Gallery Showcase Component -->
            <div class="relative bg-slate-950 aspect-video w-full max-h-[450px]">
                <img id="main-image-display" src="{{ $vehicle->cover_image }}" alt="{{ $vehicle->model }}" class="w-full h-full object-cover" />
                
                <!-- Status Badge -->
                <span class="absolute top-4 right-4 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white shadow-md {{
                    $vehicle->status === 'available' ? 'bg-green-600' : (
                    $vehicle->status === 'reserved' ? 'bg-amber-500' : 'bg-red-600')
                }}">
                    {{ $vehicle->status === 'available' ? 'Disponible' : (
                       $vehicle->status === 'reserved' ? 'Reservado' : 'Vendido') }}
                </span>
            </div>

            <!-- Thumbnail Swapper (Vanilla JS Integration) -->
            @if($vehicle->images && $vehicle->images->isNotEmpty())
                <div class="flex gap-2 p-3 overflow-x-auto bg-slate-900 border-b border-slate-800 shrink-0">
                    <button onclick="swapMainImage('{{ $vehicle->cover_image }}', this)" 
                            class="relative h-12 w-20 rounded overflow-hidden shrink-0 border-2 border-store-secondary bg-slate-800 transition-all thumbnail-btn active-thumb">
                        <img src="{{ $vehicle->cover_image }}" class="h-full w-full object-cover" />
                    </button>
                    @foreach($vehicle->images as $img)
                        <button onclick="swapMainImage('{{ $img->path }}', this)" 
                                class="relative h-12 w-20 rounded overflow-hidden shrink-0 border-2 border-transparent bg-slate-800 transition-all thumbnail-btn">
                            <img src="{{ $img->path }}" class="h-full w-full object-cover" />
                        </button>
                    @endforeach
                </div>
            @endif

            <!-- Body Details -->
            <div class="p-6 space-y-6">
                
                <!-- Model Header Info -->
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                {{ $vehicle->type->name }}
                            </span>
                            <span class="text-xs font-bold text-store-secondary uppercase tracking-wider">
                                {{ $vehicle->mark->name }}
                            </span>
                        </div>
                        <h2 class="text-3xl font-black text-slate-950 mt-1 leading-tight">
                            {{ $vehicle->model }}
                        </h2>
                        @if($vehicle->plate)
                            <p class="text-xs text-slate-400 mt-1 font-mono uppercase">Patente / Matrícula: <strong class="text-slate-700">{{ $vehicle->plate }}</strong></p>
                        @endif
                    </div>

                    <div class="text-left sm:text-right shrink-0">
                        <span class="text-xs text-slate-400 font-semibold block">Precio de Lista</span>
                        <span class="text-3xl font-black text-indigo-950 leading-none block" style="color: var(--store-primary)">
                            {{ $formattedPrice }}
                        </span>
                        @if($vehicle->currency === 'USD' && $store->currency !== 'USD' && $store->usd_exchange_rate > 0)
                            <span class="text-xs font-semibold text-slate-500 block mt-1">
                                ({{ ($store->currency === 'ARS' ? '$' : $store->currency) . ' ' . number_format($vehicle->price * $store->usd_exchange_rate, 0, ',', '.') }})
                            </span>
                        @endif
                    </div>
                </div>

                <!-- Specs Technical Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div class="space-y-0.5">
                        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Año Modelo</span>
                        <p class="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-store-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            {{ $vehicle->year }}
                        </p>
                    </div>
                    <div class="space-y-0.5">
                        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kilometraje</span>
                        <p class="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-store-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                            {{ $formattedMileage }}
                        </p>
                    </div>
                    <div class="space-y-0.5">
                        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Combustible</span>
                        <p class="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 capitalize">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-store-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h1"/></svg>
                            {{ $vehicle->fuel_type ?: 'N/A' }}
                        </p>
                    </div>
                    <div class="space-y-0.5">
                        <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Especificación Motor</span>
                        <p class="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 truncate" title="{{ $vehicle->engine }}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-store-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg>
                            {{ $vehicle->engine ?: 'N/A' }}
                        </p>
                    </div>
                </div>

                <!-- Description / notes section -->
                @if($vehicle->description)
                    <div class="space-y-1.5">
                        <h4 class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Descripción del Concesionario</h4>
                        <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                            {{ $vehicle->description }}
                        </p>
                    </div>
                @endif

                <!-- Additional Specs Templates -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 bg-white p-2 rounded-xl">
                    <div class="flex justify-between items-center py-2.5 border-b border-slate-100 text-sm">
                        <span class="text-slate-500 font-semibold">Suspensión</span>
                        <span class="font-bold text-slate-800">{{ $vehicle->suspension ?: 'Estándar' }}</span>
                    </div>
                    @foreach($vehicle->details as $detail)
                        @if($detail->value)
                            <div class="flex justify-between items-center py-2.5 border-b border-slate-100 text-sm">
                                <span class="text-slate-500 font-semibold capitalize">
                                    {{ str_replace('_', ' ', $detail->label) }}
                                </span>
                                <span class="font-bold text-slate-800">
                                    {{ $detail->value }}
                                </span>
                            </div>
                        @endif
                    @endforeach
                </div>

                <!-- Action Query: WhatsApp contact button -->
                <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                    @php
                        $phone = $store->whatsapp ?: $store->phone ?: '';
                        $cleanPhone = preg_replace('/\D/', '', $phone);
                        $message = "Hola! Estoy interesado en el vehículo " . $vehicle->mark->name . " " . $vehicle->model . " (" . $vehicle->year . ") publicado en su catálogo digital. ¿Está disponible?";
                        $waLink = "https://wa.me/" . $cleanPhone . "?text=" . urlencode($message);
                    @endphp
                    @if($cleanPhone)
                        <a href="{{ $waLink }}"
                           target="_blank"
                           rel="noopener noreferrer"
                           class="bg-green-600 hover:bg-green-700 text-white font-bold text-center px-6 py-3.5 rounded-xl shadow-md transition-colors flex-1 flex items-center justify-center gap-2 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                            Consultar por WhatsApp
                        </a>
                    @endif
                    
                    <a href="{{ route('public.catalog', $store->id) }}" 
                       class="border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-6 py-3.5 rounded-xl transition-colors text-center text-xs flex items-center justify-center">
                        Cerrar y volver
                    </a>
                </div>

            </div>
        </div>
    </main>

    <!-- Public Footer -->
    <footer class="max-w-7xl mx-auto px-4 mt-12 text-center text-xs text-slate-400 shrink-0">
        &copy; {{ date('Y') }} {{ $store->name }}. Desarrollado con tecnología de AutoDealer. Todos los derechos reservados.
    </footer>

    <!-- Image swap javascript logic -->
    <script>
        function swapMainImage(src, element) {
            const mainImg = document.getElementById('main-image-display');
            if (mainImg) {
                mainImg.src = src;
            }
            
            // Manage active styles of thumbnails
            const buttons = document.querySelectorAll('.thumbnail-btn');
            buttons.forEach(btn => {
                btn.classList.remove('border-store-secondary');
                btn.classList.add('border-transparent');
            });
            
            // Add active border style to the selected thumbnail
            if (element) {
                element.classList.remove('border-transparent');
                element.classList.add('border-store-secondary');
            }
        }
    </script>
</body>
</html>
