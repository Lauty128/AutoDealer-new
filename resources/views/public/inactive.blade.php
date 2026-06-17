<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <title>{{ $store->name }} - Catálogo Inactivo</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800" rel="stylesheet" />

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
    </style>
</head>
<body class="font-sans antialiased min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-6">

    <div class="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-md p-8 text-center space-y-6">
        
        <!-- Logo or Initials -->
        <div class="flex justify-center">
            @if($store->logo)
                <img src="{{ $store->logo }}" alt="{{ $store->name }}" class="h-20 w-20 rounded-2xl object-cover border border-slate-200" />
            @else
                <div class="bg-store-primary text-white font-bold h-20 w-20 rounded-2xl flex items-center justify-center text-3xl">
                    {{ strtoupper(substr($store->name, 0, 2)) }}
                </div>
            @endif
        </div>

        <!-- Warning / Inactive Message -->
        <div class="space-y-2">
            <span class="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Exhibición Suspendida
            </span>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight mt-2">Catálogo Inactivo</h1>
            <p class="text-sm text-slate-500 leading-relaxed">
                El catálogo digital de <strong>{{ $store->name }}</strong> no se encuentra disponible momentáneamente debido al vencimiento de su plan de suscripción.
            </p>
        </div>

        <!-- Contact Option or Admin Direct Link -->
        <div class="pt-4 border-t border-slate-100 space-y-3">
            @if($store->phone)
                <a href="tel:{!! preg_replace('/\D/', '', $store->phone) !!}" 
                   class="bg-store-primary text-white hover:bg-slate-800 w-full font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Contactar al Concesionario
                </a>
            @endif
            
            <a href="{{ route('dashboard') }}" 
               class="border border-slate-200 text-slate-600 hover:bg-slate-50 w-full font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center">
                Ingresar como Administrador
            </a>
        </div>
        
    </div>

    <!-- Small Footer -->
    <footer class="mt-8 text-center text-[10px] text-slate-400">
        Potenciado por AutoDealer &copy; {{ date('Y') }}. Todos los derechos reservados.
    </footer>

</body>
</html>
