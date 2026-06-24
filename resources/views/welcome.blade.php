<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- SEO Meta Tags -->
    <title>AutoDealer - Catálogo Digital y Gestión de Concesionarias | Software para Agencias</title>
    <meta name="description" content="La plataforma SaaS definitiva para concesionarias de vehículos. Administrá tu stock, cargá precios en dólares y pesos, generá fichas técnicas imprimibles con QR y publicá tu catálogo interactivo online en minutos.">
    <meta name="keywords" content="concesionarias, catálogo digital de autos, gestión de stock de vehículos, fichas técnicas autos, software para agencias de autos, autodealer, argentina">
    <meta name="author" content="AutoDealer">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{{ url()->current() }}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url('/') }}">
    <meta property="og:title" content="AutoDealer - Catálogo Digital y Gestión de Concesionarias">
    <meta property="og:description" content="Gestioná tu stock de vehículos, controlá precios en USD/ARS, generá fichas técnicas imprimibles con QR y publicá tu showroom digital en minutos.">
    <meta property="og:image" content="{{ asset('assets/logo-h.png') }}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ url('/') }}">
    <meta property="twitter:title" content="AutoDealer - Catálogo Digital y Gestión de Concesionarias">
    <meta property="twitter:description" content="Gestioná tu stock de vehículos, controlá precios en USD/ARS, generá fichas técnicas imprimibles con QR y publicá tu showroom digital en minutos.">
    <meta property="twitter:image" content="{{ asset('assets/logo-h.png') }}">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800" rel="stylesheet" />

    <!-- Structured Data (JSON-LD) for SEO Rich Snippets -->
    <script type="application/ld+json">
    {
      "{{ '@context' }}": "https://schema.org",
      "{{ '@type' }}": "SoftwareApplication",
      "name": "AutoDealer",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "{{ '@type' }}": "Offer",
        "price": "4500",
        "priceCurrency": "ARS",
        "priceValidUntil": "{{ now()->addYear()->format('Y-m-d') }}"
      },
      "description": "La plataforma SaaS definitiva para concesionarias de vehículos. Administrá tu stock, cargá precios en dólares y pesos, compartí fichas técnicas profesionales y creá tu propio showroom online.",
      "applicationSubCategory": "Automotive Dealership Management & Catalog Software Platform"
    }
    </script>

    <!-- Inline Dark Mode Initialization Script (Prevents flash of light theme) -->
    <script>
        (function() {
            const appearance = localStorage.getItem('appearance') || 'system';
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark);
            document.documentElement.classList.toggle('dark', isDark);
        })();
    </script>

    @vite(['resources/css/app.css'])
