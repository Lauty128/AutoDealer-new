<!DOCTYPE html>
<html lang="es" class="h-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Configuración de Catálogo de WhatsApp - {{ $store->name }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800" rel="stylesheet" />

    <!-- CSS -->
    @vite(['resources/css/app.css'])

    <style>
        body {
            font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .meta-gradient {
            background: linear-gradient(135deg, #0064e0 0%, #00c6ff 100%);
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        .dark .glass-panel {
            background: rgba(24, 24, 27, 0.7);
        }
    </style>
</head>

<body class="min-h-screen flex flex-col antialiased">

    <!-- Header / Nav -->
    <header class="border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-md">
                    <span class="text-white dark:text-slate-900 font-extrabold text-lg">AD</span>
                </div>
                <div>
                    <h1 class="text-base font-bold tracking-tight">AutoDealer <span class="text-xs font-medium text-slate-500 dark:text-zinc-400">SaaS</span></h1>
                    <p class="text-xs text-slate-500 dark:text-zinc-400">{{ $store->name }}</p>
                </div>
            </div>

            <a href="{{ route('dashboard') }}" class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Panel
            </a>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        <!-- Status Flash Messages -->
        @if(session('status') === 'success')
            <div class="mb-8 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/30 flex items-start gap-3 shadow-sm animate-fade-in">
                <div class="p-1 rounded-lg bg-emerald-500 text-white flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div>
                    <h3 class="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Operación exitosa</h3>
                    <p class="text-xs text-emerald-700/90 dark:text-emerald-400/90 mt-0.5">{{ session('message') }}</p>
                </div>
            </div>
        @endif

        @if(session('status') === 'error' || $errors->any())
            <div class="mb-8 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/30 flex items-start gap-3 shadow-sm">
                <div class="p-1 rounded-lg bg-rose-500 text-white flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div>
                    <h3 class="text-sm font-semibold text-rose-800 dark:text-rose-300">Hubo un problema</h3>
                    <p class="text-xs text-rose-700/90 dark:text-rose-400/90 mt-0.5">
                        {{ session('message') ?: ($errors->first() ?: 'Ha ocurrido un error inesperado al procesar la solicitud.') }}
                    </p>
                </div>
            </div>
        @endif

        <!-- Card Onboarding Info -->
        <div class="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden mb-8">
            <div class="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-zinc-800">
                <div class="space-y-1.5 max-w-xl">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold {{ $isConfigured ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300' }}">
                        <span class="w-1.5 h-1.5 rounded-full {{ $isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400' }}"></span>
                        {{ $isConfigured ? 'Integración Activa' : 'Desconectado' }}
                    </div>
                    <h2 class="text-2xl font-bold tracking-tight">Catálogo de WhatsApp Business</h2>
                    <p class="text-sm text-slate-500 dark:text-zinc-400">
                        Configura la sincronización en segundo plano de tus vehículos. Cada alta, modificación o baja se reflejará automáticamente en tu catálogo de WhatsApp Commerce Manager.
                    </p>
                </div>
                <div class="flex-shrink-0">
                    @if($isConfigured)
                        <form action="{{ route('store.whatsapp.disconnect') }}" method="POST" onsubmit="return confirm('¿Estás seguro de que deseas desconectar el catálogo de WhatsApp? Se detendrá la sincronización.');">
                            @csrf
                            <button type="submit" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-700 transition-all cursor-pointer">
                                Desconectar integración
                            </button>
                        </form>
                    @endif
                </div>
            </div>

            @if($isConfigured)
                <div class="p-6 sm:p-8 bg-slate-50/50 dark:bg-zinc-900/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <span class="text-xs font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">ID del Catálogo Meta</span>
                        <code class="text-sm font-mono text-slate-800 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded block mt-1 break-all">{{ $store->whatsapp_catalog_id }}</code>
                    </div>
                    <div>
                        <span class="text-xs font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">ID Cuenta Comercial (Business ID)</span>
                        <code class="text-sm font-mono text-slate-800 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded block mt-1 break-all">{{ $store->whatsapp_business_id }}</code>
                    </div>
                    <div>
                        <span class="text-xs font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Token de Acceso de Meta</span>
                        <code class="text-sm font-mono text-slate-800 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded block mt-1 break-all">••••••••••••••••••••••••</code>
                    </div>
                </div>
            @endif
        </div>

        @if($step === 'index' && !$isConfigured)
            <!-- Wizard Step 1: Facebook Login -->
            <div class="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm p-6 sm:p-8 text-center max-w-xl mx-auto space-y-6">
                <div class="w-16 h-16 rounded-2xl meta-gradient text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                    </svg>
                </div>
                
                <div class="space-y-2">
                    <h3 class="text-lg font-bold">Vincular con tu Administrador Comercial</h3>
                    <p class="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                        Inicia sesión con la cuenta de Facebook que administra el Business Portfolio y Catálogos de tu concesionaria. Operamos con seguridad mediante la Graph API oficial de Meta.
                    </p>
                </div>

                @if($oauthUrl)
                    <div class="pt-2">
                        <a href="{{ $oauthUrl }}" class="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl meta-gradient hover:opacity-90 active:scale-98 text-white font-bold text-sm shadow-md shadow-blue-500/10 transition-all cursor-pointer">
                            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Conectar con Facebook
                        </a>
                    </div>
                @else
                    <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-xs text-left">
                        <span class="font-bold block mb-1">Configuración requerida:</span>
                        Falta configurar las credenciales de cliente Meta en el servidor (`META_CLIENT_ID` y `META_CLIENT_SECRET`). Por favor, ponte en contacto con el administrador del sistema para habilitar el botón de conexión.
                    </div>
                @endif

                <div class="border-t border-slate-100 dark:border-zinc-800 pt-6 text-left">
                    <h4 class="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">¿Cómo funciona?</h4>
                    <ul class="space-y-2 text-xs text-slate-500 dark:text-zinc-400">
                        <li class="flex items-start gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                            <span><strong>Sin desconexiones:</strong> El cliente puede seguir usando la aplicación de WhatsApp Business en su celular de manera normal.</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                            <span><strong>Permiso Seguro:</strong> Solo solicitamos el permiso <code>catalog_management</code> para leer y escribir artículos de catálogo.</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                            <span><strong>Automatización:</strong> Al publicar un vehículo en AutoDealer, este se sube en tiempo real a Meta Catalog Manager.</span>
                        </li>
                    </ul>
                </div>
            </div>
        @endif

        @if($step === 'select_catalog')
            <!-- Wizard Step 2: Catalog Selection -->
            <div class="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                    <h3 class="text-xl font-bold">Selecciona tu Catálogo de Productos</h3>
                    <p class="text-sm text-slate-500 dark:text-zinc-400">
                        Meta ha retornado los catálogos vinculados a tu Cuenta Comercial. Selecciona cuál deseas integrar con AutoDealer o crea uno nuevo de inmediato.
                    </p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    @foreach($catalogs as $catalog)
                        <div class="border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-blue-500 dark:hover:border-blue-600 transition-all group">
                            <div class="space-y-1">
                                <h4 class="font-bold text-slate-900 dark:text-zinc-100">{{ $catalog['name'] ?? 'Catálogo sin nombre' }}</h4>
                                <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500">
                                    <span>ID: {{ $catalog['id'] }}</span>
                                    <span>•</span>
                                    <span>Vertical: {{ $catalog['vertical'] ?? 'COMMERCE' }}</span>
                                </div>
                            </div>
                            <form action="{{ route('store.whatsapp.selectCatalog') }}" method="POST">
                                @csrf
                                <input type="hidden" name="catalog_id" value="{{ $catalog['id'] }}">
                                <button type="submit" class="px-4 py-2 rounded-lg bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer">
                                    Vincular
                                </button>
                            </form>
                        </div>
                    @endforeach
                </div>

                <div class="border-t border-slate-100 dark:border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="text-left">
                        <h4 class="text-sm font-bold text-slate-800 dark:text-zinc-200">¿No encuentras el catálogo correcto?</h4>
                        <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            Puedes crear un catálogo completamente nuevo llamado "AutoDealer - {{ $store->name }}" en tu Administrador Comercial haciendo clic al botón de la derecha.
                        </p>
                    </div>
                    <form action="{{ route('store.whatsapp.createCatalog') }}" method="POST">
                        @csrf
                        <button type="submit" class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer">
                            Crear catálogo nuevo
                        </button>
                    </form>
                </div>
            </div>
        @endif

    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 py-6 mt-12">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 dark:text-zinc-500">
            &copy; {{ date('Y') }} AutoDealer. Todos los derechos reservados.
        </div>
    </footer>

</body>

</html>
