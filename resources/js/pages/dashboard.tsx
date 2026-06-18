import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { 
    Search, X, MapPin, Phone, Mail, Clock, Calendar, Gauge, Fuel, 
    Landmark, ShieldAlert, Share2, Pencil, Car, CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SharePreviewDialog } from '@/components/vehicles/share-preview-dialog';

// Interfaces matching the backend models
interface StoreService {
    id: number;
    name: string;
    description: string;
    icon: string;
}

interface Store {
    id: number;
    name: string;
    slug: string;
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    website: string;
    logo: string;
    banner: string;
    primary_color: string;
    secondary_color: string;
    custom_css: string;
    presentation: string;
    working_hours: Record<string, string> | null;
    services: StoreService[];
    pivot?: {
        role: string;
    };
}

interface VehicleDetail {
    id: number;
    label: string;
    value: string;
}

interface VehicleImage {
    id: number;
    path: string;
    sort_order: number;
}

interface Vehicle {
    id: number;
    model: string;
    slug: string;
    year: number;
    price: number;
    currency: string;
    cover_image: string;
    plate: string;
    engine: string;
    suspension: string;
    fuel_type: string;
    mileage: number;
    description: string;
    status: string;
    cost_price: number | null;
    type: { id: number; name: string };
    mark: { id: number; name: string };
    details: VehicleDetail[];
    images: VehicleImage[];
}

interface FilterMetadata {
    id: number;
    name: string;
}

interface TemplateField {
    id: number;
    vehicle_type_id: number;
    store_id: number | null;
    label: string;
    type: 'text' | 'number' | 'select';
    options: string[] | null;
    default_value: string | null;
}

