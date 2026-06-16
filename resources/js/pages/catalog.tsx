import { Head, router } from '@inertiajs/react';
import { 
    Search, X, MapPin, Phone, Mail, Clock, Calendar, Gauge, Fuel, 
    Layers, Award, PhoneCall, Check, Share2, Info, ChevronRight, Sparkles 
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
}

interface PublicCatalogProps {
    store: Store;
    vehicles: Vehicle[];
    marks: FilterMetadata[];
    types: FilterMetadata[];
    templates: TemplateField[];
    filters: {
        vehicle_type_id: string;
        vehicle_mark_id: string;
        search: string;
    };
}

export default function PublicCatalog({ 
    store, 
    vehicles, 
    marks, 
    types, 
    templates, 
    filters 
}: PublicCatalogProps) {
    const primaryColor = store.primary_color || '#0f172a'; // Slate 900 default
    const secondaryColor = store.secondary_color || '#4f46e5'; // Indigo 600 default

    // Selected vehicle for details modal
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    // Filters local states
    const [search, setSearch] = useState(filters.search || '');
    const [typeId, setTypeId] = useState(filters.vehicle_type_id || '');
    const [markId, setMarkId] = useState(filters.vehicle_mark_id || '');

    const applyFilters = (newFilters: { search?: string; type_id?: string; mark_id?: string }) => {
        router.get(route('public.catalog', store.slug), {
            search: newFilters.search !== undefined ? newFilters.search : search,
            vehicle_type_id: newFilters.type_id !== undefined ? newFilters.type_id : typeId,
            vehicle_mark_id: newFilters.mark_id !== undefined ? newFilters.mark_id : markId,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleClearFilters = () => {
        setSearch('');
        setTypeId('');
        setMarkId('');
        router.get(route('public.catalog', store.slug));
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

    const openDetailsModal = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setActiveImage(vehicle.cover_image);
    };

    const getWhatsAppLink = (vehicle: Vehicle) => {
        const phone = store.whatsapp || store.phone || '';
        // Clean phone number (leave digits only)
        const cleanPhone = phone.replace(/\D/g, '');
        const message = `Hola! Estoy interesado en el vehículo ${vehicle.mark.name} ${vehicle.model} (${vehicle.year}) publicado en su catálogo digital. ¿Está disponible?`;
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    };

    const formatLabel = (lbl: string) => {
        return lbl
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-12">
            <Head title={`${store.name} - Catálogo Digital`} />

            {/* Custom CSS injector for dynamic color values */}
            <style dangerouslySetInnerHTML={{ __html: `
                :root {
                    --store-primary: ${primaryColor};
                    --store-secondary: ${secondaryColor};
                }
                .bg-store-primary { background-color: var(--store-primary); }
                .text-store-primary { color: var(--store-primary); }
                .border-store-primary { border-color: var(--store-primary); }
                
                .bg-store-secondary { background-color: var(--store-secondary); }
                .text-store-secondary { color: var(--store-secondary); }
                .border-store-secondary { border-color: var(--store-secondary); }
                .hover\\:bg-store-secondary-dark:hover { filter: brightness(0.9); }
            ` }} />

            {store.custom_css && (
                <style dangerouslySetInnerHTML={{ __html: store.custom_css }} />
            )}

            {/* Public Header Navbar */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {store.logo ? (
                            <img src={store.logo} alt={store.name} className="h-10 w-10 rounded-lg object-cover border border-slate-200" />
                        ) : (
                            <div className="bg-store-primary text-white font-bold h-10 w-10 rounded-lg flex items-center justify-center">
                                {store.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">{store.name}</h1>
                            <p className="text-[10px] text-slate-500 font-medium">Catálogo Digital Oficial</p>
                        </div>
                    </div>

                    {store.phone && (
                        <a 
                            href={`tel:${store.phone}`} 
                            className="bg-store-primary text-white hover:bg-slate-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                            <PhoneCall className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Llamar Ahora</span>
                        </a>
                    )}
                </div>
            </header>

            {/* Hero Cover Banner */}
            <section className="relative h-64 md:h-[350px] overflow-hidden bg-slate-950">
                {store.banner ? (
                    <img src={store.banner} alt={store.name} className="w-full h-full object-cover opacity-90" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 opacity-90" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white max-w-7xl mx-auto px-4">
                    <span className="bg-store-secondary text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Catálogo Online
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black mt-2 tracking-tight">{store.name}</h2>
                    {store.address && (
                        <p className="text-slate-200 mt-1 flex items-center gap-1 text-sm">
                            <MapPin className="h-4 w-4 shrink-0 text-store-secondary" />
                            {store.address}
                        </p>
                    )}
                </div>
            </section>

            {/* Main content grid */}
            <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Store Profile & Dynamic Filters */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Presentation info */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        <div>
                            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Quiénes Somos</h3>
                            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                                {store.presentation || 'Bienvenidos a nuestro concesionario oficial digital. Explora nuestro stock seleccionado.'}
                            </p>
                        </div>
                        
                        {store.services.length > 0 && (
                            <div className="border-t border-slate-100 pt-3">
                                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Servicios Destacados</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {store.services.map(s => (
                                        <span 
                                            key={s.id} 
                                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium cursor-default transition-colors"
                                            title={s.description}
                                        >
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Filters Form */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            Filtrar Stock
                        </h3>
                        <form onSubmit={handleSearchSubmit} className="space-y-4 text-sm">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Modelo</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Ej: Corolla, Ranger..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-950 text-sm rounded-lg focus:ring-store-secondary focus:border-store-secondary block pl-9 pr-2.5 py-2"
                                    />
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Marca</label>
                                <select
                                    value={markId}
                                    onChange={e => {
                                        setMarkId(e.target.value);
                                        applyFilters({ mark_id: e.target.value });
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-950 text-sm rounded-lg focus:ring-store-secondary focus:border-store-secondary block p-2"
                                >
                                    <option value="">Todas las marcas</option>
                                    {marks.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Tipo de Vehículo</label>
                                <select
                                    value={typeId}
                                    onChange={e => {
                                        setTypeId(e.target.value);
                                        applyFilters({ type_id: e.target.value });
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-950 text-sm rounded-lg focus:ring-store-secondary focus:border-store-secondary block p-2"
                                >
                                    <option value="">Todos los tipos</option>
                                    {types.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-slate-100">
                                <Button 
                                    type="submit" 
                                    className="bg-store-primary text-white w-full hover:bg-slate-800 font-semibold text-xs"
                                >
                                    Buscar
                                </Button>
                                {(search || typeId || markId) && (
                                    <Button 
                                        type="button" 
                                        onClick={handleClearFilters} 
                                        variant="ghost" 
                                        className="border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs shrink-0"
                                    >
                                        Limpiar
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Contact detail information */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Información y Contacto</h3>
                        <div className="space-y-3 text-slate-600">
                            {store.phone && (
                                <div className="flex items-center gap-2.5">
                                    <Phone className="h-4 w-4 text-store-secondary shrink-0" />
                                    <span>Teléfono: <strong>{store.phone}</strong></span>
                                </div>
                            )}
                            {store.email && (
                                <div className="flex items-center gap-2.5">
                                    <Mail className="h-4 w-4 text-store-secondary shrink-0" />
                                    <span className="truncate">Email: <strong>{store.email}</strong></span>
                                </div>
                            )}
                            {store.working_hours && (
                                <div className="pt-2 border-t border-slate-100">
                                    <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                                        <Clock className="h-4 w-4 text-store-secondary shrink-0" />
                                        Horarios de Atención:
                                    </p>
                                    <div className="space-y-1">
                                        {Object.entries(store.working_hours).map(([day, hours]) => (
                                            <div key={day} className="flex justify-between">
                                                <span className="capitalize text-slate-500">{day.replace(/_/g, ' ')}</span>
                                                <span className="font-semibold text-slate-700">{hours}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vehicles listing catalog */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <span>Vehículos en Exhibición ({vehicles.length})</span>
                    </h3>

                    {vehicles.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-xs">
                            <Info className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                            <h4 className="font-bold text-slate-700">No hay vehículos disponibles</h4>
                            <p className="text-xs text-slate-400 mt-1">Intenta ajustando los filtros de búsqueda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {vehicles.map(vehicle => (
                                <div 
                                    key={vehicle.id}
                                    onClick={() => openDetailsModal(vehicle)}
                                    className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 cursor-pointer transition-all duration-300 flex flex-col group"
                                >
                                    {/* Cover Image */}
                                    <div className="aspect-video relative overflow-hidden bg-slate-100">
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
                                        <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-sm ${
                                            vehicle.status === 'available' ? 'bg-green-600/90' : 
                                            vehicle.status === 'reserved' ? 'bg-amber-500/90' : 
                                            'bg-red-600/90'
                                        }`}>
                                            {vehicle.status === 'available' ? 'Disponible' : 
                                             vehicle.status === 'reserved' ? 'Reservado' : 'Vendido'}
                                        </span>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                                        <div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-bold text-store-secondary uppercase tracking-wider">
                                                    {vehicle.mark.name}
                                                </span>
                                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                                    {vehicle.type.name}
                                                </span>
                                            </div>

                                            <h4 className="font-extrabold text-base text-slate-900 mt-1 line-clamp-1 group-hover:text-store-secondary transition-colors">
                                                {vehicle.model}
                                            </h4>

                                            {/* Technical specs */}
                                            <div className="grid grid-cols-3 gap-2 mt-3 text-slate-500 text-xs border-y border-slate-100 py-2">
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
                                        </div>

                                        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                                            <span className="text-xs text-slate-400 font-semibold">Precio</span>
                                            <span className="text-lg font-black text-slate-900">
                                                {formatPrice(vehicle.price, vehicle.currency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Public Footer */}
            <footer className="max-w-7xl mx-auto px-4 mt-12 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} {store.name}. Desarrollado con tecnología de AutoDealer. Todos los derechos reservados.
            </footer>

            {/* --- VEHICLE DETAILS PUBLIC MODAL --- */}
            <Dialog open={!!selectedVehicle} onOpenChange={(open) => !open && setSelectedVehicle(null)}>
                {selectedVehicle && (
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-slate-200 shadow-2xl p-0 overflow-hidden">
                        
                        {/* Upper Gallery showcase */}
                        <div className="relative bg-slate-950 aspect-video w-full">
                            <img src={activeImage || ''} alt={selectedVehicle.model} className="w-full h-full object-cover" />
                            
                            {/* Return absolute status badge */}
                            <span className={`absolute top-4 right-4 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white shadow-md ${
                                selectedVehicle.status === 'available' ? 'bg-green-600' : 
                                selectedVehicle.status === 'reserved' ? 'bg-amber-500' : 
                                'bg-red-600'
                            }`}>
                                {selectedVehicle.status === 'available' ? 'Disponible' : 
                                 selectedVehicle.status === 'reserved' ? 'Reservado' : 'Vendido'}
                            </span>
                        </div>

                        {/* Gallery Thumbnails */}
                        {selectedVehicle.images.length > 0 && (
                            <div className="flex gap-2 p-3 overflow-x-auto bg-slate-900 border-b border-slate-800">
                                <button 
                                    onClick={() => setActiveImage(selectedVehicle.cover_image)}
                                    className={`relative h-12 w-20 rounded overflow-hidden shrink-0 border-2 ${
                                        activeImage === selectedVehicle.cover_image ? 'border-store-secondary' : 'border-transparent'
                                    }`}
                                >
                                    <img src={selectedVehicle.cover_image} className="h-full w-full object-cover" />
                                </button>
                                {selectedVehicle.images.map(img => (
                                    <button 
                                        key={img.id}
                                        onClick={() => setActiveImage(img.path)}
                                        className={`relative h-12 w-20 rounded overflow-hidden shrink-0 border-2 ${
                                            activeImage === img.path ? 'border-store-secondary' : 'border-transparent'
                                        }`}
                                    >
                                        <img src={img.path} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="p-6 space-y-6">
                            
                            {/* General details title and price */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-extrabold uppercase tracking-widest text-store-secondary">
                                            {selectedVehicle.mark.name}
                                        </span>
                                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                            {selectedVehicle.type.name}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-950 mt-1">
                                        {selectedVehicle.model}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Patente: <span className="uppercase font-mono font-semibold">{selectedVehicle.plate || 'N/A'}</span></p>
                                </div>

                                <div className="text-left sm:text-right shrink-0">
                                    <span className="text-xs text-slate-400 font-semibold block">Precio de Lista</span>
                                    <span className="text-3xl font-black text-slate-950 leading-tight">
                                        {formatPrice(selectedVehicle.price, selectedVehicle.currency)}
                                    </span>
                                </div>
                            </div>

                            {/* Main specifications grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Año</span>
                                    <p className="font-extrabold text-sm text-slate-800 flex items-center gap-1">
                                        <Calendar className="h-4 w-4 text-store-secondary shrink-0" />
                                        {selectedVehicle.year}
                                    </p>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kilometraje</span>
                                    <p className="font-extrabold text-sm text-slate-800 flex items-center gap-1">
                                        <Gauge className="h-4 w-4 text-store-secondary shrink-0" />
                                        {formatMileage(selectedVehicle.mileage)}
                                    </p>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Combustible</span>
                                    <p className="font-extrabold text-sm text-slate-800 flex items-center gap-1 capitalize">
                                        <Fuel className="h-4 w-4 text-store-secondary shrink-0" />
                                        {selectedVehicle.fuel_type || 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Motor</span>
                                    <p className="font-extrabold text-sm text-slate-800 flex items-center gap-1 truncate" title={selectedVehicle.engine}>
                                        <Sparkles className="h-4 w-4 text-store-secondary shrink-0" />
                                        {selectedVehicle.engine || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Section 2: Description text */}
                            {selectedVehicle.description && (
                                <div className="space-y-1.5">
                                    <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Descripción del Concesionario</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                                        {selectedVehicle.description}
                                    </p>
                                </div>
                            )}

                            {/* Section 3: Dynamic specifications template rendering */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 bg-white p-2 rounded-xl">
                                {templates
                                    .filter(t => t.vehicle_type_id === selectedVehicle.type.id)
                                    .map(tpl => {
                                        const detail = selectedVehicle.details.find(d => d.label === tpl.label);
                                        if (!detail || !detail.value) return null;
                                        return (
                                            <div key={tpl.id} className="flex justify-between items-center py-2.5 border-b border-slate-100 text-sm">
                                                <span className="text-slate-500 font-semibold capitalize">
                                                    {formatLabel(tpl.label)}
                                                </span>
                                                <span className="font-bold text-slate-800">
                                                    {detail.value}
                                                </span>
                                            </div>
                                        );
                                    })
                                }
                            </div>

                            {/* Action Query: Contact buttons */}
                            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                                <a 
                                    href={getWhatsAppLink(selectedVehicle)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold text-center px-6 py-3.5 rounded-xl shadow-md transition-colors flex-1 flex items-center justify-center gap-2"
                                >
                                    <Share2 className="h-5 w-5 rotate-90" />
                                    Consultar por WhatsApp
                                </a>
                                
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedVehicle(null)}
                                    className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-6 py-3.5 rounded-xl transition-colors shrink-0"
                                >
                                    Cerrar
                                </button>
                            </div>

                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}