</head>
<body class="relative min-h-screen overflow-x-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100 font-sans antialiased">

    <!-- Decorative Blurry Background Blobs -->
    <div class="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-brand/10 blur-[120px] pointer-events-none dark:bg-brand/5"></div>
    <div class="absolute top-[20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none dark:bg-indigo-500/5"></div>

    <!-- Header Navigation -->
    <header class="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-colors duration-300 dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            
            <!-- Logo Section -->
            <div class="flex items-center">
                <a href="/" class="flex items-center py-1">
                    <img
                        src="/assets/logo-h.png"
                        alt="AutoDealer Logo"
                        class="h-10 object-contain dark:hidden"
                        style="height: 2.5rem;"
                        id="logo-light"
                        onerror="this.style.display='none'; document.getElementById('logo-text').style.display='block';"
                    />
                    <img
                        src="/assets/logo-h-dark.png"
                        alt="AutoDealer Logo Dark"
                        class="h-10 object-contain hidden dark:block"
                        style="height: 2.5rem;"
                        id="logo-dark"
                        onerror="this.style.display='none';"
                    />
                    <span id="logo-text" class="text-lg font-black tracking-tight text-slate-900 dark:text-white ml-2 hidden">
                        Auto<span class="text-brand">Dealer</span>
                    </span>
                </a>
            </div>

            <!-- Desktop Nav Menu -->
            <nav class="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-zinc-400">
                <a href="#features" class="hover:text-slate-950 dark:hover:text-white transition-colors">Características</a>
                <a href="#preview" class="hover:text-slate-950 dark:hover:text-white transition-colors">Vista Previa</a>
                <a href="#pricing" class="hover:text-slate-950 dark:hover:text-white transition-colors">Precios</a>
            </nav>

            <!-- Actions Block -->
            <div class="flex items-center space-x-4">
                
                <!-- Theme Toggler (Vanilla JS Dropdown) -->
                <div class="relative" id="theme-menu-container">
                    <button id="theme-toggle-btn" class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none cursor-pointer" aria-label="Toggle theme">
                        <!-- Sun Icon (Default representation) -->
                        <svg id="theme-icon-sun" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                        <!-- Moon Icon -->
                        <svg id="theme-icon-moon" class="h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <!-- Monitor Icon -->
                        <svg id="theme-icon-system" class="h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <!-- Dropdown List -->
                    <div id="theme-dropdown-list" class="absolute right-0 mt-2 w-36 rounded-md border border-slate-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900 hidden transition-all duration-200">
                        <div class="py-1">
                            <button onclick="setThemePreference('light')" class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 focus:outline-none">
                                <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                                Claro
                            </button>
                            <button onclick="setThemePreference('dark')" class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 focus:outline-none">
                                <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                Oscuro
                            </button>
                            <button onclick="setThemePreference('system')" class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 focus:outline-none">
                                <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                Sistema
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Auth Buttons Block via Blade Auth directives -->
                <div class="hidden sm:flex items-center space-x-3">
                    @auth
                        <a
                            href="{{ route('dashboard') }}"
                            class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand hover:bg-brand-hover px-4 py-2 text-sm font-bold text-slate-950 transition-all shadow-sm cursor-pointer"
                        >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                            </svg>
                            Panel de Control
                        </a>
                    @else
                        <a
                            href="{{ route('login') }}"
                            class="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
                        >
                            Iniciar sesión
                        </a>
                        <a
                            href="{{ route('register') }}"
                            class="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800 transition-colors dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer shadow-sm"
                        >
                            Comenzar Gratis
                        </a>
                    @endauth
                </div>

                <!-- Mobile Hamburger Menu Button -->
                <button
                    id="mobile-menu-toggle-btn"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 cursor-pointer"
                    aria-label="Menú principal"
                >
                    <svg id="mobile-menu-open-icon" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <svg id="mobile-menu-close-icon" class="h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Mobile Menu Panel -->
        <div id="mobile-menu" class="border-t border-slate-200 bg-white p-4 md:hidden dark:border-zinc-800 dark:bg-zinc-950 hidden">
            <nav class="flex flex-col space-y-3">
                <a href="#features" onclick="toggleMobileMenu()" class="px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-900">Características</a>
                <a href="#preview" onclick="toggleMobileMenu()" class="px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-900">Vista Previa</a>
                <a href="#pricing" onclick="toggleMobileMenu()" class="px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-900">Precios</a>
                
                <hr class="border-slate-200 dark:border-zinc-800 my-2" />
                
                <div class="flex flex-col space-y-2 pt-2">
                    @auth
                        <a
                            href="{{ route('dashboard') }}"
                            class="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand hover:bg-brand-hover px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors shadow-sm"
                        >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                            </svg>
                            Panel de Control
                        </a>
                    @else
                        <a
                            href="{{ route('login') }}"
                            class="flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        >
                            Iniciar sesión
                        </a>
                        <a
                            href="{{ route('register') }}"
                            class="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm"
                        >
                            Registrar Concesionario
                        </a>
                    @endauth
                </div>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="relative flex flex-col items-center">
        
        <!-- Hero Section -->
        <section class="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center">
            
            <!-- Sparkles/Floating Badge -->
            <div class="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-xs font-semibold text-brand-hover dark:text-brand">
                <svg class="h-3.5 w-3.5 text-brand animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>Control Total para tu Concesionaria</span>
            </div>
            
            <!-- Main Heading (Semantically structured h1) -->
            <h1 class="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white leading-none">
                Tu inventario ordenado. <br />
                Tu <span class="bg-gradient-to-r from-brand to-amber-500 bg-clip-text text-transparent">Catálogo Digital</span> online.
            </h1>

            <p class="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-zinc-400">
                AutoDealer es la plataforma SaaS definitiva para concesionarias de vehículos. Administrá tu stock, cargá precios en dólares y pesos, compartí fichas técnicas profesionales por WhatsApp y creá tu propio showroom online en minutos.
            </p>

            <!-- Hero CTAs based on auth -->
            <div class="mt-10 flex flex-wrap justify-center gap-4">
                @auth
                    <a
                        href="{{ route('dashboard') }}"
                        class="group inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-base font-bold text-slate-950 transition-all hover:scale-[1.02] shadow-md hover:bg-brand-hover cursor-pointer"
                    >
                        <span>Acceder a mi Panel de Control</span>
                        <svg class="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                @else
                    <a
                        href="{{ route('register') }}"
                        class="group inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-base font-bold text-slate-950 transition-all hover:scale-[1.02] shadow-md hover:bg-brand-hover cursor-pointer"
                    >
                        <span>Registrar mi Concesionario</span>
                        <svg class="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                    <a
                        href="{{ route('login') }}"
                        class="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer shadow-xs"
                    >
                        Iniciar Sesión
                    </a>
                @endauth
            </div>

            <!-- Bullet point highlights -->
            <div class="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-semibold text-slate-500 dark:text-zinc-500">
                <span class="flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                    90 días de prueba sin costo
                </span>
                <span class="flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Carga ilimitada de vehículos
                </span>
                <span class="flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Catálogos públicos listos para WhatsApp
                </span>
            </div>
        </section>

        <!-- Interactive CSS Mockup Preview Section -->
        <section id="preview" class="w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
            <div class="relative rounded-2xl border border-slate-200/80 bg-slate-100 p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900/50">
                <div class="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand/5 to-indigo-500/5 opacity-50 blur-xl pointer-events-none"></div>
                
                <!-- Browser Bar UI -->
                <div class="flex items-center gap-1.5 px-3 py-2 border-b border-slate-200/60 dark:border-zinc-800/80">
                    <div class="h-3 w-3 rounded-full bg-red-400"></div>
                    <div class="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div class="h-3 w-3 rounded-full bg-green-400"></div>
                    <div class="ml-4 flex h-6 w-80 items-center rounded bg-slate-200/60 px-3 text-[10px] text-slate-500 font-mono dark:bg-zinc-800/80 dark:text-zinc-500">
                        catalogo.autodealer.com.ar/dashboard
                    </div>
                </div>

                <!-- Simulated Application (Dashboard Layout) -->
                <div class="grid grid-cols-12 min-h-[480px] bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-zinc-300 rounded-b-xl overflow-hidden font-sans">
                    
                    <!-- Sidebar Simulation -->
                    <div class="col-span-3 border-r border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-4 hidden md:flex flex-col justify-between">
                        <div class="space-y-6">
                            <div class="flex items-center gap-2 px-1">
                                <div class="h-6 w-6 rounded bg-brand flex items-center justify-center font-bold text-xs text-slate-950">AD</div>
                                <span class="font-bold text-xs">AutoDealer HQ</span>
                            </div>
                            <nav class="space-y-1.5">
                                <div class="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white">
                                    <svg class="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M21 16V10a2 2 0 00-2-2h-5.5" /></svg>
                                    <span>Inventario de Stock</span>
                                </div>
                                <div class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 dark:text-zinc-500">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" /></svg>
                                    <span>Catálogo Online</span>
                                </div>
                                <div class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 dark:text-zinc-500">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" /></svg>
                                    <span>Estadísticas</span>
                                </div>
                                <div class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 dark:text-zinc-500">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    <span>Colaboradores</span>
                                </div>
                            </nav>
                        </div>
                        <div class="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-zinc-900">
                            <div class="h-7 w-7 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">U</div>
                            <div>
                                <div class="text-[10px] font-bold">Admin AutoDealer</div>
                                <div class="text-[8px] text-slate-400">admin@autodealer.com</div>
                            </div>
                        </div>
                    </div>

                    <!-- Main Dashboard view -->
                    <div class="col-span-12 md:col-span-9 p-5 space-y-5 flex flex-col justify-between">
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="text-sm font-bold text-slate-950 dark:text-white">Panel de Inventario</h3>
                                    <p class="text-[10px] text-slate-400">Controlá y publicá tus unidades activas</p>
                                </div>
                                <div class="flex gap-2">
                                    <div class="rounded-md bg-brand px-3 py-1.5 text-[10px] font-bold text-slate-950 shadow-sm flex items-center gap-1 cursor-default">
                                        + Agregar Vehículo
                                    </div>
                                </div>
                            </div>

                            <!-- KPIs Simulation -->
                            <div class="grid grid-cols-3 gap-3">
                                <div class="rounded-lg border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                                    <span class="text-[9px] font-medium text-slate-400 uppercase">Total Stock</span>
                                    <div class="text-base font-extrabold mt-0.5 text-slate-950 dark:text-white">12 Autos</div>
                                </div>
                                <div class="rounded-lg border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                                    <span class="text-[9px] font-medium text-slate-400 uppercase">Disponibles</span>
                                    <div class="text-base font-extrabold mt-0.5 text-green-600 dark:text-green-400">9 Unidades</div>
                                </div>
                                <div class="rounded-lg border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                                    <span class="text-[9px] font-medium text-slate-400 uppercase">Valor de Stock</span>
                                    <div class="text-base font-extrabold mt-0.5 text-slate-950 dark:text-white">USD 185.000</div>
                                </div>
                            </div>

                            <!-- Stock Grid -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <!-- Card Corolla -->
                                <div class="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
                                    <div class="aspect-video bg-zinc-800 relative">
                                        <img 
                                            src="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=400" 
                                            alt="Corolla Preview" 
                                            class="w-full h-full object-cover"
                                        />
                                        <div class="absolute top-2 right-2 rounded-full bg-green-600/90 text-white text-[8px] font-extrabold uppercase px-2 py-0.5">
                                            Disponible
                                        </div>
                                    </div>
                                    <div class="p-3 space-y-2">
                                        <div>
                                            <span class="text-[9px] font-bold text-indigo-500 uppercase">Toyota</span>
                                            <h4 class="text-xs font-bold text-slate-900 dark:text-white">Corolla 2.0 SEG CVT</h4>
                                            <div class="flex items-center gap-3 text-[9px] text-slate-400 mt-1">
                                                <span class="flex items-center gap-0.5">
                                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    2022
                                                </span>
                                                <span class="flex items-center gap-0.5">
                                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" /></svg>
                                                    15.000 km
                                                </span>
                                            </div>
                                        </div>
                                        <div class="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-zinc-900/80">
                                            <span class="text-xs font-black text-slate-900 dark:text-white">USD 25.000</span>
                                            <div class="rounded bg-slate-100 dark:bg-zinc-800 px-2 py-1 text-[8px] font-bold flex items-center gap-1 cursor-default">
                                                <svg class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 10.742l8.139-4.07m0 0l-8.14-4.07m8.14 4.07L8.684 14.811M17 19a2 2 0 11-4 0 2 2 0 014 0zM12 5a2 2 0 11-4 0 2 2 0 014 0zM12 19a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                Compartir
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Card Ranger -->
                                <div class="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
                                    <div class="aspect-video bg-zinc-800 relative">
                                        <img 
                                            src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400" 
                                            alt="Ranger Preview" 
                                            class="w-full h-full object-cover"
                                        />
                                        <div class="absolute top-2 right-2 rounded-full bg-green-600/90 text-white text-[8px] font-extrabold uppercase px-2 py-0.5">
                                            Disponible
                                        </div>
                                    </div>
                                    <div class="p-3 space-y-2">
                                        <div>
                                            <span class="text-[9px] font-bold text-indigo-500 uppercase">Ford</span>
                                            <h4 class="text-xs font-bold text-slate-900 dark:text-white">Ranger 3.2 Limited 4x4</h4>
                                            <div class="flex items-center gap-3 text-[9px] text-slate-400 mt-1">
                                                <span class="flex items-center gap-0.5">
                                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    2021
                                                </span>
                                                <span class="flex items-center gap-0.5">
                                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" /></svg>
                                                    45.000 km
                                                </span>
                                            </div>
                                        </div>
                                        <div class="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-zinc-900/80">
                                            <span class="text-xs font-black text-slate-900 dark:text-white">USD 35.000</span>
                                            <div class="rounded bg-slate-100 dark:bg-zinc-800 px-2 py-1 text-[8px] font-bold flex items-center gap-1 cursor-default">
                                                <svg class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 10.742l8.139-4.07m0 0l-8.14-4.07m8.14 4.07L8.684 14.811M17 19a2 2 0 11-4 0 2 2 0 014 0zM12 5a2 2 0 11-4 0 2 2 0 014 0zM12 19a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                Compartir
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Footer Tip simulation inside the app -->
                        <div class="flex items-center justify-between bg-slate-100 p-2.5 rounded-lg border border-slate-200/50 text-[9px] text-slate-500 dark:bg-zinc-900/30 dark:border-zinc-800 dark:text-zinc-500 mt-2">
                            <span class="flex items-center gap-1">
                                <svg class="h-3.5 w-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Generá automáticamente etiquetas imprimibles con QR para cada vehículo en tu salón.
                            </span>
                            <span class="underline cursor-default font-bold hover:text-slate-800 dark:hover:text-zinc-400">Ver Ficha</span>
                        </div>
                    </div>
                </div>

                <!-- Floating Mobile Catalog Showroom Mockup -->
                <div class="absolute bottom-[-40px] right-[-20px] w-52 rounded-[28px] border-4 border-slate-950 bg-slate-950 p-1.5 shadow-2xl hidden lg:block transform rotate-2">
                    <div class="absolute top-2 left-1/2 h-3.5 w-16 -translate-x-1/2 rounded-full bg-slate-950"></div>
                    <div class="rounded-[22px] bg-slate-900 p-2 text-white text-[8px] space-y-2 select-none overflow-hidden h-[300px]">
                        
                        <!-- Mobile Header -->
                        <div class="flex flex-col items-center text-center mt-3 pb-2 border-b border-zinc-800">
                            <div class="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[8px] text-indigo-500 border border-indigo-500/20">AD</div>
                            <h5 class="font-extrabold text-[9px] mt-1">AutoDealer HQ</h5>
                            <p class="text-[6px] text-zinc-400">Catálogo Oficial Showroom</p>
                        </div>

                        <!-- Mobile Body Car card -->
                        <div class="space-y-1 bg-zinc-950/50 rounded-lg overflow-hidden border border-zinc-800/40 p-1.5">
                            <div class="aspect-video bg-zinc-900 rounded overflow-hidden relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=200" 
                                    alt="Corolla Mobile Preview" 
                                    class="w-full h-full object-cover"
                                />
                            </div>
                            <div class="flex justify-between items-center text-[7px] font-bold text-zinc-400 mt-1">
                                <span>Toyota Corolla</span>
                                <span class="text-emerald-400 font-extrabold">USD 25.000</span>
                            </div>
                            <div class="flex gap-1 text-[5px] text-zinc-500 pt-0.5">
                                <span>2022</span>
                                <span>•</span>
                                <span>15.000 km</span>
                                <span>•</span>
                                <span>Nafta</span>
                            </div>
                        </div>

                        <!-- Mobile WhatsApp Action Button -->
                        <div class="bg-green-600 hover:bg-green-700 text-white rounded-lg p-1.5 text-center text-[7px] font-extrabold flex items-center justify-center gap-1 cursor-default">
                            <svg class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            Consultar por WhatsApp
                        </div>
                        
                        <div class="text-[5px] text-center text-zinc-600 mt-2 font-mono">
                            catalogo.autodealer.com.ar/concesionario/hq
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features grid section -->
        <section id="features" class="w-full border-t border-slate-200/80 bg-slate-50/50 py-24 dark:border-zinc-900 dark:bg-zinc-900/10 transition-colors duration-300">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                
                <div class="text-center">
                    <h2 class="text-xs font-bold uppercase tracking-wider text-brand">Características Clave</h2>
                    <p class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                        Diseñado para simplificar tu negocio automotriz
                    </p>
                    <p class="mx-auto mt-4 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
                        Todo lo necesario para digitalizar tus operaciones, reducir los tiempos de carga y llegar a más clientes de manera profesional.
                    </p>
                </div>

                <!-- Features Cards -->
                <div class="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    
                    <!-- Feature 1 -->
                    <div class="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-brand/30">
                        <div class="inline-flex rounded-xl bg-brand/10 p-3 text-brand">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M21 16V10a2 2 0 00-2-2h-5.5" />
                            </svg>
                        </div>
                        <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Inventario Inteligente</h3>
                        <p class="mt-2 text-xs text-slate-500 leading-relaxed dark:text-zinc-400">
                            Controlá tu stock de autos, motos o camiones. Cargá precios en dólares o pesos y asigná estados (Disponible, Reservado o Vendido) al instante.
                        </p>
                    </div>

                    <!-- Feature 2 -->
                    <div class="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-brand/30">
                        <div class="inline-flex rounded-xl bg-brand/10 p-3 text-brand">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
                            </svg>
                        </div>
                        <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Catálogo Público</h3>
                        <p class="mt-2 text-xs text-slate-500 leading-relaxed dark:text-zinc-400">
                            Tus clientes acceden a un showroom digital optimizado para celulares. Personalizalo con tus logos, banners, redes sociales y colores institucionales.
                        </p>
                    </div>

                    <!-- Feature 3 -->
                    <div class="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-brand/30">
                        <div class="inline-flex rounded-xl bg-brand/10 p-3 text-brand">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                        </div>
                        <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Fichas Imprimibles</h3>
                        <p class="mt-2 text-xs text-slate-500 leading-relaxed dark:text-zinc-400">
                            Generá un documento PDF listo para imprimir para cada vehículo. Incluye un código QR para que los clientes escaneen en tu salón y vean las fotos online.
                        </p>
                    </div>

                    <!-- Feature 4 -->
                    <div class="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-brand/30">
                        <div class="inline-flex rounded-xl bg-brand/10 p-3 text-brand">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 class="mt-4 text-base font-bold text-slate-900 dark:text-white">Roles y Colaboración</h3>
                        <p class="mt-2 text-xs text-slate-500 leading-relaxed dark:text-zinc-400">
                            Diferenciá permisos de administrador y vendedor. Ocultá los costos de adquisición al equipo de ventas para cuidar tus márgenes de negocio.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Pricing Section -->
        <section id="pricing" class="w-full py-24 transition-colors duration-300">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                
                <div class="text-center">
                    <h2 class="text-xs font-bold uppercase tracking-wider text-brand">Planes y Precios</h2>
                    <p class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                        Una inversión simple para hacer crecer tu negocio
                    </p>
                    <p class="mx-auto mt-4 max-w-xl text-sm text-slate-500 dark:text-zinc-400">
                        Registrá tu concesionario hoy y disfrutá de todas las funciones premium gratis durante los primeros 90 días. Sin compromisos.
                    </p>
                </div>

                <!-- Price Card -->
                <div class="mt-16 flex justify-center">
                    <div class="relative w-full max-w-lg rounded-3xl border border-brand bg-white p-8 shadow-xl dark:bg-zinc-900/60 dark:border-brand/70">
                        <div class="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-brand px-4 py-1 text-xs font-extrabold text-slate-950 uppercase shadow-sm">
                            Recomendado
                        </div>
                        
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Plan Premium</h3>
                        <p class="mt-2 text-xs text-slate-500 dark:text-zinc-400">Acceso total para potenciar las ventas de tu agencia</p>
                        
                        <div class="mt-6 flex items-baseline">
                            <span class="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">$16.000</span>
                            <span class="text-lg font-semibold text-slate-400 ml-1">ARS/mes</span>
                        </div>
                        
                        <div class="mt-2 inline-block rounded-md bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-hover dark:text-brand">
                            ¡90 días de prueba gratis!
                        </div>

                        <hr class="border-slate-200 my-6 dark:border-zinc-800" />

                        <!-- Pricing Checklist -->
                        <ul class="space-y-3.5 text-xs text-slate-600 dark:text-zinc-300">
                            <li class="flex items-center gap-2">
                                <svg class="h-4.5 w-4.5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                                <span>Carga <strong>ilimitada</strong> de vehículos</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="h-4.5 w-4.5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                                <span>Showroom digital público con URL personalizada</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="h-4.5 w-4.5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                                <span>Integración y consultas directas vía WhatsApp</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="h-4.5 w-4.5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                                <span>Generación de fichas PDF imprimibles con QR</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="h-4.5 w-4.5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                                <span>Gestión multi-concesionaria con roles (Owner/Employee)</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <svg class="h-4.5 w-4.5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                                <span>Soporte prioritario y actualizaciones constantes</span>
                            </li>
                        </ul>

                        <div class="mt-8">
                            @auth
                                <a
                                    href="{{ route('dashboard') }}"
                                    class="block w-full rounded-xl bg-brand py-3 text-center text-sm font-bold text-slate-950 hover:bg-brand-hover shadow-sm transition-colors cursor-pointer"
                                >
                                    Ir al Panel de Control
                                </a>
                            @else
                                <a
                                    href="{{ route('register') }}"
                                    class="block w-full rounded-xl bg-brand py-3 text-center text-sm font-bold text-slate-950 hover:bg-brand-hover shadow-sm transition-colors cursor-pointer"
                                >
                                    Registrarme y Probar Gratis
                                </a>
                            @endauth
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Final CTA Banner -->
        <section class="w-full relative overflow-hidden bg-slate-950 py-20 text-white">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-brand/10 opacity-70"></div>
            <div class="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                <h2 class="text-3xl font-extrabold sm:text-4xl">
                    ¿Listo para digitalizar tu stock de vehículos?
                </h2>
                <p class="mx-auto mt-4 max-w-xl text-sm text-zinc-400">
                    Unite a los concesionarios que ya optimizan su tiempo y multiplican sus consultas a través de AutoDealer.
                </p>
                <div class="mt-8 flex justify-center gap-4">
                    @auth
                        <a
                            href="{{ route('dashboard') }}"
                            class="inline-flex items-center gap-1.5 rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-brand-hover transition-all cursor-pointer"
                        >
                            Ir al Panel de Control
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>
                    @else
                        <a
                            href="{{ route('register') }}"
                            class="inline-flex items-center gap-1.5 rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-brand-hover transition-all cursor-pointer"
                        >
                            Comenzar mi Prueba Gratis
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>
                        <a
                            href="{{ route('login') }}"
                            class="inline-flex items-center rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-3.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
                        >
                            Iniciar Sesión
                        </a>
                    @endauth
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="w-full border-t border-slate-200 bg-white py-12 dark:border-zinc-900 dark:bg-zinc-950 transition-colors duration-300">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
                <div class="flex items-center gap-2">
                    <img
                        src="/assets/logo-h.png"
                        alt="AutoDealer Logo"
                        class="h-8 object-contain dark:hidden"
                        style="height: 2.5rem;"
                        onerror="this.style.display='none';"
                    />
                    <img
                        src="/assets/logo-h-dark.png"
                        alt="AutoDealer Logo Dark"
                        class="h-8 object-contain hidden dark:block"
                        style="height: 2.5rem;"
                        onerror="this.style.display='none';"
                    />
                </div>
                <div class="flex flex-wrap justify-center gap-6 text-xs text-slate-500 dark:text-zinc-500">
                    <a href="#features" class="hover:text-slate-800 dark:hover:text-zinc-300">Características</a>
                    <a href="#preview" class="hover:text-slate-800 dark:hover:text-zinc-300">Vista Previa</a>
                    <a href="#pricing" class="hover:text-slate-800 dark:hover:text-zinc-300">Precios</a>
                    <a href="{{ route('privacy.policy') }}" class="hover:text-slate-800 dark:hover:text-zinc-300">Políticas de Privacidad</a>
                </div>
                <p class="text-center text-xs text-slate-400 dark:text-zinc-600">
                    &copy; <script>document.write(new Date().getFullYear())</script> AutoDealer. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </footer>

    <!-- Interactive Scripts for Mobile Menu & Appearance toggling -->
    <script>
        // --- Mobile Menu Toggle logic ---
        const mobileMenuBtn = document.getElementById('mobile-menu-toggle-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuOpenIcon = document.getElementById('mobile-menu-open-icon');
        const mobileMenuCloseIcon = document.getElementById('mobile-menu-close-icon');

        function toggleMobileMenu() {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                mobileMenuOpenIcon.classList.add('hidden');
                mobileMenuCloseIcon.classList.remove('hidden');
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenuOpenIcon.classList.remove('hidden');
                mobileMenuCloseIcon.classList.add('hidden');
            }
        }
        
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        // --- Theme dropdown logic ---
        const themeBtn = document.getElementById('theme-toggle-btn');
        const themeDropdown = document.getElementById('theme-dropdown-list');

        // Toggle dropdown open/closed
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!themeDropdown.classList.contains('hidden')) {
                themeDropdown.classList.add('hidden');
            }
        });

        // Update Theme Button Active Icon representation
        function updateThemeButtonUI(appearance) {
            const sunIcon = document.getElementById('theme-icon-sun');
            const moonIcon = document.getElementById('theme-icon-moon');
            const systemIcon = document.getElementById('theme-icon-system');

            sunIcon.classList.add('hidden');
            moonIcon.classList.add('hidden');
            systemIcon.classList.add('hidden');

            if (appearance === 'light') {
                sunIcon.classList.remove('hidden');
            } else if (appearance === 'dark') {
                moonIcon.classList.remove('hidden');
            } else {
                systemIcon.classList.remove('hidden');
            }
        }

        // Apply theme classes and localStorage values
        function setThemePreference(mode) {
            localStorage.setItem('appearance', mode);
            
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = mode === 'dark' || (mode === 'system' && prefersDark);
            
            document.documentElement.classList.toggle('dark', isDark);
            updateThemeButtonUI(mode);
        }

        // Initialize theme button UI state on load
        window.addEventListener('DOMContentLoaded', () => {
            const savedAppearance = localStorage.getItem('appearance') || 'system';
            updateThemeButtonUI(savedAppearance);

            // Listen for system changes if system theme is set
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                const currentMode = localStorage.getItem('appearance') || 'system';
                if (currentMode === 'system') {
                    setThemePreference('system');
                }
            });
        });
    </script>
</body>
</html>
