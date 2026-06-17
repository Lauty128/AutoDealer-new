import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { 
    Search, X, Plus, Pencil, Trash2, Calendar, Gauge, Fuel, 
    Landmark, ShieldAlert, Upload, CheckCircle, ChevronDown
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Interfaces matching the backend models
interface Store {
    id: number;
    name: string;
    slug: string;
    phone: string;
    email: string;
    logo: string;
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
    store_id: number;
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

interface ManageProps {
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

interface VehicleForm {
    store_id: number | string;
    vehicle_type_id: string;
    vehicle_mark_id: string;
    model: string;
    year: number;
    price: string;
    currency: string;
    plate: string;
    engine: string;
    suspension: string;
    fuel_type: string;
    mileage: string;
    description: string;
    status: string;
    cost_price: string;
    cover_image_file: File | null;
    images_files: File[];
    delete_images: number[];
    details: Record<string, string>;
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Vehículos',
        href: '/vehicles/manage',
    },
];

export default function Manage({ 
    stores, 
    activeStoreId, 
    vehicles, 
    marks, 
    types, 
    fuels,
    templates, 
    filters 
}: ManageProps) {
    const activeStore = stores.find(s => s.id === activeStoreId);
    
    // User Role check in active store
    const storeRole = activeStore?.pivot?.role || 'employee';
    const isEmployee = storeRole === 'employee' || storeRole === 'editor';

    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user.is_superadmin === true || auth.user.is_superadmin === 1;

    // Flash Messages
    const { flash } = usePage<SharedData>().props as any;

    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [typeId, setTypeId] = useState(filters.vehicle_type_id || '');
    const [markId, setMarkId] = useState(filters.vehicle_mark_id || '');

    // Modal Control States
    const [isOpenFormModal, setIsOpenFormModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    // Sync filters on prop changes
    useEffect(() => {
        setSearch(filters.search || '');
        setTypeId(filters.vehicle_type_id || '');
        setMarkId(filters.vehicle_mark_id || '');
    }, [filters]);

    // Handle filter application
    const applyFilters = (newFilters: { search?: string; type_id?: string; mark_id?: string; store_id?: number }) => {
        router.get(route('vehicles.manage'), {
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
        router.get(route('vehicles.manage'), { store_id: storeId });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleClearFilters = () => {
        setSearch('');
        setTypeId('');
        setMarkId('');
        router.get(route('vehicles.manage'), { store_id: activeStoreId });
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

    const handleStatusChange = (vehicle: Vehicle, newStatus: string) => {
        router.post(route('vehicles.updateStatus', vehicle.id), {
            status: newStatus
        });
    };

    const handleDeleteVehicle = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este vehículo de forma permanente?')) {
            router.delete(route('vehicles.destroy', id));
        }
    };

    // --- FORM MANAGEMENT ---
    const { data, setData, post, processing, errors, reset } = useForm<VehicleForm>({
        store_id: activeStoreId || '',
        vehicle_type_id: '',
        vehicle_mark_id: '',
        model: '',
        year: new Date().getFullYear(),
        price: '',
        currency: 'USD',
        plate: '',
        engine: '',
        suspension: '',
        fuel_type: '',
        mileage: '',
        description: '',
        status: 'available',
        cost_price: '',
        cover_image_file: null,
        images_files: [],
        delete_images: [],
        details: {},
    });

    // File input refs
    const coverInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    
    // Preview states
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [existingGallery, setExistingGallery] = useState<VehicleImage[]>([]);

    // Set dynamic template default values when vehicle type is chosen (Only on Create mode)
    const handleVehicleTypeChange = (selectedTypeIdStr: string) => {
        setData(prev => {
            const next = { ...prev, vehicle_type_id: selectedTypeIdStr };
            
            // Only autofill defaults if we are creating a new vehicle
            if (!editingVehicle) {
                const typeIdNum = Number(selectedTypeIdStr);
                const relevantTemplates = templates.filter(t => t.vehicle_type_id === typeIdNum);
                const initialDetails: Record<string, string> = {};
                relevantTemplates.forEach(t => {
                    initialDetails[t.label] = t.default_value || '';
                });
                next.details = initialDetails;
            }
            
            return next;
        });
    };

    // Prepopulate form when editing
    const openEditModal = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setCoverPreview(vehicle.cover_image);
        setExistingGallery(vehicle.images);
        setGalleryPreviews([]);

        // Prepopulate dynamic details
        const detailsMap: Record<string, string> = {};
        vehicle.details.forEach(d => {
            detailsMap[d.label] = d.value;
        });

        // Fill missing template fields with empty strings
        const relevantTemplates = templates.filter(t => t.vehicle_type_id === vehicle.type.id);
        relevantTemplates.forEach(t => {
            if (!(t.label in detailsMap)) {
                detailsMap[t.label] = t.default_value || '';
            }
        });

        setData({
            store_id: vehicle.store_id,
            vehicle_type_id: String(vehicle.type.id),
            vehicle_mark_id: String(vehicle.mark.id),
            model: vehicle.model,
            year: vehicle.year,
            price: String(vehicle.price),
            currency: vehicle.currency,
            plate: vehicle.plate || '',
            engine: vehicle.engine || '',
            suspension: vehicle.suspension || '',
            fuel_type: vehicle.fuel_type || '',
            mileage: vehicle.mileage !== null ? String(vehicle.mileage) : '',
            description: vehicle.description || '',
            status: vehicle.status,
            cost_price: vehicle.cost_price !== null ? String(vehicle.cost_price) : '',
            cover_image_file: null,
            images_files: [],
            delete_images: [],
            details: detailsMap,
        });

        setIsOpenFormModal(true);
    };

    const openCreateModal = () => {
        setEditingVehicle(null);
        setCoverPreview(null);
        setGalleryPreviews([]);
        setExistingGallery([]);
        
        reset();
        
        // Load defaults of first type
        if (types.length > 0) {
            handleVehicleTypeChange(String(types[0].id));
            setData('vehicle_mark_id', String(marks[0]?.id || ''));
        }

        setIsOpenFormModal(true);
    };

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('cover_image_file', file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setData('images_files', [...data.images_files, ...files]);
            
            const fileUrls = files.map(file => URL.createObjectURL(file));
            setGalleryPreviews([...galleryPreviews, ...fileUrls]);
        }
    };

    const handleRemoveExistingImage = (imageId: number) => {
        setData('delete_images', [...data.delete_images, imageId]);
        setExistingGallery(existingGallery.filter(img => img.id !== imageId));
    };

    const handleRemoveNewGalleryImage = (index: number) => {
        setData('images_files', data.images_files.filter((_, idx) => idx !== index));
        setGalleryPreviews(galleryPreviews.filter((_, idx) => idx !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingVehicle) {
            post(route('vehicles.update', editingVehicle.id), {
                onSuccess: () => {
                    setIsOpenFormModal(false);
                    reset();
                }
            });
        } else {
            post(route('vehicles.store'), {
                onSuccess: () => {
                    setIsOpenFormModal(false);
                    reset();
                }
            });
        }
    };

    const handleDetailChange = (label: string, value: string) => {
        setData('details', {
            ...data.details,
            [label]: value
        });
    };

    const formatLabel = (lbl: string) => {
        return lbl
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AutoDealer - Vehículos" />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
                
                {/* Status Alerts */}
                {flash?.message && (
                    <div className={`p-4 rounded-xl border flex items-center gap-2 text-sm shadow-sm ${
                        flash.status === 'success' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300' 
                            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300'
                    }`}>
                        <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                        <span>{flash.message}</span>
                    </div>
                )}

                {/* Upper Navbar - Store Selector & Title */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500/10 text-indigo-500 font-bold h-10 w-10 rounded-lg flex items-center justify-center border border-indigo-500/20 shrink-0">
                            AD
                        </div>
                        <div>
                            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                                Gestión de Inventario
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                Concesionario: <span className="font-semibold text-brand">{activeStore ? activeStore.name : 'Ninguno'}</span> | Rol: <span className="capitalize font-semibold text-brand">{storeRole}</span>
                            </p>
                        </div>
                    </div>

                    {isSuperAdmin ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs px-3 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                Modo Administrador (Simulado)
                            </div>
                        </div>
                    ) : (
                        stores.length > 1 && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label htmlFor="store-select" className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden md:block">
                                    Concesionario:
                                </label>
                                <select
                                    id="store-select"
                                    value={activeStoreId || ''}
                                    onChange={(e) => handleStoreChange(Number(e.target.value))}
                                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs rounded-lg p-2 font-medium focus:ring-brand focus:border-brand w-full sm:w-48"
                                >
                                    {stores.map((store) => (
                                        <option key={store.id} value={store.id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )
                    )}
                </div>

                {stores.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 rounded-2xl text-center shadow-sm">
                        <ShieldAlert className="h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-200">No tienes concesionarios asignados</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-sm">
                            Comunícate con el administrador para que asocie tu cuenta de usuario a uno o más concesionarios.
                        </p>
                    </div>
                ) : (
                    activeStore && (
                        <>
                            {/* Filters & Actions Bar */}
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
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
                                        onClick={openCreateModal}
                                        className="bg-brand hover:bg-brand-hover text-slate-950 font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Agregar Vehículo
                                    </Button>
                                </div>

                                {vehicles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 rounded-2xl text-center shadow-sm">
                                        <ShieldAlert className="h-10 w-10 text-slate-300 mb-2" />
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-zinc-200">No se encontraron vehículos</h4>
                                        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
                                            Intenta cambiar los filtros o agrega un nuevo vehículo al catálogo.
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
                                                {/* Cover Image & Quick Status */}
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
                                                    
                                                    {/* Quick Status Toggle Trigger */}
                                                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                                        <div className="relative">
                                                            <select
                                                                value={vehicle.status}
                                                                onChange={(e) => handleStatusChange(vehicle, e.target.value)}
                                                                className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border-none cursor-pointer text-white shadow-sm appearance-none pr-5 ${
                                                                    vehicle.status === 'available' ? 'bg-green-600/90' : 
                                                                    vehicle.status === 'reserved' ? 'bg-amber-500/90' : 
                                                                    'bg-red-600/90'
                                                                }`}
                                                            >
                                                                <option value="available" className="bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">Disponible</option>
                                                                <option value="reserved" className="bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">Reservado</option>
                                                                <option value="sold" className="bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">Vendido</option>
                                                            </select>
                                                            <ChevronDown className="h-3 w-3 absolute right-1.5 top-1.5 text-white pointer-events-none" />
                                                        </div>
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
                                                        
                                                        <div className="flex items-start justify-between gap-2 mt-1">
                                                            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 line-clamp-1">
                                                                {vehicle.model}
                                                            </h3>
                                                            {/* Actions Trigger buttons */}
                                                            <div className="flex gap-1 shrink-0">
                                                                <button 
                                                                    onClick={() => openEditModal(vehicle)}
                                                                    title="Editar Vehículo"
                                                                    className="text-slate-400 hover:text-indigo-500 p-1 transition-colors"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                                                    title="Eliminar Vehículo"
                                                                    className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
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

                                                    {/* Price Tag */}
                                                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                                                        <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">Precio de Venta</span>
                                                        <span className="text-lg font-black text-slate-900 dark:text-zinc-100">
                                                            {formatPrice(vehicle.price, vehicle.currency)}
                                                        </span>
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

            {/* --- ADD/EDIT VEHICLE MODAL FORM --- */}
            <Dialog open={isOpenFormModal} onOpenChange={setIsOpenFormModal}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            {editingVehicle ? 'Editar Vehículo' : 'Agregar Vehículo a Stock'}
                        </DialogTitle>
                        <DialogDescription>
                            Completa los datos generales y especificaciones del vehículo.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                        
                        {/* Section 1: Classification & Core info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="vehicle-type">Tipo de Vehículo</Label>
                                <select
                                    id="vehicle-type"
                                    value={data.vehicle_type_id}
                                    onChange={e => handleVehicleTypeChange(e.target.value)}
                                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2"
                                >
                                    {types.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                {errors.vehicle_type_id && <p className="text-xs text-red-500">{errors.vehicle_type_id}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="vehicle-mark">Marca</Label>
                                <select
                                    id="vehicle-mark"
                                    value={data.vehicle_mark_id}
                                    onChange={e => setData('vehicle_mark_id', e.target.value)}
                                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2"
                                >
                                    {marks.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                {errors.vehicle_mark_id && <p className="text-xs text-red-500">{errors.vehicle_mark_id}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="vehicle-model">Modelo</Label>
                                <Input
                                    id="vehicle-model"
                                    value={data.model}
                                    onChange={e => setData('model', e.target.value)}
                                    placeholder="Ej: Corolla Cross XEI, Ranger XLS..."
                                />
                                {errors.model && <p className="text-xs text-red-500">{errors.model}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="vehicle-year">Año</Label>
                                <Input
                                    id="vehicle-year"
                                    type="number"
                                    value={data.year}
                                    onChange={e => setData('year', Number(e.target.value))}
                                />
                                {errors.year && <p className="text-xs text-red-500">{errors.year}</p>}
                            </div>
                        </div>

                        {/* Section 2: Pricing */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-zinc-800 pt-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="vehicle-currency">Moneda</Label>
                                <select
                                    id="vehicle-currency"
                                    value={data.currency}
                                    onChange={e => setData('currency', e.target.value)}
                                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="ARS">ARS ($)</option>
                                </select>
                                {errors.currency && <p className="text-xs text-red-500">{errors.currency}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="vehicle-price">Precio de Venta</Label>
                                <Input
                                    id="vehicle-price"
                                    type="number"
                                    value={data.price}
                                    onChange={e => setData('price', e.target.value)}
                                    placeholder="Ej: 25000"
                                />
                                {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                            </div>

                            {/* Cost Price - Only visible to Owner/Manager */}
                            {!isEmployee ? (
                                <div className="space-y-1.5">
                                    <Label htmlFor="vehicle-cost-price" className="text-rose-600 dark:text-rose-400 font-semibold">Costo de Adquisición</Label>
                                    <Input
                                        id="vehicle-cost-price"
                                        type="number"
                                        value={data.cost_price}
                                        onChange={e => setData('cost_price', e.target.value)}
                                        placeholder="Ej: 20000"
                                        className="border-rose-200 dark:border-rose-950 focus:ring-rose-500 focus:border-rose-500"
                                    />
                                    {errors.cost_price && <p className="text-xs text-red-500">{errors.cost_price}</p>}
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <Label htmlFor="vehicle-status">Estado</Label>
                                    <select
                                        id="vehicle-status"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2"
                                    >
                                        <option value="available">Disponible</option>
                                        <option value="reserved">Reservado</option>
                                        <option value="sold">Vendido</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Section 2b: Additional parameters */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-zinc-800 pt-4">
                            {!isEmployee && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="vehicle-status-field">Estado</Label>
                                    <select
                                        id="vehicle-status-field"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2"
                                    >
                                        <option value="available">Disponible</option>
                                        <option value="reserved">Reservado</option>
                                        <option value="sold">Vendido</option>
                                    </select>
                                </div>
                            )}
                            
                            <div className="space-y-1.5">
                                <Label htmlFor="vehicle-plate">Matrícula (Patente)</Label>
                                <Input
                                    id="vehicle-plate"
                                    value={data.plate}
                                    onChange={e => setData('plate', e.target.value)}
                                    placeholder="Ej: AA123BB"
                                />
                                {errors.plate && <p className="text-xs text-red-500">{errors.plate}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="vehicle-mileage">Kilometraje (km)</Label>
                                <Input
                                    id="vehicle-mileage"
                                    type="number"
                                    value={data.mileage}
                                    onChange={e => setData('mileage', e.target.value)}
                                    placeholder="Ej: 15000"
                                />
                                {errors.mileage && <p className="text-xs text-red-500">{errors.mileage}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="vehicle-fuel">Combustible</Label>
                                <select
                                    id="vehicle-fuel"
                                    value={data.fuel_type}
                                    onChange={e => setData('fuel_type', e.target.value)}
                                    className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2"
                                >
                                    <option value="">Seleccionar combustible</option>
                                    {fuels.map(f => (
                                        <option key={f.id} value={f.name}>{f.name}</option>
                                    ))}
                                </select>
                                {errors.fuel_type && <p className="text-xs text-red-500">{errors.fuel_type}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="vehicle-engine">Motor</Label>
                                <Input
                                    id="vehicle-engine"
                                    value={data.engine}
                                    onChange={e => setData('engine', e.target.value)}
                                    placeholder="Ej: 2.0L Turbo, 250cc..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="vehicle-suspension">Suspensión</Label>
                                <Input
                                    id="vehicle-suspension"
                                    value={data.suspension}
                                    onChange={e => setData('suspension', e.target.value)}
                                    placeholder="Ej: Independiente, Horquilla telescópica..."
                                />
                            </div>
                        </div>

                        {/* Section 3: Dynamic Template Details Form */}
                        {templates.filter(t => t.vehicle_type_id === Number(data.vehicle_type_id)).length > 0 && (
                            <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Detalles Específicos</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {templates
                                        .filter(t => t.vehicle_type_id === Number(data.vehicle_type_id))
                                        .map((tpl) => (
                                            <div key={tpl.id} className="space-y-1.5">
                                                <Label htmlFor={`tpl-${tpl.label}`}>{formatLabel(tpl.label)}</Label>
                                                {tpl.type === 'select' && tpl.options ? (
                                                    <select
                                                        id={`tpl-${tpl.label}`}
                                                        value={data.details[tpl.label] !== undefined ? data.details[tpl.label] : (tpl.default_value || '')}
                                                        onChange={e => handleDetailChange(tpl.label, e.target.value)}
                                                        className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2"
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        {tpl.options.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <Input
                                                        id={`tpl-${tpl.label}`}
                                                        type={tpl.type === 'number' ? 'number' : 'text'}
                                                        value={data.details[tpl.label] !== undefined ? data.details[tpl.label] : (tpl.default_value || '')}
                                                        onChange={e => handleDetailChange(tpl.label, e.target.value)}
                                                        placeholder={tpl.default_value || ''}
                                                    />
                                                )}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* Section 4: General Description */}
                        <div className="space-y-1.5 border-t border-slate-100 dark:border-zinc-800 pt-4">
                            <Label htmlFor="vehicle-description">Descripción / Notas</Label>
                            <textarea
                                id="vehicle-description"
                                rows={3}
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2.5"
                                placeholder="Ej: Services al día, único dueño..."
                            />
                        </div>

                        {/* Section 5: Image uploads */}
                        <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Imágenes del Vehículo</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Cover Image Upload */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Foto de Portada</Label>
                                    <div className="flex items-center gap-3">
                                        <Button 
                                            type="button" 
                                            variant="secondary"
                                            onClick={() => coverInputRef.current?.click()}
                                            className="flex items-center gap-1.5 text-xs"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Subir Portada
                                        </Button>
                                        <input 
                                            type="file" 
                                            ref={coverInputRef}
                                            onChange={handleCoverImageChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                                    {coverPreview && (
                                        <div className="mt-2 relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                            <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setCoverPreview(null);
                                                    setData('cover_image_file', null);
                                                }}
                                                className="absolute top-2 right-2 bg-slate-950/80 text-white rounded-full p-1 hover:bg-slate-950"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Gallery Images Upload */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Galería de Fotos (Múltiples)</Label>
                                    <div className="flex items-center gap-3">
                                        <Button 
                                            type="button" 
                                            variant="secondary"
                                            onClick={() => galleryInputRef.current?.click()}
                                            className="flex items-center gap-1.5 text-xs"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Agregar Fotos
                                        </Button>
                                        <input 
                                            type="file" 
                                            ref={galleryInputRef}
                                            onChange={handleGalleryImagesChange}
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                                    
                                    {/* Previews & Existing list */}
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {/* Existing Gallery Images */}
                                        {existingGallery.map(img => (
                                            <div key={img.id} className="relative aspect-square rounded overflow-hidden border border-slate-200 bg-slate-100 group">
                                                <img src={img.path} alt="Gallery image" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveExistingImage(img.id)}
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {/* New uploaded Gallery Images */}
                                        {galleryPreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded overflow-hidden border border-slate-200 bg-slate-100 group">
                                                <img src={preview} alt="Gallery Preview" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveNewGalleryImage(index)}
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="border-t border-slate-100 dark:border-zinc-800 pt-4 flex gap-2 justify-end">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setIsOpenFormModal(false)}
                                className="font-semibold text-slate-700 dark:text-zinc-300"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                className="bg-brand hover:bg-brand-hover text-slate-950 font-bold"
                                disabled={processing}
                            >
                                {processing ? 'Procesando...' : editingVehicle ? 'Guardar Cambios' : 'Agregar Vehículo'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
