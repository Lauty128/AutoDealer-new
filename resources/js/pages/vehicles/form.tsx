import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import {
    ArrowLeft, Upload, X, Trash2, Calendar, Gauge, Fuel,
    Landmark, ShieldAlert, Sparkles, AlertCircle, Save, Plus
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Interfaces matching the backend models
interface Store {
    id: number;
    name: string;
    slug: string;
    currency?: string;
    usd_exchange_rate?: string | number;
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

interface FormProps {
    stores: Store[];
    activeStoreId: number | null;
    marks: FilterMetadata[];
    types: FilterMetadata[];
    fuels: FilterMetadata[];
    templates: TemplateField[];
    vehicle: Vehicle | null;
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

export default function VehicleFormPage({
    stores,
    activeStoreId,
    marks,
    types,
    fuels,
    templates,
    vehicle
}: FormProps) {
    const isEditMode = !!vehicle;
    const activeStore = stores.find(s => s.id === (vehicle ? vehicle.store_id : activeStoreId));

    // User Role check in active store
    const storeRole = activeStore?.pivot?.role || 'employee';
    const isEmployee = storeRole === 'employee' || storeRole === 'editor';

    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user.is_superadmin === true || auth.user.is_superadmin === 1;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Vehículos',
            href: '/dashboard/vehicles/manage',
        },
        {
            title: isEditMode ? 'Editar Vehículo' : 'Agregar Vehículo',
            href: isEditMode ? `/dashboard/vehicles/${vehicle.id}/edit` : '/dashboard/vehicles/create',
        },
    ];

    // Initialize details map
    const initialDetails = () => {
        const detailsMap: Record<string, string> = {};
        if (isEditMode && vehicle) {
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
        } else {
            // Create Mode: Load defaults of first type
            const defaultType = types[0];
            if (defaultType) {
                const relevantTemplates = templates.filter(t => t.vehicle_type_id === defaultType.id);
                relevantTemplates.forEach(t => {
                    detailsMap[t.label] = t.default_value || '';
                });
            }
        }
        return detailsMap;
    };

    // Form setup using Inertia useForm
    const { data, setData, post, processing, errors, transform } = useForm<VehicleForm>({
        store_id: vehicle ? vehicle.store_id : (activeStoreId || ''),
        vehicle_type_id: vehicle ? String(vehicle.type.id) : (types[0]?.id ? String(types[0].id) : ''),
        vehicle_mark_id: vehicle ? String(vehicle.mark.id) : (marks[0]?.id ? String(marks[0].id) : ''),
        model: vehicle ? vehicle.model : '',
        year: vehicle ? vehicle.year : new Date().getFullYear(),
        price: vehicle ? String(vehicle.price) : '',
        currency: vehicle ? vehicle.currency : (activeStore?.currency || 'USD'),
        plate: vehicle ? (vehicle.plate || '') : '',
        engine: vehicle ? (vehicle.engine || '') : '',
        suspension: vehicle ? (vehicle.suspension || '') : '',
        fuel_type: vehicle ? (vehicle.fuel_type || '') : '',
        mileage: vehicle ? (vehicle.mileage !== null ? String(vehicle.mileage) : '') : '',
        description: vehicle ? (vehicle.description || '') : '',
        status: vehicle ? vehicle.status : 'available',
        cost_price: vehicle ? (vehicle.cost_price !== null ? String(vehicle.cost_price) : '') : '',
        cover_image_file: null,
        images_files: [],
        delete_images: [],
        details: initialDetails(),
    });

    // File input refs
    const coverInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    // Preview states
    const [coverPreview, setCoverPreview] = useState<string | null>(vehicle ? vehicle.cover_image : null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [existingGallery, setExistingGallery] = useState<VehicleImage[]>(vehicle ? vehicle.images : []);

    // Custom manual specifications state
    const [customSpecs, setCustomSpecs] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        if (isEditMode && vehicle) {
            const relevantTemplateLabels = templates
                .filter(t => t.vehicle_type_id === vehicle.type.id)
                .map(t => t.label);

            const initialCustomSpecs: { label: string; value: string }[] = [];
            vehicle.details.forEach(d => {
                if (!relevantTemplateLabels.includes(d.label)) {
                    initialCustomSpecs.push({
                        label: d.label,
                        value: d.value
                    });
                }
            });
            setCustomSpecs(initialCustomSpecs);
        }
    }, [vehicle, templates]);

    const handleAddCustomSpec = () => {
        setCustomSpecs([...customSpecs, { label: '', value: '' }]);
    };

    const handleRemoveCustomSpec = (index: number) => {
        setCustomSpecs(customSpecs.filter((_, i) => i !== index));
    };

    const handleCustomSpecLabelChange = (index: number, label: string) => {
        const updated = [...customSpecs];
        updated[index].label = label;
        setCustomSpecs(updated);
    };

    const handleCustomSpecValueChange = (index: number, value: string) => {
        const updated = [...customSpecs];
        updated[index].value = value;
        setCustomSpecs(updated);
    };

    // Set dynamic template default values when vehicle type is changed
    const handleVehicleTypeChange = (selectedTypeIdStr: string) => {
        setData(prev => {
            const next = { ...prev, vehicle_type_id: selectedTypeIdStr };

            // Only autofill defaults if we are not editing
            if (!isEditMode) {
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

    const handleDetailChange = (label: string, value: string) => {
        setData('details', {
            ...data.details,
            [label]: value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Combine template details and custom details
        const finalDetails: Record<string, string> = {};

        // 1. Get the current template fields for this vehicle type
        const typeTemplates = templates.filter(t => t.vehicle_type_id === Number(data.vehicle_type_id));
        
        // 2. Put template details in finalDetails
        typeTemplates.forEach(t => {
            if (data.details[t.label] !== undefined && data.details[t.label] !== '') {
                finalDetails[t.label] = data.details[t.label];
            }
        });

        // 3. Put custom specs in finalDetails
        customSpecs.forEach(spec => {
            const trimmedLabel = spec.label.trim();
            if (trimmedLabel !== '' && spec.value.trim() !== '') {
                finalDetails[trimmedLabel] = spec.value;
            }
        });

        transform((prevData) => ({
            ...prevData,
            details: finalDetails,
        }));

        if (isEditMode && vehicle) {
            post(route('vehicles.update', vehicle.id));
        } else {
            post(route('vehicles.store'));
        }
    };

    const formatLabel = (lbl: string) => {
        return lbl
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditMode ? `Editar - ${vehicle?.model}` : 'Agregar Vehículo'} />

            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">

                {/* Header Navbar */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-5">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('vehicles.manage', { store_id: data.store_id })}
                            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 p-2 rounded-xl transition-all shadow-xs shrink-0"
                            title="Volver a Gestión"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                                {isEditMode ? 'Modificar Vehículo' : 'Cargar Nuevo Vehículo'}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                Concesionario: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{activeStore?.name}</span>
                            </p>
                        </div>
                    </div>
                    {isSuperAdmin && (
                        <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs px-3 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Modo Superadministrador
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Form Fields */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Section 1: Classification & Model */}
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                                <Sparkles className="h-4 w-4 text-indigo-500" />
                                Clasificación y Modelo
                            </h3>

                            {/* Superadmin Store Selector */}
                            {isSuperAdmin && stores.length > 1 && !isEditMode && (
                                <div className="grid gap-1.5">
                                    <Label htmlFor="store-select">Concesionario de Destino</Label>
                                    <select
                                        id="store-select"
                                        value={data.store_id}
                                        onChange={e => setData('store_id', e.target.value)}
                                        className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2"
                                    >
                                        {stores.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
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

                                <div className="grid gap-1.5">
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

                                <div className="grid gap-1.5">
                                    <Label htmlFor="vehicle-model">Modelo / Versión</Label>
                                    <Input
                                        id="vehicle-model"
                                        value={data.model}
                                        onChange={e => setData('model', e.target.value)}
                                        placeholder="Ej: Corolla Cross XEI, Ranger XLS..."
                                        required
                                    />
                                    {errors.model && <p className="text-xs text-red-500">{errors.model}</p>}
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="vehicle-year">Año de Fabricación</Label>
                                    <Input
                                        id="vehicle-year"
                                        type="number"
                                        value={data.year}
                                        onChange={e => setData('year', Number(e.target.value))}
                                        required
                                    />
                                    {errors.year && <p className="text-xs text-red-500">{errors.year}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="vehicle-engine">Especificación del Motor</Label>
                                    <Input
                                        id="vehicle-engine"
                                        value={data.engine}
                                        onChange={e => setData('engine', e.target.value)}
                                        placeholder="Ej: 2.0L Turbo, 16v, 250cc..."
                                    />
                                    {errors.engine && <p className="text-xs text-red-500">{errors.engine}</p>}
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="vehicle-suspension">Detalles de Suspensión</Label>
                                    <Input
                                        id="vehicle-suspension"
                                        value={data.suspension}
                                        onChange={e => setData('suspension', e.target.value)}
                                        placeholder="Ej: MacPherson, Horquilla Telescópica..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pricing & Status */}
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                                <Landmark className="h-4 w-4 text-emerald-500" />
                                Precios y Estado de Venta
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="vehicle-currency">Moneda</Label>
                                    <select
                                        id="vehicle-currency"
                                        value={data.currency}
                                        onChange={e => setData('currency', e.target.value)}
                                        className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2"
                                    >
                                        {activeStore?.currency === 'USD' ? (
                                            <option value="USD">Dólares (USD)</option>
                                        ) : (
                                            <>
                                                <option value={activeStore?.currency || 'ARS'}>
                                                    {activeStore?.currency === 'ARS' ? 'Pesos (ARS)' : (activeStore?.currency || 'Pesos (ARS)')}
                                                </option>
                                                <option value="USD">Dólares (USD)</option>
                                            </>
                                        )}
                                    </select>
                                    {errors.currency && <p className="text-xs text-red-500">{errors.currency}</p>}
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="vehicle-price">Precio de Lista</Label>
                                    <Input
                                        id="vehicle-price"
                                        type="number"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        placeholder="Ej: 24500"
                                        required
                                    />
                                    {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                                </div>

                                {/* Cost price - Only managers */}
                                {!isEmployee ? (
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="vehicle-cost-price" className="text-rose-600 dark:text-rose-400 font-semibold">Costo de Compra (Privado)</Label>
                                        <Input
                                            id="vehicle-cost-price"
                                            type="number"
                                            value={data.cost_price}
                                            onChange={e => setData('cost_price', e.target.value)}
                                            placeholder="Ej: 19000"
                                            className="border-rose-200 dark:border-rose-950 focus:ring-rose-500 focus:border-rose-500"
                                        />
                                        {errors.cost_price && <p className="text-xs text-red-500">{errors.cost_price}</p>}
                                    </div>
                                ) : (
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="vehicle-status-locked">Estado de Disponibilidad</Label>
                                        <select
                                            id="vehicle-status-locked"
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

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {!isEmployee && (
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="vehicle-status">Estado de Disponibilidad</Label>
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

                                <div className="grid gap-1.5">
                                    <Label htmlFor="vehicle-plate">Patente (Matrícula)</Label>
                                    <Input
                                        id="vehicle-plate"
                                        value={data.plate}
                                        onChange={e => setData('plate', e.target.value.toUpperCase())}
                                        placeholder="Ej: AA123BB"
                                    />
                                    {errors.plate && <p className="text-xs text-red-500">{errors.plate}</p>}
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="vehicle-mileage">Kilometraje (km)</Label>
                                    <Input
                                        id="vehicle-mileage"
                                        type="number"
                                        value={data.mileage}
                                        onChange={e => setData('mileage', e.target.value)}
                                        placeholder="Ej: 35000"
                                    />
                                    {errors.mileage && <p className="text-xs text-red-500">{errors.mileage}</p>}
                                </div>

                                <div className="grid gap-1.5">
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
                        </div>

                        {/* Section 3: Dynamic Specifications Template & Custom Specifications */}
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                                    <Sparkles className="h-4 w-4 text-purple-500" />
                                    Especificaciones Técnicas
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddCustomSpec}
                                    className="h-8 text-xs flex items-center gap-1 border-indigo-200 dark:border-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Agregar Fila Personalizada
                                </Button>
                            </div>

                            {/* Template-defined fields */}
                            {templates.filter(t => t.vehicle_type_id === Number(data.vehicle_type_id)).length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {templates
                                        .filter(t => t.vehicle_type_id === Number(data.vehicle_type_id))
                                        .map((tpl) => (
                                            <div key={tpl.id} className="grid gap-1.5">
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
                            )}

                            {/* Custom manually-defined fields */}
                            {customSpecs.length > 0 && (
                                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-850">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Especificaciones Personalizadas
                                    </Label>
                                    <div className="space-y-3">
                                        {customSpecs.map((spec, index) => (
                                            <div key={index} className="flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-150 dark:border-zinc-850">
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="grid gap-1">
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">Característica</span>
                                                        <Input
                                                            value={spec.label}
                                                            onChange={e => handleCustomSpecLabelChange(index, e.target.value)}
                                                            placeholder="Ej: Techo solar, Tapizado, etc."
                                                            className="h-9 text-xs bg-white dark:bg-zinc-900"
                                                        />
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">Valor / Detalle</span>
                                                        <Input
                                                            value={spec.value}
                                                            onChange={e => handleCustomSpecValueChange(index, e.target.value)}
                                                            placeholder="Ej: Sí, Cuero negro, etc."
                                                            className="h-9 text-xs bg-white dark:bg-zinc-900"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCustomSpec(index)}
                                                    className="self-end mb-1 p-2 text-red-500 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors shrink-0"
                                                    title="Eliminar especificación"
                                                >
                                                    <Trash2 className="h-4.5 w-4.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {templates.filter(t => t.vehicle_type_id === Number(data.vehicle_type_id)).length === 0 && customSpecs.length === 0 && (
                                <div className="text-center p-6 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-slate-400 text-xs">
                                    No hay especificaciones definidas. Haz clic en "Agregar Fila Personalizada" para crear una.
                                </div>
                            )}
                        </div>

                        {/* Section 4: General Description */}
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Descripción / Comentarios
                            </h3>
                            <textarea
                                id="vehicle-description"
                                rows={4}
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-zinc-600 focus:outline-hidden"
                                placeholder="Ingresa los comentarios del concesionario sobre el estado, equipamiento y mantenimiento de la unidad..."
                            />
                        </div>
                    </div>

                    {/* Right Column: Image Uploader */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-5">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                                <Upload className="h-4 w-4 text-brand" />
                                Galería Fotográfica
                            </h3>

                            {/* Cover Image */}
                            <div className="space-y-2.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase">Foto de Portada</Label>
                                <div className="flex flex-col gap-3">
                                    {coverPreview ? (
                                        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-200/80 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 group">
                                            <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCoverPreview(null);
                                                    setData('cover_image_file', null);
                                                }}
                                                className="absolute top-2.5 right-2.5 bg-slate-950/80 text-white rounded-full p-1.5 hover:bg-slate-950 transition-colors shadow-sm"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => coverInputRef.current?.click()}
                                            className="aspect-video w-full rounded-xl border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors"
                                        >
                                            <Upload className="h-8 w-8 text-slate-300 mb-2" />
                                            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">Subir Portada</span>
                                            <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP. Máx 2MB</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={coverInputRef}
                                        onChange={handleCoverImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    {errors.cover_image_file && <p className="text-xs text-red-500">{errors.cover_image_file}</p>}
                                </div>
                            </div>

                            {/* Gallery Images */}
                            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase">Fotos Adicionales</Label>
                                    <button
                                        type="button"
                                        onClick={() => galleryInputRef.current?.click()}
                                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs font-bold flex items-center gap-1"
                                    >
                                        <Upload className="h-3 w-3" />
                                        Agregar
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={galleryInputRef}
                                    onChange={handleGalleryImagesChange}
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                />

                                {existingGallery.length === 0 && galleryPreviews.length === 0 ? (
                                    <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-6 text-center text-slate-400 text-xs">
                                        No hay fotos adicionales cargadas.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {/* Existing Images */}
                                        {existingGallery.map(img => (
                                            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 group shadow-xs">
                                                <img src={img.path} alt="Gallery item" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingImage(img.id)}
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Eliminar Foto"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* New Preview Images */}
                                        {galleryPreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 group shadow-xs">
                                                <img src={preview} alt="Gallery preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNewGalleryImage(index)}
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Eliminar Foto"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {errors.images_files && <p className="text-xs text-red-500">{errors.images_files}</p>}
                            </div>
                        </div>

                        {/* Submit Button card */}
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
                            <Button
                                type="submit"
                                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm text-sm"
                                disabled={processing}
                            >
                                <Save className="h-4.5 w-4.5" />
                                {isEditMode ? 'Guardar Cambios' : 'Agregar Vehículo'}
                            </Button>

                            <Link
                                href={route('vehicles.manage', { store_id: data.store_id })}
                                className="w-full h-10 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold rounded-xl flex items-center justify-center transition-colors text-xs"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
