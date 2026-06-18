import { Head } from '@inertiajs/react';
import {
    Printer, Phone, Mail, MapPin, Globe, Calendar,
    Gauge, Fuel, Shield, Sparkles, Star
} from 'lucide-react';
import { useEffect } from 'react';

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
    store_id: number;
    model: string;
    year: number;
    price: number;
    currency: string;
    cover_image: string;
    plate: string;
    engine: string;
    fuel_type: string;
    mileage: number;
    description: string;
    status: string;
    type: { id: number; name: string };
    mark: { id: number; name: string };
    details: VehicleDetail[];
    images: VehicleImage[];
}

interface Store {
    id: number;
    name: string;
    slug: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    whatsapp: string | null;
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    website: string | null;
    logo: string | null;
    banner: string | null;
    primary_color: string | null;
    secondary_color: string | null;
}

interface PrintProps {
    vehicle: Vehicle;
    store: Store;
}

export default function VehiclePrintPage({ vehicle, store }: PrintProps) {

    // Automatically trigger printing when the page mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

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

    const primaryColor = store.primary_color || '#1e1b4b';

    return (
        <div className="min-h-screen bg-white text-slate-900 p-8 max-w-5xl mx-auto font-sans print:p-0 print:max-w-full">
            <Head title={`Ficha Técnica - ${vehicle.mark.name} ${vehicle.model}`} />

            {/* Print styles overrides */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body {
                        background-color: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break-before {
                        page-break-before: always !important;
                    }
                    .print-border {
                        border-color: #cbd5e1 !important;
                    }
                }
            ` }} />

            {/* Action Bar (hidden when printing) */}
            <div className="no-print flex items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-8">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500">Ficha Técnica Oficial</span>
                    <span className="text-[10px] text-slate-400">Presiona Imprimir si el diálogo no se abre automáticamente.</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                        <Printer className="h-4 w-4" />
                        Imprimir Ficha
                    </button>
                    <button
                        onClick={() => window.close()}
                        className="border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div>

            {/* DOCUMENT WRAPPER */}
            <div className="border border-slate-200 rounded-3xl p-8 print:border-0 print:p-0">

                {/* Header: Dealership info and logo */}
                <div className="flex items-start justify-between gap-6 pb-6 border-b border-slate-200 print-border">
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600" style={{ color: primaryColor }}>
                            Ficha Técnica de Vehículo
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 mt-1">{store.name}</h1>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-4 text-xs text-slate-600">
                            {store.address && (
                                <p className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{store.address}</span>
                                </p>
                            )}
                            {store.phone && (
                                <p className="flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span>{store.phone}</span>
                                </p>
                            )}
                            {store.email && (
                                <p className="flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{store.email}</span>
                                </p>
                            )}
                            {store.website && (
                                <p className="flex items-center gap-1.5">
                                    <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{store.website}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Logo */}
                    {store.logo && (
                        <div className="h-20 w-20 rounded-2xl border border-slate-200 overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
                            <img src={store.logo} alt={store.name} className="h-full w-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Main Vehicle Header: Title, Status and Price */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                {vehicle.type.name}
                            </span>
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                                {vehicle.mark.name}
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mt-1 leading-tight">
                            {vehicle.model}
                        </h2>
                        {vehicle.plate && (
                            <p className="text-xs text-slate-400 mt-1 font-mono uppercase">Patente / Matrícula: <strong className="text-slate-700">{vehicle.plate}</strong></p>
                        )}
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Precio Sugerido</span>
                        <span className="text-3xl font-black text-indigo-900 leading-none" style={{ color: primaryColor }}>
                            {formatPrice(vehicle.price, vehicle.currency)}
                        </span>
                    </div>
                </div>

                {/* Specs Technical Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/80 rounded-2xl border border-slate-200/50 p-4 mt-6">
                    <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Año Modelo</span>
                        <p className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            {vehicle.year}
                        </p>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kilometraje</span>
                        <p className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                            <Gauge className="h-4 w-4 text-indigo-500" />
                            {formatMileage(vehicle.mileage)}
                        </p>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Combustible</span>
                        <p className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 capitalize">
                            <Fuel className="h-4 w-4 text-indigo-500" />
                            {vehicle.fuel_type || 'N/A'}
                        </p>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Motor</span>
                        <p className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 truncate" title={vehicle.engine}>
                            <Sparkles className="h-4 w-4 text-indigo-500" />
                            {vehicle.engine || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Cover Image Showcase */}
                {vehicle.cover_image && (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 mt-6 max-h-[350px]">
                        <img src={vehicle.cover_image} alt={vehicle.model} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Additional details templates and specs details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">

                    {/* Left Column: Spec Sheet */}
                    <div className="space-y-4">
                        <h3 className="text-xs uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <Star className="h-4 w-4 text-amber-500" />
                            Especificaciones
                        </h3>

                        <div className="divide-y divide-slate-100 text-sm">
                            {vehicle.details.map(detail => (
                                <div key={detail.id} className="flex justify-between py-2">
                                    <span className="text-slate-500 font-medium capitalize">{formatLabel(detail.label)}</span>
                                    <span className="font-semibold text-slate-800">{detail.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Presentation Description */}
                    <div className="space-y-4">
                        <h3 className="text-xs uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <Shield className="h-4 w-4 text-emerald-500" />
                            Notas del Concesionario
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/30 p-4 rounded-2xl border border-slate-100">
                            {vehicle.description || 'Esta unidad ha sido verificada mecánicamente y se encuentra en óptimas condiciones de uso, lista para transferir y circular.'}
                        </p>
                    </div>
                </div>

                {/* Showcase gallery for prints */}
                {vehicle.images.length > 0 && (
                    <div className="page-break-before pt-6 mt-8 border-t border-slate-200 print-border">
                        <h3 className="text-xs uppercase font-black tracking-wider text-slate-400 mb-4">
                            Galería de Imágenes
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {vehicle.images.slice(0, 4).map(img => (
                                <div key={img.id} className="aspect-video rounded-xl overflow-hidden border border-slate-200 max-h-48">
                                    <img src={img.path} className="h-full w-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer specs sheet */}
                <div className="border-t border-slate-200 print-border mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2 text-center sm:text-left">
                    <p>&copy; {new Date().getFullYear()} {store.name} • Catálogo digital potenciado por AutoDealer</p>
                    <p className="font-mono">Ficha Generada el {new Date().toLocaleDateString('es-AR')}</p>
                </div>
            </div>
        </div>
    );
}