interface DashboardProps {
    stores: Store[];
    activeStoreId: number | null;
    vehicles: Vehicle[];
    marks: FilterMetadata[];
    types: FilterMetadata[];
    fuels: FilterMetadata[];
    templates: TemplateField[];
    filters: {
        vehicle_type_id: string;
        vehicle_mark_id: string;
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ 
    stores, 
    activeStoreId, 
    vehicles, 
    marks, 
    types, 
    fuels,
    templates,
    filters 
}: DashboardProps) {
    const activeStore = stores.find(s => s.id === activeStoreId);
    
    // User Role check in active store
    const storeRole = activeStore?.pivot?.role || 'employee';
    const isEmployee = storeRole === 'employee' || storeRole === 'editor';

    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user.is_superadmin === true || auth.user.is_superadmin === 1;

    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [typeId, setTypeId] = useState(filters.vehicle_type_id || '');
    const [markId, setMarkId] = useState(filters.vehicle_mark_id || '');

    // Share & Preview Dialog State
    const [selectedShareVehicle, setSelectedShareVehicle] = useState<Vehicle | null>(null);
    const [isShareOpen, setIsShareOpen] = useState(false);

    const handleOpenSharePreview = (vehicle: Vehicle) => {
        setSelectedShareVehicle(vehicle);
        setIsShareOpen(true);
    };

    // Sync filters on prop changes
    useEffect(() => {
        setSearch(filters.search || '');
        setTypeId(filters.vehicle_type_id || '');
        setMarkId(filters.vehicle_mark_id || '');
    }, [filters]);

    // Handle filter application
    const applyFilters = (newFilters: { search?: string; type_id?: string; mark_id?: string; store_id?: number }) => {
        router.get(route('dashboard'), {
            store_id: newFilters.store_id !== undefined ? newFilters.store_id : activeStoreId,
            search: newFilters.search !== undefined ? newFilters.search : search,
            vehicle_type_id: newFilters.type_id !== undefined ? newFilters.type_id : typeId,
            vehicle_mark_id: newFilters.mark_id !== undefined ? newFilters.mark_id : markId,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStoreChange = (storeId: number) => {
        router.get(route('dashboard'), { store_id: storeId });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleClearFilters = () => {
        setSearch('');
        setTypeId('');
        setMarkId('');
        router.get(route('dashboard'), { store_id: activeStoreId });
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency === 'USD' ? 'USD' : 'ARS',
            maximumFractionDigits: 0
        }).format(price);
    };

    const formatMileage = (mileage: number | null) => {
        if (mileage === null) return 'N/A';
        return new Intl.NumberFormat('es-AR').format(mileage) + ' km';
    };

    const formatLabel = (lbl: string) => {
        return lbl
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AutoDealer - Stock" />

            {/* Inject Custom CSS for dynamic dealership colors */}
            {activeStore && activeStore.custom_css && (
                <style dangerouslySetInnerHTML={{ __html: activeStore.custom_css }} />
            )}

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
                
                {/* Upper Navbar - Store Selector & Branding */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        {activeStore && activeStore.logo ? (
                            <img 
                                src={activeStore.logo} 
                                alt={activeStore.name} 
                                className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/logo.png';
                                }}
                            />
                        ) : (
                            <div className="bg-indigo-500/10 text-indigo-500 font-bold h-10 w-10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                                AD
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                                    {activeStore ? activeStore.name : 'AutoDealer'}
                                </h2>
                                {activeStore && (
                                    <a 
                                        href={route('public.catalog', activeStore.slug)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        title="Ver Catálogo Digital Público"
                                        className="text-slate-400 hover:text-brand transition-colors p-1"
                                    >
                                        <Share2 className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                Rol: <span className="capitalize font-semibold text-brand">{storeRole}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {isSuperAdmin ? (
                            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs px-3 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                Modo Administrador (Simulado)
                            </div>
                        ) : (
                            <>
                                <label htmlFor="store-select" className="text-sm font-medium text-slate-600 dark:text-zinc-400 hidden md:block whitespace-nowrap">
                                    Cambiar Concesionario:
                                </label>
                                <select
                                    id="store-select"
                                    value={activeStoreId || ''}
                                    onChange={(e) => handleStoreChange(Number(e.target.value))}
                                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2.5 sm:w-64"
                                >
                                    {stores.map((store) => (
                                        <option key={store.id} value={store.id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}
                    </div>
                </div>

                {stores.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 rounded-2xl text-center">
                        <ShieldAlert className="h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-200">No tienes concesionarios asignados</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-sm">
                            Comunícate con el administrador para que asocie tu cuenta de usuario a uno o más concesionarios.
                        </p>
                    </div>
                ) : (
                    activeStore && (
                        <>
                            {/* Store Header Banner & Profile */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-zinc-800 shadow-sm">
                                <div className="h-48 md:h-64 relative overflow-hidden bg-slate-100 dark:bg-zinc-800">
                                    {activeStore.banner ? (
                                        <img 
                                            src={activeStore.banner} 
                                            alt={activeStore.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-r from-[#1a1a1a] via-[#333333] to-[#c5a059] opacity-95" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div>
                                            <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                                                Concesionario Oficial
                                            </span>
                                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
                                                {activeStore.name}
                                            </h1>
                                            {activeStore.address && (
                                                <p className="text-sm text-slate-200 mt-1 flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4 shrink-0" />
                                                    {activeStore.address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-4">
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Presentación</h3>
                                            <p className="text-sm text-slate-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                                                {activeStore.presentation || 'Este concesionario no ha ingresado una descripción de presentación todavía.'}
                                            </p>
                                        </div>

                                        {activeStore.services.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">Servicios Disponibles</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {activeStore.services.map((service) => (
                                                        <span 
                                                            key={service.id} 
                                                            className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 dark:border-zinc-700 transition-colors cursor-default"
                                                            title={service.description}
                                                        >
                                                            {service.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800 space-y-4 text-sm">
                                        <h3 className="font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800 pb-2 flex items-center gap-1.5">
                                            Información de Contacto
                                        </h3>
                                        <div className="space-y-2.5 text-slate-600 dark:text-zinc-400">
                                            {activeStore.phone && (
                                                <p className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-brand shrink-0" />
                                                    <span>{activeStore.phone}</span>
                                                </p>
                                            )}
                                            {activeStore.email && (
                                                <p className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-brand shrink-0" />
                                                    <span className="truncate">{activeStore.email}</span>
                                                </p>
                                            )}
                                            {activeStore.working_hours && (
                                                <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                                                    <p className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1.5">
                                                        <Clock className="h-4 w-4 text-brand shrink-0" />
                                                        Horarios de Atención:
                                                    </p>
                                                    <div className="space-y-1 text-xs">
                                                        {Object.entries(activeStore.working_hours).map(([day, hours]) => (
                                                            <div key={day} className="flex justify-between">
                                                                <span className="capitalize text-slate-500 dark:text-zinc-400">{day.replace(/_/g, ' ')}</span>
                                                                <span className="font-medium text-slate-700 dark:text-zinc-300">{hours}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* KPI Metrics Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Stock</p>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">{vehicles.length}</h3>
                                    </div>
                                    <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl">
                                        <Car className="h-6 w-6" />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Disponibles</p>
                                        <h3 className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">
                                            {vehicles.filter(v => v.status === 'available').length}
                                        </h3>
                                    </div>
                                    <div className="bg-green-500/10 text-green-600 dark:text-green-400 p-3 rounded-xl">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Reservados</p>
                                        <h3 className="text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">
                                            {vehicles.filter(v => v.status === 'reserved').length}
                                        </h3>
                                    </div>
                                    <div className="bg-amber-500/10 text-amber-500 dark:text-amber-400 p-3 rounded-xl">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Valor Inventario</p>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-1 leading-tight">
                                            {(() => {
                                                const usd = vehicles.filter(v => v.status === 'available' && v.currency === 'USD').reduce((acc, v) => acc + Number(v.price), 0);
                                                const ars = vehicles.filter(v => v.status === 'available' && v.currency === 'ARS').reduce((acc, v) => acc + Number(v.price), 0);
                                                
                                                if (usd > 0 && ars > 0) {
                                                    return (
                                                        <div className="flex flex-col">
                                                            <span>{formatPrice(usd, 'USD')}</span>
                                                            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">{formatPrice(ars, 'ARS')}</span>
                                                        </div>
                                                    );
                                                } else if (ars > 0) {
                                                    return formatPrice(ars, 'ARS');
                                                } else {
                                                    return formatPrice(usd, 'USD');
                                                }
                                            })()}
                                        </h3>
                                    </div>
                                    <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl">
                                        <Landmark className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>

                            {/* Filters & Actions Bar */}
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <form onSubmit={handleSearchSubmit} className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="search" className="text-xs font-bold uppercase tracking-wider text-slate-400">Buscar por Modelo</Label>
                                        <div className="relative">
                                            <input
                                                id="search"
                                                type="text"
                                                placeholder="Ej: Corolla, Ranger..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full pl-9 pr-2.5 py-2"
                                            />
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="brand-filter" className="text-xs font-bold uppercase tracking-wider text-slate-400">Marca</Label>
                                        <select
                                            id="brand-filter"
                                            value={markId}
                                            onChange={(e) => {
                                                setMarkId(e.target.value);
                                                applyFilters({ mark_id: e.target.value });
                                            }}
                                            className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2"
                                        >
                                            <option value="">Todas las marcas</option>
                                            {marks.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="type-filter" className="text-xs font-bold uppercase tracking-wider text-slate-400">Tipo de Vehículo</Label>
                                        <select
                                            id="type-filter"
                                            value={typeId}
                                            onChange={(e) => {
                                                setTypeId(e.target.value);
                                                applyFilters({ type_id: e.target.value });
                                            }}
                                            className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2"
                                        >
                                            <option value="">Todos los tipos</option>
                                            {types.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </form>

                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button
                                        onClick={handleSearchSubmit}
                                        className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:text-slate-950 text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex-1 md:flex-none"
                                    >
                                        Filtrar
                                    </Button>
                                    {(search || typeId || markId) && (
                                        <Button
                                            onClick={handleClearFilters}
                                            variant="ghost"
                                            className="border border-slate-200 text-slate-700 dark:text-zinc-300 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-sm px-3 py-2 rounded-lg flex items-center justify-center gap-1"
                                            title="Limpiar filtros"
                                        >
                                            <X className="h-4 w-4" />
                                            <span>Limpiar</span>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Vehicles Listing Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                                        Vehículos en Stock ({vehicles.length})
                                    </h2>
                                    <Button
                                        onClick={() => router.get(route('vehicles.manage'))}
                                        className="bg-brand hover:bg-brand-hover text-slate-950 font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Gestionar Inventario
                                    </Button>
                                </div>

                                {vehicles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 rounded-2xl text-center shadow-sm">
                                        <ShieldAlert className="h-10 w-10 text-slate-300 mb-2" />
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-zinc-200">No se encontraron vehículos</h4>
                                        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
                                            Intenta cambiar los filtros o ingresa al menú de Vehículos para agregar stock.
                                        </p>
                                        {(search || typeId || markId) && (
                                            <button
                                                onClick={handleClearFilters}
                                                className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 underline mt-3"
                                            >
                                                Limpiar todos los filtros
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    /* Vehicles Grid */
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {vehicles.map((vehicle) => (
                                            <div 
                                                key={vehicle.id} 
                                                className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-slate-200/85 dark:border-zinc-800 hover:border-slate-300/90 dark:hover:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
                                            >
                                                {/* Cover Image & Status Badge */}
                                                <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-zinc-800">
                                                    {vehicle.cover_image ? (
                                                        <img 
                                                            src={vehicle.cover_image} 
                                                            alt={`${vehicle.mark.name} ${vehicle.model}`} 
                                                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                                            Sin Imagen de Portada
                                                        </div>
                                                    )}
                                                    
                                                    {/* Status Badge */}
                                                    <div className="absolute top-3 right-3">
                                                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-sm ${
                                                            vehicle.status === 'available' ? 'bg-green-600/90' : 
                                                            vehicle.status === 'reserved' ? 'bg-amber-500/90' : 
                                                            'bg-red-600/90'
                                                        }`}>
                                                            {vehicle.status === 'available' ? 'Disponible' : 
                                                             vehicle.status === 'reserved' ? 'Reservado' : 
                                                             'Vendido'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Card Body */}
                                                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                                                {vehicle.mark.name}
                                                            </span>
                                                            <span className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded">
                                                                {vehicle.type.name}
                                                            </span>
                                                        </div>
                                                        
                                                        <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 line-clamp-1 mt-1">
                                                            {vehicle.model}
                                                        </h3>
                                                        
                                                        <p className="text-[10px] text-slate-400 mt-0.5">Patente: <span className="font-mono uppercase">{vehicle.plate || 'N/A'}</span></p>

                                                        {/* Cost Price - Hidden from normal employees */}
                                                        {!isEmployee && vehicle.cost_price !== null && (
                                                            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1.5 flex items-center gap-1">
                                                                <Landmark className="h-3.5 w-3.5" />
                                                                Costo: {formatPrice(vehicle.cost_price, vehicle.currency)}
                                                            </p>
                                                        )}

                                                        {/* Specs Badges */}
                                                        <div className="grid grid-cols-3 gap-2 mt-3 text-slate-500 dark:text-zinc-400 text-xs border-y border-slate-100 dark:border-zinc-800 py-2">
                                                            <div className="flex items-center gap-1" title="Año">
                                                                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                                <span>{vehicle.year}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1" title="Kilometraje">
                                                                <Gauge className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                                <span className="truncate">{formatMileage(vehicle.mileage)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1" title="Combustible">
                                                                <Fuel className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                                <span className="capitalize truncate">{vehicle.fuel_type || 'N/A'}</span>
                                                            </div>
                                                        </div>

                                                        {/* Dynamic details labels */}
                                                        {vehicle.details.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                                {vehicle.details.slice(0, 3).map((detail) => (
                                                                    <span 
                                                                        key={detail.id} 
                                                                        className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-100 dark:border-zinc-800"
                                                                    >
                                                                        <span className="capitalize">{formatLabel(detail.label)}</span>: {detail.value}
                                                                    </span>
                                                                ))}
                                                                {vehicle.details.length > 3 && (
                                                                    <span className="text-slate-400 text-[10px] font-semibold">
                                                                        +{vehicle.details.length - 3} más
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Price Tag & Actions */}
                                                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Precio de Venta</span>
                                                            <span className="text-base font-black text-slate-900 dark:text-zinc-100">
                                                                {formatPrice(vehicle.price, vehicle.currency)}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenSharePreview(vehicle);
                                                            }}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs h-8 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                                                        >
                                                            <Share2 className="h-3.5 w-3.5" />
                                                            <span>Ficha</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )
                )}
            </div>

            <SharePreviewDialog 
                vehicle={selectedShareVehicle} 
                store={activeStore} 
                isOpen={isShareOpen} 
                onClose={() => setIsShareOpen(false)} 
            />
        </AppLayout>
    );
}
