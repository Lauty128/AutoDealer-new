import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import {
    Car, Printer, QrCode, Users, Check, CheckCircle2,
    ArrowRight, Lock, ShieldCheck, BarChart3, LayoutDashboard,
    Globe, Share2, DollarSign, Menu, X, ChevronRight, Sparkles,
    Calendar, Gauge, Fuel, Phone, Mail, Clock
} from 'lucide-react';
import { useState } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title="AutoDealer - Tu Concesionaria Digital">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800" rel="stylesheet" />
            </Head>

            <div className="relative min-h-screen overflow-x-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100 font-sans">
                {/* Background Blobs for Visual Aesthetics */}
                <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-brand/10 blur-[120px] pointer-events-none dark:bg-brand/5" />
                <div className="absolute top-[20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none dark:bg-indigo-500/5" />

                {/* Header Nav */}
                <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-colors duration-300 dark:border-zinc-800/80 dark:bg-zinc-950/80">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center py-1">
                                <img
                                    src="/assets/logo-h.png"
                                    alt="AutoDealer"
                                    className="h-10 object-contain dark:hidden"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        const sibling = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                                        if (sibling) sibling.style.display = 'block';
                                    }}
                                />
                                <img
                                    src="/assets/logo-h-dark.png"
                                    alt="AutoDealer"
                                    className="h-10 object-contain hidden dark:block"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </Link>
                        </div>

                        {/* Desktop Navigation Link Menu */}
                        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-zinc-400">
                            <a href="#features" className="hover:text-slate-950 dark:hover:text-white transition-colors">Características</a>
                            <a href="#preview" className="hover:text-slate-950 dark:hover:text-white transition-colors">Vista Previa</a>
                            <a href="#pricing" className="hover:text-slate-950 dark:hover:text-white transition-colors">Precios</a>
                        </nav>

                        {/* Top Right Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Theme dropdown */}
                            <AppearanceToggleDropdown className="text-slate-600 dark:text-zinc-400" />

                            <div className="hidden sm:flex items-center space-x-3">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand hover:bg-brand-hover px-4 py-2 text-sm font-bold text-slate-950 transition-all shadow-sm cursor-pointer"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Panel de Control
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
                                        >
                                            Iniciar sesión
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800 transition-colors dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer shadow-sm"
                                        >
                                            Comenzar Gratis
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Mobile Hamburger menu */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 cursor-pointer"
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Panel */}
                    {mobileMenuOpen && (
                        <div className="border-t border-slate-200 bg-white p-4 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
                            <nav className="flex flex-col space-y-3">
                                <a
                                    href="#features"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                >
                                    Características
                                </a>
                                <a
                                    href="#preview"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                >
                                    Vista Previa
                                </a>
                                <a
                                    href="#pricing"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                >
                                    Precios
                                </a>

                                <hr className="border-slate-200 dark:border-zinc-800 my-2" />

                                <div className="flex flex-col space-y-2 pt-2">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand hover:bg-brand-hover px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors shadow-sm"
                                        >
                                            <LayoutDashboard className="h-4 w-4" />
                                            Panel de Control
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login')}
                                                className="flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                            >
                                                Iniciar sesión
                                            </Link>
                                            <Link
                                                href={route('register')}
                                                className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm"
                                            >
                                                Registrar Concesionario
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </nav>
                        </div>
                    )}
                </header>

                {/* Hero Section */}
                <main className="relative flex flex-col items-center">
                    <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center">
                        {/* Dynamic Floating Badge */}
                        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-xs font-semibold text-brand-hover dark:text-brand">
                            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                            <span>Control Total para tu Concesionaria</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white leading-none">
                            Tu inventario ordenado. <br />
                            Tu <span className="bg-gradient-to-r from-brand to-amber-500 bg-clip-text text-transparent">Catálogo Digital</span> online.
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-zinc-400">
                            AutoDealer es la plataforma SaaS definitiva para concesionarias de vehículos. Administrá tu stock, cargá precios en dólares y pesos, compartí fichas técnicas profesionales por WhatsApp y creá tu propio showroom online en minutos.
                        </p>

                        {/* Hero CTAs */}
                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="group inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-base font-bold text-slate-950 transition-all hover:scale-[1.02] shadow-md hover:bg-brand-hover cursor-pointer"
                                >
                                    <span>Acceder a mi Panel de Control</span>
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('register')}
                                        className="group inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-base font-bold text-slate-950 transition-all hover:scale-[1.02] shadow-md hover:bg-brand-hover cursor-pointer"
                                    >
                                        <span>Registrar mi Concesionario</span>
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer shadow-xs"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Quick highlights */}
                        <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-semibold text-slate-500 dark:text-zinc-500">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-brand" /> 90 días de prueba sin costo
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-brand" /> Carga ilimitada de vehículos
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-brand" /> Catálogos públicos listos para WhatsApp
                            </span>
                        </div>
                    </section>

                    {/* Interactive CSS Mockup Section */}
                    <section id="preview" className="w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
                        <div className="relative rounded-2xl border border-slate-200/80 bg-slate-100 p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand/5 to-indigo-500/5 opacity-50 blur-xl pointer-events-none" />

                            {/* Browser bar */}
                            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-200/60 dark:border-zinc-800/80">
                                <div className="h-3 w-3 rounded-full bg-red-400" />
                                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                                <div className="h-3 w-3 rounded-full bg-green-400" />
                                <div className="ml-4 flex h-6 w-80 items-center rounded bg-slate-200/60 px-3 text-[10px] text-slate-500 font-mono dark:bg-zinc-800/80 dark:text-zinc-500">
                                    catalogo.autodealer.com.ar/dashboard
                                </div>
                            </div>

                            {/* Simulated Dashboard content */}
                            <div className="grid grid-cols-12 min-h-[480px] bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-zinc-300 rounded-b-xl overflow-hidden font-sans">

                                {/* Sidebar simulation */}
                                <div className="col-span-3 border-r border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-4 hidden md:flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="h-6 w-6 rounded bg-brand flex items-center justify-center font-bold text-xs text-slate-950">AD</div>
                                            <span className="font-bold text-xs">AutoDealer HQ</span>
                                        </div>
                                        <nav className="space-y-1.5">
                                            <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white">
                                                <Car className="h-4 w-4 text-brand" />
                                                <span>Inventario de Stock</span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 dark:text-zinc-500">
                                                <Globe className="h-4 w-4" />
                                                <span>Catálogo Online</span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 dark:text-zinc-500">
                                                <BarChart3 className="h-4 w-4" />
                                                <span>Estadísticas</span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 dark:text-zinc-500">
                                                <Users className="h-4 w-4" />
                                                <span>Colaboradores</span>
                                            </div>
                                        </nav>
                                    </div>
                                    <div className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-zinc-900">
                                        <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">U</div>
                                        <div>
                                            <div className="text-[10px] font-bold">Admin AutoDealer</div>
                                            <div className="text-[8px] text-slate-400">admin@autodealer.com</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Panel Simulation */}
                                <div className="col-span-12 md:col-span-9 p-5 space-y-5 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-950 dark:text-white">Panel de Inventario</h3>
                                                <p className="text-[10px] text-slate-400">Controlá y publicá tus unidades activas</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="rounded-md bg-brand px-3 py-1.5 text-[10px] font-bold text-slate-950 shadow-sm flex items-center gap-1">
                                                    + Agregar Vehículo
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mock KPI metrics */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                                                <span className="text-[9px] font-medium text-slate-400 uppercase">Total Stock</span>
                                                <div className="text-base font-extrabold mt-0.5 text-slate-950 dark:text-white">12 Autos</div>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                                                <span className="text-[9px] font-medium text-slate-400 uppercase">Disponibles</span>
                                                <div className="text-base font-extrabold mt-0.5 text-green-600 dark:text-green-400">9 Unidades</div>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                                                <span className="text-[9px] font-medium text-slate-400 uppercase">Valor de Stock</span>
                                                <div className="text-base font-extrabold mt-0.5 text-slate-950 dark:text-white">USD 185.000</div>
                                            </div>
                                        </div>

                                        {/* Simulated Car Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Car Card 1 */}
                                            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
                                                <div className="aspect-video bg-zinc-800 relative">
                                                    <img
                                                        src="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=400"
                                                        alt="Corolla Mock"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute top-2 right-2 rounded-full bg-green-600/90 text-white text-[8px] font-extrabold uppercase px-2 py-0.5">
                                                        Disponible
                                                    </div>
                                                </div>
                                                <div className="p-3 space-y-2">
                                                    <div>
                                                        <span className="text-[9px] font-bold text-indigo-500 uppercase">Toyota</span>
                                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Corolla 2.0 SEG CVT</h4>
                                                        <div className="flex items-center gap-3 text-[9px] text-slate-400 mt-1">
                                                            <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> 2022</span>
                                                            <span className="flex items-center gap-0.5"><Gauge className="h-3 w-3" /> 15.000 km</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-zinc-900/80">
                                                        <span className="text-xs font-black text-slate-900 dark:text-white">USD 25.000</span>
                                                        <div className="rounded bg-slate-100 dark:bg-zinc-800 px-2 py-1 text-[8px] font-bold flex items-center gap-1">
                                                            <Share2 className="h-2.5 w-2.5" /> Compartir
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Car Card 2 */}
                                            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
                                                <div className="aspect-video bg-zinc-800 relative">
                                                    <img
                                                        src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400"
                                                        alt="Ranger Mock"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute top-2 right-2 rounded-full bg-green-600/90 text-white text-[8px] font-extrabold uppercase px-2 py-0.5">
                                                        Disponible
                                                    </div>
                                                </div>
                                                <div className="p-3 space-y-2">
                                                    <div>
                                                        <span className="text-[9px] font-bold text-indigo-500 uppercase">Ford</span>
                                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ranger 3.2 Limited 4x4</h4>
                                                        <div className="flex items-center gap-3 text-[9px] text-slate-400 mt-1">
                                                            <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> 2021</span>
                                                            <span className="flex items-center gap-0.5"><Gauge className="h-3 w-3" /> 45.000 km</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-zinc-900/80">
                                                        <span className="text-xs font-black text-slate-900 dark:text-white">USD 35.000</span>
                                                        <div className="rounded bg-slate-100 dark:bg-zinc-800 px-2 py-1 text-[8px] font-bold flex items-center gap-1">
                                                            <Share2 className="h-2.5 w-2.5" /> Compartir
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtitle / Tip bar in simulated app */}
                                    <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-lg border border-slate-200/50 text-[9px] text-slate-500 dark:bg-zinc-900/30 dark:border-zinc-800 dark:text-zinc-500">
                                        <span className="flex items-center gap-1"><Printer className="h-3.5 w-3.5 text-brand" /> Generá automáticamente etiquetas imprimibles con QR para cada vehículo en tu salón.</span>
                                        <span className="underline cursor-pointer font-bold hover:text-slate-800 dark:hover:text-zinc-400">Ver Ficha</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Mobile Catalog Mockup (Visual Glassmorphism Overlay) */}
                            <div className="absolute bottom-[-40px] right-[-20px] w-52 rounded-[28px] border-4 border-slate-950 bg-slate-950 p-1.5 shadow-2xl hidden lg:block transform rotate-2">
                                <div className="absolute top-2 left-1/2 h-3.5 w-16 -translate-x-1/2 rounded-full bg-slate-950" />
                                <div className="rounded-[22px] bg-slate-900 p-2 text-white text-[8px] space-y-2 select-none overflow-hidden h-[300px]">

                                    {/* Mobile Header */}
                                    <div className="flex flex-col items-center text-center mt-3 pb-2 border-b border-zinc-800">
                                        <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[8px] text-indigo-500 border border-indigo-500/20">AD</div>
                                        <h5 className="font-extrabold text-[9px] mt-1">AutoDealer HQ</h5>
                                        <p className="text-[6px] text-zinc-400">Catálogo Oficial Showroom</p>
                                    </div>

                                    {/* Mobile Body Car */}
                                    <div className="space-y-1 bg-zinc-950/50 rounded-lg overflow-hidden border border-zinc-800/40 p-1.5">
                                        <div className="aspect-video bg-zinc-900 rounded overflow-hidden relative">
                                            <img
                                                src="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=200"
                                                alt="Corolla Mobile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-[7px] font-bold text-zinc-400 mt-1">
                                            <span>Toyota Corolla</span>
                                            <span className="text-emerald-400 font-extrabold">USD 25.000</span>
                                        </div>
                                        <div className="flex gap-1 text-[5px] text-zinc-500 pt-0.5">
                                            <span>2022</span>
                                            <span>•</span>
                                            <span>15.000 km</span>
                                            <span>•</span>
                                            <span>Nafta</span>
                                        </div>
                                    </div>

                                    {/* WhatsApp Direct contact button simulation */}
                                    <div className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-1.5 text-center text-[7px] font-extrabold flex items-center justify-center gap-1 cursor-pointer">
                                        <Phone className="h-2.5 w-2.5" />
                                        Consultar por WhatsApp
                                    </div>

                                    <div className="text-[5px] text-center text-zinc-600 mt-2">
                                        autodealer.com/concesionario/hq
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Features Section */}
                <section id="features" className="border-t border-slate-200/80 bg-slate-50/50 py-24 dark:border-zinc-900 dark:bg-zinc-900/10 transition-colors duration-300">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-brand">Características Clave</h2>
                            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                Diseñado para simplificar tu negocio automotriz
                            </p>
                            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
                                Todo lo necesario para digitalizar tus operaciones, reducir los tiempos de carga y llegar a más clientes de manera profesional.
                            </p>
                        </div>

                        {/* Feature grid */}
                        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Feature 1 */}
                            <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-brand/30">
                                <div className="inline-flex rounded-xl bg-brand/10 p-3 text-brand">
                                    <Car className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Inventario Inteligente</h3>
                                <p className="mt-2 text-xs text-slate-500 leading-relaxed dark:text-zinc-400">
                                    Controlá tu stock de autos, motos o camiones. Cargá precios en dólares o pesos y asigná estados (Disponible, Reservado o Vendido) al instante.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-brand/30">
                                <div className="inline-flex rounded-xl bg-brand/10 p-3 text-brand">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Catálogo Público</h3>
                                <p className="mt-2 text-xs text-slate-500 leading-relaxed dark:text-zinc-400">
                                    Tus clientes acceden a un showroom digital optimizado para celulares. Personalizalo con tus logos, banners, redes sociales y colores institucionales.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-brand/30">
                                <div className="inline-flex rounded-xl bg-brand/10 p-3 text-brand">
                                    <Printer className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Fichas Imprimibles</h3>
                                <p className="mt-2 text-xs text-slate-500 leading-relaxed dark:text-zinc-400">
                                    Generá un documento PDF listo para imprimir para cada vehículo. Incluye un código QR para que los clientes escaneen en tu salón y vean las fotos online.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-brand/30">
                                <div className="inline-flex rounded-xl bg-brand/10 p-3 text-brand">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Roles y Colaboración</h3>
                                <p className="mt-2 text-xs text-slate-500 leading-relaxed dark:text-zinc-400">
                                    Diferenciá permisos de administrador y vendedor. Ocultá los costos de adquisición al equipo de ventas para cuidar tus márgenes de negocio.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-24 transition-colors duration-300">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-brand">Planes y Precios</h2>
                            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                Una inversión simple para hacer crecer tu negocio
                            </p>
                            <p className="mx-auto mt-4 max-w-xl text-sm text-slate-500 dark:text-zinc-400">
                                Registrá tu concesionario hoy y disfrutá de todas las funciones premium gratis durante los primeros 90 días. Sin compromisos.
                            </p>
                        </div>

                        {/* Price Card Container */}
                        <div className="mt-16 flex justify-center">
                            <div className="relative w-full max-w-lg rounded-3xl border border-brand bg-white p-8 shadow-xl dark:bg-zinc-900/60 dark:border-brand/70">
                                <div className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-brand px-4 py-1 text-xs font-extrabold text-slate-950 uppercase shadow-sm">
                                    Recomendado
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Plan Premium</h3>
                                <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">Acceso total para potenciar las ventas de tu agencia</p>

                                <div className="mt-6 flex items-baseline">
                                    <span className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">$4.500</span>
                                    <span className="text-lg font-semibold text-slate-400 ml-1">ARS/mes</span>
                                </div>

                                {/* 90 days trial notice */}
                                <div className="mt-2 inline-block rounded-md bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-hover dark:text-brand">
                                    ¡90 días de prueba gratis!
                                </div>

                                <hr className="border-slate-200 my-6 dark:border-zinc-800" />

                                <ul className="space-y-3.5 text-xs text-slate-600 dark:text-zinc-300">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4.5 w-4.5 text-brand shrink-0" />
                                        <span>Carga **ilimitada** de vehículos</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4.5 w-4.5 text-brand shrink-0" />
                                        <span>Showroom digital público con URL personalizada</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4.5 w-4.5 text-brand shrink-0" />
                                        <span>Integración y consultas directas vía WhatsApp</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4.5 w-4.5 text-brand shrink-0" />
                                        <span>Generación de fichas PDF imprimibles con QR</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4.5 w-4.5 text-brand shrink-0" />
                                        <span>Gestión multi-concesionaria con roles (Owner/Employee)</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4.5 w-4.5 text-brand shrink-0" />
                                        <span>Soporte prioritario y actualizaciones constantes</span>
                                    </li>
                                </ul>

                                <div className="mt-8">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="block w-full rounded-xl bg-brand py-3 text-center text-sm font-bold text-slate-950 hover:bg-brand-hover shadow-sm transition-colors cursor-pointer"
                                        >
                                            Ir al Panel de Control
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register')}
                                            className="block w-full rounded-xl bg-brand py-3 text-center text-sm font-bold text-slate-950 hover:bg-brand-hover shadow-sm transition-colors cursor-pointer"
                                        >
                                            Registrarme y Probar Gratis
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Banner CTA Final */}
                <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-brand/10 opacity-70" />
                    <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold sm:text-4xl">
                            ¿Listo para digitalizar tu stock de vehículos?
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-400">
                            Unite a los concesionarios que ya optimizan su tiempo y multiplican sus consultas a través de AutoDealer.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-brand-hover transition-all cursor-pointer"
                                >
                                    Ir al Panel de Control
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-brand-hover transition-all cursor-pointer"
                                    >
                                        Comenzar mi Prueba Gratis
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-3.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200 bg-white py-12 dark:border-zinc-900 dark:bg-zinc-950 transition-colors duration-300">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-extrabold tracking-tight text-slate-950 dark:text-white">
                                    Auto<span className="text-brand font-black">Dealer</span>
                                </span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 dark:text-zinc-500">
                                <a href="#features" className="hover:text-slate-800 dark:hover:text-zinc-300">Características</a>
                                <a href="#preview" className="hover:text-slate-800 dark:hover:text-zinc-300">Vista Previa</a>
                                <a href="#pricing" className="hover:text-slate-800 dark:hover:text-zinc-300">Precios</a>
                            </div>
                            <p className="text-center text-xs text-slate-400 dark:text-zinc-600">
                                &copy; {new Date().getFullYear()} AutoDealer. Todos los derechos reservados.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

