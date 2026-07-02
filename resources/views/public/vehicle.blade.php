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

        $phone = $store->whatsapp ?: $store->phone ?: '';
        $cleanPhone = preg_replace('/\D/', '', $phone);
        $message = "Hola! Estoy interesado en el vehículo " . $vehicle->mark->name . " " . $vehicle->model . " (" . $vehicle->year . ") publicado en su catálogo digital. ¿Está disponible?";
        $waLink = "https://wa.me/" . $cleanPhone . "?text=" . urlencode($message);
    @endphp

    <title>{{ $seoTitle }}</title>

    @if($store->logo)
        <link rel="icon" type="image/*" href="{{ $store->logo }}">
    @else
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    @endif

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800" rel="stylesheet" />

    <!-- SEO Meta Tags -->
    <meta name="description" content="{{ $seoDesc }}">
    <meta name="keywords"
        content="autos, vehiculos, ficha tecnica, {{ $vehicle->mark->name }}, {{ $vehicle->model }}, {{ $store->name }}">

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

        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
            -ms-overflow-style: none;
            /* IE and Edge */
            scrollbar-width: none;
            /* Firefox */
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
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <a href="{{ route('public.catalog', $store->slug) }}" class="flex items-center gap-3">
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
                        <h1 class="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                            {{ $store->name }}
                        </h1>
                        <p class="text-[10px] text-slate-500 font-medium">Catálogo Digital Oficial</p>
                    </div>
                </a>
            </div>

            <div class="flex items-center gap-2">
                @if($cleanPhone)
                    <a href="{{ $waLink }}" target="_blank" rel="noopener noreferrer"
                        class="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs">
                        <i class="fa-brands fa-whatsapp text-sm"></i>
                        <span class="hidden sm:inline">WhatsApp</span>
                    </a>
                @endif

                @if($store->phone)
                    <a href="tel:{!! preg_replace('/\D/', '', $store->phone) !!}"
                        class="bg-store-primary text-white hover:bg-slate-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                        <i class="fa-solid fa-phone"></i>
                        <span class="hidden sm:inline">Llamar Ahora</span>
                    </a>
                @endif
            </div>
        </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-6">

        <!-- Back Link and Navigation -->
        <div class="flex items-center justify-between border-b border-slate-200 pb-4">
            <a href="{{ route('public.catalog', $store->slug) }}"
                class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 text-xs font-bold shrink-0">
                <i class="fa-solid fa-arrow-left"></i>
                Volver al catálogo
            </a>
            <span class="text-[10px] uppercase font-black tracking-widest text-indigo-600"
                style="color: var(--store-secondary)">
                AutoDealer Showroom
            </span>
        </div>


        <!-- Two Columns Layout Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            <!-- Left Column: Media Gallery, Technical Grid & Details (lg:col-span-2) -->
            <div class="lg:col-span-2 space-y-6">

                <!-- Vehicle Images Card -->
                <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

                    <!-- Gallery Showcase Component -->
                    <div class="relative bg-slate-950 aspect-video w-full max-h-[450px] cursor-zoom-in group overflow-hidden"
                        onclick="openLightbox()">
                        <img id="main-image-display" src="{{ $vehicle->cover_image }}" alt="{{ $vehicle->model }}"
                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" />

                        <!-- Slide counter badge on main image -->
                        <div
                            class="absolute bottom-4 left-4 bg-slate-950/70 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 z-10 pointer-events-none">
                            <i class="fa-regular fa-image text-sm"></i>
                            <span id="page-image-counter">1 /
                                {{ 1 + ($vehicle->images ? $vehicle->images->count() : 0) }}</span>
                        </div>

                        <!-- Navigation Arrows on Main Image (only visible on hover on desktop) -->
                        @if($vehicle->images && $vehicle->images->isNotEmpty())
                            <button onclick="event.stopPropagation(); prevImage();"
                                class="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-950/60 hover:bg-slate-950/80 backdrop-blur-md text-white p-2.5 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10 hidden md:block cursor-pointer">
                                <i class="fa-solid fa-chevron-left text-sm"></i>
                            </button>
                            <button onclick="event.stopPropagation(); nextImage();"
                                class="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-950/60 hover:bg-slate-950/80 backdrop-blur-md text-white p-2.5 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10 hidden md:block cursor-pointer">
                                <i class="fa-solid fa-chevron-right text-sm"></i>
                            </button>
                        @endif

                        <!-- Status Badge -->
                        <span class="absolute top-4 right-4 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white shadow-md z-10 {{
    $vehicle->status === 'available' ? 'bg-green-600' : (
        $vehicle->status === 'reserved' ? 'bg-amber-500' : 'bg-red-600')
                        }}">
                            {{ $vehicle->status === 'available' ? 'Disponible' : (
    $vehicle->status === 'reserved' ? 'Reservado' : 'Vendido') }}
                        </span>
                    </div>

                    <!-- Thumbnail Swapper -->
                    @if($vehicle->images && $vehicle->images->isNotEmpty())
                        <div
                            class="flex gap-2 p-3 overflow-x-auto bg-slate-900 border-b border-slate-800 shrink-0 no-scrollbar">
                            <button onclick="event.stopPropagation(); setActiveImage(0)"
                                class="relative h-14 w-24 rounded-xl overflow-hidden shrink-0 border-2 border-store-secondary bg-slate-800 transition-all thumbnail-btn cursor-pointer">
                                <img src="{{ $vehicle->cover_image }}" class="h-full w-full object-cover" />
                            </button>
                            @foreach($vehicle->images as $index => $img)
                                <button onclick="event.stopPropagation(); setActiveImage({{ $index + 1 }})"
                                    class="relative h-14 w-24 rounded-xl overflow-hidden shrink-0 border-2 border-transparent bg-slate-800 transition-all thumbnail-btn cursor-pointer">
                                    <img src="{{ $img->path }}" class="h-full w-full object-cover" />
                                </button>
                            @endforeach
                        </div>
                    @endif

                </div>

                <!-- Technical Details Card -->
                <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">

                    <!-- Specs Technical Grid -->
                    <div
                        class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div class="space-y-0.5">
                            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Año
                                Modelo</span>
                            <p class="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                                <i class="fa-solid fa-calendar-days text-store-secondary text-sm"></i>
                                {{ $vehicle->year }}
                            </p>
                        </div>
                        <div class="space-y-0.5">
                            <span
                                class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kilometraje</span>
                            <p class="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                                <i class="fa-solid fa-gauge-high text-store-secondary text-sm"></i>
                                {{ $formattedMileage }}
                            </p>
                        </div>
                        <div class="space-y-0.5">
                            <span
                                class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Combustible</span>
                            <p class="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 capitalize">
                                <i class="fa-solid fa-gas-pump text-store-secondary text-sm"></i>
                                {{ $vehicle->fuel_type ?: 'N/A' }}
                            </p>
                        </div>
                        <div class="space-y-0.5">
                            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Especificación
                                Motor</span>
                            <p class="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 truncate"
                                title="{{ $vehicle->engine }}">
                                <i class="fa-solid fa-microchip text-store-secondary text-sm"></i>
                                {{ $vehicle->engine ?: 'N/A' }}
                            </p>
                        </div>
                    </div>

                    <!-- Description / notes section -->
                    @if($vehicle->description)
                        <div class="space-y-1.5">
                            <h4 class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Observaciones del
                                Concesionario</h4>
                            <p
                                class="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                {{ $vehicle->description }}
                            </p>
                        </div>
                    @endif

                    <!-- Technical Details Table -->
                    @if($vehicle->details && $vehicle->details->isNotEmpty())
                        <div class="space-y-3">
                            <h4 class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Detalles Específicos
                            </h4>
                            <div
                                class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 bg-slate-50/20 p-2 rounded-2xl border border-slate-100">
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
                        </div>
                    @endif

                </div>

            </div>

            <!-- Right Column: Vehicle Price & Basic Info, Dealership info & Call to Actions (lg:col-span-1) -->
            <div class="space-y-6 lg:sticky lg:top-24">

                <!-- Vehicle Info & Price Card -->
                <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div>
                        <div class="flex items-center gap-2">
                            <span
                                class="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                {{ $vehicle->type->name }}
                            </span>
                            <span class="text-xs font-bold text-store-secondary uppercase tracking-wider">
                                {{ $vehicle->mark->name }}
                            </span>
                        </div>
                        <h2 class="text-3xl font-black text-slate-950 mt-1 leading-tight">
                            {{ $vehicle->model }}
                        </h2>
                        <div class="flex items-center gap-2 mt-2">
                            <span class="bg-indigo-50 text-indigo-700 text-xs font-extrabold px-2.5 py-1 rounded-lg"
                                style="background-color: rgba(79, 70, 229, 0.08); color: var(--store-secondary);">
                                Año {{ $vehicle->year }}
                            </span>
                            @if($vehicle->mileage)
                                <span class="text-xs text-slate-400 font-mono uppercase">
                                    <strong class="text-slate-700">{{ $formattedMileage }}</strong>
                                </span>
                            @endif
                        </div>
                    </div>

                    <div class="border-t border-slate-100 pt-4">
                        <span class="text-xs text-slate-400 font-semibold block">Precio de Lista</span>
                        <span class="text-3xl font-black text-indigo-950 leading-none block mt-0.5"
                            style="color: var(--store-primary)">
                            {{ $formattedPrice }}
                        </span>
                        @if($vehicle->currency === 'USD' && $store->currency !== 'USD' && $store->usd_exchange_rate > 0)
                            <span class="text-xs font-semibold text-slate-500 block mt-1.5">
                                ({{ ($store->currency === 'ARS' ? '$' : $store->currency) . ' ' . number_format($vehicle->price * $store->usd_exchange_rate, 0, ',', '.') }})
                            </span>
                        @endif
                    </div>
                </div>

                <!-- Dealership Info Card -->
                <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h3 class="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Concesionario</h3>

                    <div class="flex items-center gap-3">
                        @if($store->logo)
                            <img src="{{ $store->logo }}" alt="{{ $store->name }}"
                                class="h-12 w-12 rounded-xl object-cover border border-slate-200" />
                        @else
                            <div
                                class="bg-store-primary text-white font-bold h-12 w-12 rounded-xl flex items-center justify-center text-lg">
                                {{ strtoupper(substr($store->name, 0, 2)) }}
                            </div>
                        @endif
                        <div>
                            <h4 class="font-bold text-slate-900 leading-snug">{{ $store->name }}</h4>
                            <p class="text-[10px] text-slate-500 font-medium">Catálogo Digital Oficial</p>
                        </div>
                    </div>

                    <div class="space-y-3 pt-2 text-sm text-slate-600 border-t border-slate-100">
                        @if($store->city || $store->province)
                            <div class="flex items-start gap-2.5">
                                <i class="fa-solid fa-location-dot text-slate-400 shrink-0 mt-0.5 text-[15px]"></i>
                                <span>{{ $store->city }}{{ $store->city && $store->province ? ', ' : '' }}{{ $store->province }}</span>
                            </div>
                        @endif

                        @if($store->address)
                            <div class="flex items-start gap-2.5">
                                <i class="fa-solid fa-map-pin text-slate-400 shrink-0 mt-0.5 text-[15px]"></i>
                                <span>{{ $store->address }}</span>
                            </div>
                        @endif
                    </div>
                </div>

                <!-- Action & Sharing Buttons Card -->
                <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div class="space-y-3">
                        <span
                            class="text-xs font-extrabold uppercase text-slate-400 tracking-wider block">Contacto</span>

                        <!-- Contact Action Buttons -->
                        <div class="flex flex-col gap-3">
                            @if($cleanPhone)
                                <a href="{{ $waLink }}" target="_blank" rel="noopener noreferrer"
                                    class="bg-green-600 hover:bg-green-700 text-white font-bold text-center px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm hover:scale-[1.02] active:scale-[0.98]">
                                    <i class="fa-brands fa-whatsapp text-lg"></i>
                                    Consultar por WhatsApp
                                </a>
                            @endif

                            @if($store->phone)
                                <a href="tel:{!! preg_replace('/\D/', '', $store->phone) !!}"
                                    class="bg-store-primary text-white hover:opacity-90 font-bold text-center px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm hover:scale-[1.02] active:scale-[0.98]">
                                    <i class="fa-solid fa-phone"></i>
                                    Llamar ahora
                                </a>
                            @endif
                        </div>
                    </div>

                    <!-- Social Media Sharing -->
                    <div class="border-t border-slate-100 pt-5 space-y-3">
                        <span class="text-xs font-extrabold uppercase text-slate-400 tracking-wider block">Compartir
                            vehículo</span>
                        <div class="flex gap-2">
                            <!-- Share on WhatsApp -->
                            <a href="https://api.whatsapp.com/send?text={{ urlencode($seoTitle . ' - ' . url()->current()) }}"
                                target="_blank" rel="noopener noreferrer" title="Compartir por WhatsApp"
                                class="bg-green-100 text-green-700 hover:bg-green-200 p-3 rounded-xl flex-1 flex items-center justify-center transition-colors">
                                <i class="fa-brands fa-whatsapp text-lg"></i>
                            </a>
                            <!-- Share on Facebook -->
                            <a href="https://www.facebook.com/sharer/sharer.php?u={{ urlencode(url()->current()) }}"
                                target="_blank" rel="noopener noreferrer" title="Compartir en Facebook"
                                class="bg-blue-100 text-blue-800 hover:bg-blue-200 p-3 rounded-xl flex-1 flex items-center justify-center transition-colors">
                                <i class="fa-brands fa-facebook-f text-lg"></i>
                            </a>
                            <!-- Share on Twitter/X -->
                            <a href="https://twitter.com/intent/tweet?text={{ urlencode($seoTitle) }}&url={{ urlencode(url()->current()) }}"
                                target="_blank" rel="noopener noreferrer" title="Compartir en Twitter/X"
                                class="bg-sky-100 text-sky-800 hover:bg-sky-200 p-3 rounded-xl flex-1 flex items-center justify-center transition-colors">
                                <i class="fa-brands fa-x-twitter text-lg"></i>
                            </a>
                            <!-- Copy Link -->
                            <button onclick="copyToClipboard()" id="copy-btn" title="Copiar enlace"
                                class="bg-slate-100 text-slate-700 hover:bg-slate-200 p-3 rounded-xl flex-1 flex items-center justify-center transition-all cursor-pointer relative">
                                <i class="fa-regular fa-copy text-lg"></i>
                                <span id="copy-tooltip"
                                    class="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 transition-opacity pointer-events-none whitespace-nowrap">
                                    Enlace copiado!
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </main>

    <!-- Public Footer -->
    <footer class="max-w-7xl mx-auto px-4 mt-12 text-center text-xs text-slate-400 shrink-0">
        &copy; {{ date('Y') }} {{ $store->name }}. Desarrollado con tecnología de <a href="https://autodealer.com.ar"
            style="color: var(--store-primary)">AutoDealer</a>. Todos los derechos reservados.
    </footer>

    <!-- Premium Lightbox Modal -->
    <div id="lightbox-modal"
        class="fixed inset-0 z-50 bg-black/98 flex flex-col justify-between hidden opacity-0 transition-all duration-300 ease-out select-none">
        <!-- Lightbox Header -->
        <div
            class="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent text-white shrink-0">
            <div class="flex flex-col">
                <span class="font-extrabold text-sm tracking-tight text-white">{{ $vehicle->mark->name }}
                    {{ $vehicle->model }}</span>
                <span id="lightbox-counter" class="text-[10px] text-slate-400 font-mono mt-0.5">1 de 1</span>
            </div>
            <button onclick="event.stopPropagation(); closeLightbox();"
                class="text-white hover:text-slate-300 transition-colors p-2 cursor-pointer bg-white/10 hover:bg-white/20 rounded-full animate-fade-in"
                aria-label="Cerrar visualizador">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        <!-- Lightbox Main Frame -->
        <div class="relative flex-1 w-full flex items-center justify-center p-4">
            <!-- Left Arrow -->
            @if($vehicle->images && $vehicle->images->isNotEmpty())
                <button onclick="event.stopPropagation(); prevImage();"
                    class="absolute left-4 bg-white/10 hover:bg-white/20 active:scale-95 text-white p-3 rounded-full transition-all z-10 cursor-pointer hidden sm:block animate-fade-in"
                    aria-label="Anterior">
                    <i class="fa-solid fa-chevron-left text-lg"></i>
                </button>
            @endif

            <!-- Image display -->
            <img id="lightbox-image-display" src="{{ $vehicle->cover_image }}"
                class="max-h-[72vh] max-w-full object-contain transition-all duration-300 rounded-lg shadow-2xl"
                alt="{{ $vehicle->model }}" />

            <!-- Right Arrow -->
            @if($vehicle->images && $vehicle->images->isNotEmpty())
                <button onclick="event.stopPropagation(); nextImage();"
                    class="absolute right-4 bg-white/10 hover:bg-white/20 active:scale-95 text-white p-3 rounded-full transition-all z-10 cursor-pointer hidden sm:block animate-fade-in"
                    aria-label="Siguiente">
                    <i class="fa-solid fa-chevron-right text-lg"></i>
                </button>
            @endif
        </div>

        <!-- Lightbox Bottom Thumbnails -->
        @if($vehicle->images && $vehicle->images->isNotEmpty())
            <div class="bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col items-center gap-2 shrink-0">
                <div class="flex gap-2 overflow-x-auto w-full justify-start sm:justify-center py-2 max-w-2xl no-scrollbar">
                    <!-- Cover thumb -->
                    <button onclick="event.stopPropagation(); setActiveImage(0)"
                        class="relative h-12 w-20 rounded-lg overflow-hidden shrink-0 border-2 border-transparent transition-all opacity-50 lb-thumbnail-btn cursor-pointer">
                        <img src="{{ $vehicle->cover_image }}" class="h-full w-full object-cover" />
                    </button>
                    <!-- Gallery thumbs -->
                    @foreach($vehicle->images as $index => $img)
                        <button onclick="event.stopPropagation(); setActiveImage({{ $index + 1 }})"
                            class="relative h-12 w-20 rounded-lg overflow-hidden shrink-0 border-2 border-transparent transition-all opacity-50 lb-thumbnail-btn cursor-pointer">
                            <img src="{{ $img->path }}" class="h-full w-full object-cover" />
                        </button>
                    @endforeach
                </div>
                <!-- Swiping hint for mobile -->
                <span class="text-[9px] text-slate-500 block sm:hidden select-none pointer-events-none">Desliza hacia los
                    lados para navegar</span>
            </div>
        @endif
    </div>

    <!-- Image Slider & Lightbox Logic -->
    <script>
        // Array of all vehicle images
        const images = [
            "{{ $vehicle->cover_image }}",
            @if($vehicle->images)
                @foreach($vehicle->images as $img)
                    "{{ $img->path }}",
                @endforeach
            @endif
        ];

        let currentIndex = 0;
        let touchStartX = 0;
        let touchEndX = 0;

        // Set active image on the main display
        function setActiveImage(index) {
            if (index < 0 || index >= images.length) {
                return;
            }

            currentIndex = index;
            const mainImg = document.getElementById('main-image-display');
            if (mainImg) {
                mainImg.src = images[currentIndex];
            }

            // Update main page counter
            const counter = document.getElementById('page-image-counter');
            if (counter) {
                counter.innerText = `${currentIndex + 1} / ${images.length}`;
            }

            // Update page thumbnail buttons styling
            const buttons = document.querySelectorAll('.thumbnail-btn');
            buttons.forEach((btn, idx) => {
                if (idx === currentIndex) {
                    btn.classList.remove('border-transparent');
                    btn.classList.add('border-store-secondary', 'ring-2', 'ring-store-secondary/20');
                    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                } else {
                    btn.classList.remove('border-store-secondary', 'ring-2', 'ring-store-secondary/20');
                    btn.classList.add('border-transparent');
                }
            });

            // Update lightbox content
            updateLightboxContent();
        }

        function nextImage() {
            setActiveImage((currentIndex + 1) % images.length);
        }

        function prevImage() {
            setActiveImage((currentIndex - 1 + images.length) % images.length);
        }

        // Lightbox Functions
        function openLightbox(index = currentIndex) {
            const lightbox = document.getElementById('lightbox-modal');
            if (!lightbox) {
                return;
            }

            currentIndex = index;
            updateLightboxContent();

            // Prevent body scroll
            document.body.classList.add('overflow-hidden');

            // Show lightbox modal
            lightbox.classList.remove('hidden');
            // Allow layout repaint for transition
            setTimeout(() => {
                lightbox.classList.remove('opacity-0');
            }, 10);
        }

        function closeLightbox() {
            const lightbox = document.getElementById('lightbox-modal');
            if (!lightbox) {
                return;
            }

            // Re-enable body scroll
            document.body.classList.remove('overflow-hidden');

            // Hide lightbox modal with transition
            lightbox.classList.add('opacity-0');
            setTimeout(() => {
                lightbox.classList.add('hidden');
            }, 300);
        }

        function updateLightboxContent() {
            const lightboxImg = document.getElementById('lightbox-image-display');
            if (lightboxImg) {
                lightboxImg.src = images[currentIndex];
            }

            // Update lightbox title counter
            const lbCounter = document.getElementById('lightbox-counter');
            if (lbCounter) {
                lbCounter.innerText = `${currentIndex + 1} de ${images.length}`;
            }

            // Update lightbox thumbnails styling
            const lbButtons = document.querySelectorAll('.lb-thumbnail-btn');
            lbButtons.forEach((btn, idx) => {
                if (idx === currentIndex) {
                    btn.classList.remove('border-transparent', 'opacity-50');
                    btn.classList.add('border-store-secondary', 'opacity-100', 'scale-105');
                    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                } else {
                    btn.classList.remove('border-store-secondary', 'scale-105');
                    btn.classList.add('border-transparent', 'opacity-50');
                }
            });
        }

        // Swipe Gestures Support
        function handleGesture() {
            const minSwipeDistance = 50;
            if (touchEndX < touchStartX - minSwipeDistance) {
                nextImage(); // Swiped left -> Next
            } else if (touchEndX > touchStartX + minSwipeDistance) {
                prevImage(); // Swiped right -> Prev
            }
        }

        // Bind swipe and key events once page loads
        document.addEventListener('DOMContentLoaded', () => {
            // Set initial state
            setActiveImage(0);

            // Lightbox touch events for swiping
            const lightbox = document.getElementById('lightbox-modal');
            if (lightbox) {
                lightbox.addEventListener('touchstart', e => {
                    touchStartX = e.changedTouches[0].screenX;
                }, { passive: true });

                lightbox.addEventListener('touchend', e => {
                    touchEndX = e.changedTouches[0].screenX;
                    handleGesture();
                }, { passive: true });
            }

            // Bind touch events on main page image for swipe too!
            const mainImg = document.getElementById('main-image-display');
            if (mainImg) {
                const mainImgContainer = mainImg.parentElement;
                if (mainImgContainer) {
                    mainImgContainer.addEventListener('touchstart', e => {
                        touchStartX = e.changedTouches[0].screenX;
                    }, { passive: true });

                    mainImgContainer.addEventListener('touchend', e => {
                        touchEndX = e.changedTouches[0].screenX;
                        handleGesture();
                    }, { passive: true });
                }
            }
        });

        // Copy link to clipboard function with tooltip feedback
        function copyToClipboard() {
            navigator.clipboard.writeText(window.location.href).then(() => {
                const tooltip = document.getElementById('copy-tooltip');
                if (tooltip) {
                    tooltip.classList.remove('opacity-0');
                    tooltip.classList.add('opacity-100');
                    setTimeout(() => {
                        tooltip.classList.remove('opacity-100');
                        tooltip.classList.add('opacity-0');
                    }, 2000);
                }
            }).catch(err => {
                console.error('Error al copiar el enlace: ', err);
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', e => {
            const lightbox = document.getElementById('lightbox-modal');
            if (lightbox && !lightbox.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    closeLightbox();
                } else if (e.key === 'ArrowRight') {
                    nextImage();
                } else if (e.key === 'ArrowLeft') {
                    prevImage();
                }
            }
        });
    </script>
</body>

</html>