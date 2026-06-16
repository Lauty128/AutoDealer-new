import Heading from '@/components/heading';
import SettingsLayout from '@/layouts/settings/layout';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Trash2, ArrowLeft, RefreshCw, Layers, Check, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Store {
    id: number;
    name: string;
}

interface VehicleType {
    id: number;
    name: string;
    slug: string;
}

interface TemplateField {
    id?: number;
    vehicle_type_id: number;
    store_id: number | null;
    label: string;
    type: 'text' | 'number' | 'select';
    options: string[] | null;
    default_value: string | null;
}

interface TemplatesProps {
    stores: Store[];
    activeStoreId: number;
    vehicleTypes: VehicleType[];
    templates: TemplateField[];
    status?: string;
    message?: string;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Plantillas', href: '/templates/settings' },
];

export default function Templates({ stores, activeStoreId, vehicleTypes, templates, status, message }: TemplatesProps) {
    const [selectedTypeId, setSelectedTypeId] = useState<string>(
        vehicleTypes.length > 0 ? String(vehicleTypes[0].id) : ''
    );
    const [storeId, setStoreId] = useState<number>(activeStoreId);

    // Dynamic fields editor state
    const [fields, setFields] = useState<Partial<TemplateField>[]>([]);
    
    // New field form state
    const [newLabel, setNewLabel] = useState('');
    const [newType, setNewType] = useState<'text' | 'number' | 'select'>('text');
    const [newDefaultValue, setNewDefaultValue] = useState('');
    const [newOptionVal, setNewOptionVal] = useState('');
    const [newOptionsList, setNewOptionsList] = useState<string[]>([]);

    // Load templates for selected vehicle type when type or template prop changes
    useEffect(() => {
        const typeIdNum = Number(selectedTypeId);
        const filteredTemplates = templates.filter(t => t.vehicle_type_id === typeIdNum);
        
        // Deep copy the fields to avoid modifying props directly
        const loadedFields = filteredTemplates.map(t => ({
            id: t.id,
            vehicle_type_id: t.vehicle_type_id,
            store_id: t.store_id,
            label: t.label,
            type: t.type,
            options: t.options ? [...t.options] : null,
            default_value: t.default_value,
        }));
        
        setFields(loadedFields);
    }, [selectedTypeId, templates]);

    const handleStoreChange = (newId: string) => {
        const idNum = Number(newId);
        setStoreId(idNum);
        router.get(route('templates.settings.edit'), { store_id: idNum });
    };

    const handleAddOptionToNewField = () => {
        if (newOptionVal.trim() && !newOptionsList.includes(newOptionVal.trim())) {
            setNewOptionsList([...newOptionsList, newOptionVal.trim()]);
            setNewOptionVal('');
        }
    };

    const handleRemoveOptionFromNewField = (opt: string) => {
        setNewOptionsList(newOptionsList.filter(o => o !== opt));
    };

    const handleAddField = () => {
        if (!newLabel.trim()) return;

        const newField: Partial<TemplateField> = {
            vehicle_type_id: Number(selectedTypeId),
            store_id: storeId,
            label: newLabel.trim().toLowerCase().replace(/\s+/g, '_'), // Standardize keys
            type: newType,
            options: newType === 'select' ? [...newOptionsList] : null,
            default_value: newDefaultValue.trim() || null,
        };

        setFields([...fields, newField]);

        // Reset inputs
        setNewLabel('');
        setNewType('text');
        setNewDefaultValue('');
        setNewOptionVal('');
        setNewOptionsList([]);
    };

    const handleRemoveField = (index: number) => {
        setFields(fields.filter((_, idx) => idx !== index));
    };

    const handleSave = () => {
        router.post(route('templates.settings.update'), {
            store_id: storeId,
            vehicle_type_id: Number(selectedTypeId),
            templates: fields,
        }, {
            onSuccess: () => {
                // Done
            }
        });
    };

    const handleReset = () => {
        if (confirm('¿Estás seguro de que quieres restablecer esta plantilla? Perderás los cambios personalizados de este concesionario y se cargarán las especificaciones por defecto del sistema.')) {
            router.post(route('templates.settings.reset'), {
                store_id: storeId,
                vehicle_type_id: Number(selectedTypeId),
            });
        }
    };

    const formatLabel = (lbl: string) => {
        return lbl
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AutoDealer - Plantillas" />
            <div className="px-6 py-6 max-w-7xl mx-auto">
                <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                            <Layers className="h-5 w-5 text-brand" />
                            Plantillas de Especificaciones
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">
                            Personaliza las especificaciones y características para cada tipo de vehículo. Estas plantillas generarán los campos completables cuando agregues o edites un vehículo.
                        </p>
                    </div>

                    <Separator />

                    {/* Store Selector */}
                    {stores.length > 1 && (
                        <div className="flex flex-col gap-2 max-w-sm">
                            <Label htmlFor="active-store-select" className="text-sm font-medium">Concesionario Activo</Label>
                            <Select value={String(storeId)} onValueChange={handleStoreChange}>
                                <SelectTrigger id="active-store-select">
                                    <SelectValue placeholder="Seleccionar Concesionario" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stores.map(s => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-lg text-sm">
                            {message}
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-lg text-sm">
                            {message}
                        </div>
                    )}

                    {stores.length > 0 && vehicleTypes.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Column 1: Types & Form to Add Fields */}
                            <div className="lg:col-span-1 space-y-6">
                                <Card className="border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Tipo de Vehículo</CardTitle>
                                        <CardDescription>Selecciona para editar su plantilla</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-1">
                                        {vehicleTypes.map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setSelectedTypeId(String(t.id))}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-between ${
                                                    selectedTypeId === String(t.id)
                                                        ? 'bg-brand text-slate-950 shadow-sm'
                                                        : 'hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300'
                                                }`}
                                            >
                                                <span>{t.name}</span>
                                                {selectedTypeId === String(t.id) && <Check className="h-4 w-4 shrink-0" />}
                                            </button>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Form to Add Field */}
                                <Card className="border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                    <CardHeader>
                                        <CardTitle className="text-base font-bold flex items-center gap-1.5">
                                            <Plus className="h-4 w-4 text-brand" />
                                            Agregar Campo
                                        </CardTitle>
                                        <CardDescription>Crea una nueva especificación para esta plantilla</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="field-label">Nombre de la característica</Label>
                                            <Input
                                                id="field-label"
                                                placeholder="Ej: Techo Solar, Tracción..."
                                                value={newLabel}
                                                onChange={e => setNewLabel(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="field-type">Tipo de Campo</Label>
                                            <Select value={newType} onValueChange={(val: any) => {
                                                setNewType(val);
                                                setNewOptionsList([]);
                                            }}>
                                                <SelectTrigger id="field-type">
                                                    <SelectValue placeholder="Tipo de input" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Texto Libre</SelectItem>
                                                    <SelectItem value="number">Número</SelectItem>
                                                    <SelectItem value="select">Selector (Desplegable)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="field-default">Valor por Defecto (Opcional)</Label>
                                            <Input
                                                id="field-default"
                                                placeholder="Ej: Manual, Sí, 150cc..."
                                                value={newDefaultValue}
                                                onChange={e => setNewDefaultValue(e.target.value)}
                                            />
                                        </div>

                                        {newType === 'select' && (
                                            <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800 pt-3">
                                                <Label className="text-xs font-bold text-slate-500 uppercase">Opciones del Selector</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Agregar opción..."
                                                        value={newOptionVal}
                                                        onChange={e => setNewOptionVal(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddOptionToNewField())}
                                                    />
                                                    <Button type="button" onClick={handleAddOptionToNewField} variant="secondary">
                                                        Añadir
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 pt-2">
                                                    {newOptionsList.map(opt => (
                                                        <span
                                                            key={opt}
                                                            className="inline-flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs px-2 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700"
                                                        >
                                                            <span>{opt}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveOptionFromNewField(opt)}
                                                                className="text-slate-400 hover:text-red-500 font-bold ml-0.5"
                                                            >
                                                                &times;
                                                            </button>
                                                        </span>
                                                    ))}
                                                    {newOptionsList.length === 0 && (
                                                        <p className="text-xs text-slate-400 italic">Agrega opciones para completar el selector.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="button"
                                            onClick={handleAddField}
                                            className="w-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 hover:bg-slate-800 font-semibold"
                                            disabled={!newLabel.trim() || (newType === 'select' && newOptionsList.length === 0)}
                                        >
                                            Añadir a Plantilla
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>

                            {/* Column 2: Loaded Template Fields list */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 flex flex-col justify-between min-h-[450px]">
                                    <div>
                                        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                                            <div>
                                                <CardTitle className="text-lg font-bold">
                                                    Características de {vehicleTypes.find(t => String(t.id) === selectedTypeId)?.name}
                                                </CardTitle>
                                                <CardDescription>
                                                    Lista de campos que se mostrarán al cargar un vehículo. Los campos marcados con <span className="inline-flex items-center gap-0.5 text-slate-400 font-medium px-1.5 py-0.2 bg-slate-100 dark:bg-zinc-800 text-[10px] rounded border border-slate-200 dark:border-zinc-800">Sistema</span> son heredados. Si guardas cambios, se personalizará esta plantilla para tu concesionario.
                                                </CardDescription>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={handleReset}
                                                variant="outline"
                                                size="sm"
                                                title="Restablecer plantilla por defecto"
                                                className="shrink-0 text-xs flex items-center gap-1 border-slate-200 hover:border-red-300 hover:text-red-500"
                                            >
                                                <RefreshCw className="h-3 w-3" />
                                                Restablecer
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            {fields.length === 0 ? (
                                                <div className="text-center py-12 text-slate-400 dark:text-zinc-500 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-xl">
                                                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                                    <p className="font-semibold text-sm">Esta plantilla está vacía</p>
                                                    <p className="text-xs">Agrega características desde la izquierda para comenzar a personalizarla.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {fields.map((field, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-200/50 dark:border-zinc-800 group"
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                                                                        {formatLabel(field.label || '')}
                                                                    </span>
                                                                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                                                                        {field.type}
                                                                    </span>
                                                                    {field.store_id === null && (
                                                                        <span className="text-[10px] uppercase font-extrabold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50 px-1.5 py-0.5 rounded">
                                                                            Sistema
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-slate-400 dark:text-zinc-500">
                                                                    {field.default_value ? (
                                                                        <>Valor predefinido: <strong className="text-slate-600 dark:text-zinc-400">{field.default_value}</strong></>
                                                                    ) : (
                                                                        <span className="italic">Sin valor predefinido</span>
                                                                    )}
                                                                </p>
                                                                {field.type === 'select' && field.options && (
                                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                                        {field.options.map(opt => (
                                                                            <span
                                                                                key={opt}
                                                                                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 text-[10px] px-2 py-0.5 rounded"
                                                                            >
                                                                                {opt}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                onClick={() => handleRemoveField(index)}
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </div>
                                    <CardFooter className="border-t border-slate-100 dark:border-zinc-800 pt-4 bg-slate-50/20 dark:bg-zinc-950/20 rounded-b-xl flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            onClick={handleSave}
                                            className="bg-brand hover:bg-brand-hover text-slate-950 font-bold flex items-center gap-1 shadow-sm"
                                        >
                                            Guardar Cambios de Plantilla
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            No tienes concesionarios o tipos de vehículos definidos.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
