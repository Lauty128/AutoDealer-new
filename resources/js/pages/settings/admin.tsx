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
import { Plus, Trash2, ShieldAlert, Award, Layers, Flame, Check, Sparkles, Pencil } from 'lucide-react';
import { useState } from 'react';

interface VehicleMark {
    id: number;
    name: string;
    slug: string;
}

interface VehicleType {
    id: number;
    name: string;
    slug: string;
}

interface VehicleFuel {
    id: number;
    name: string;
}

interface TemplateField {
    id: number;
    vehicle_type_id: number;
    label: string;
    type: 'text' | 'number' | 'select';
    options: string[] | null;
    default_value: string | null;
    type_relation?: { id: number; name: string };
}

interface AdminProps {
    marks: VehicleMark[];
    types: VehicleType[];
    fuels: VehicleFuel[];
    templates: TemplateField[];
    status?: string;
    message?: string;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin Global', href: '/settings/admin' },
];

export default function Admin({ marks, types, fuels, templates, status, message }: AdminProps) {
    const [activeTab, setActiveTab] = useState<'marks' | 'types' | 'fuels' | 'templates'>('marks');

    // Forms
    const markForm = useForm({ name: '' });
    const typeForm = useForm({ name: '' });
    const fuelForm = useForm({ name: '' });
    
    const templateForm = useForm({
        vehicle_type_id: types.length > 0 ? String(types[0].id) : '',
        label: '',
        type: 'text',
        options: [] as string[],
        default_value: '',
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [newOptionVal, setNewOptionVal] = useState('');

    const handleCreateMark = (e: React.FormEvent) => {
        e.preventDefault();
        markForm.post(route('settings.admin.marks.store'), {
            onSuccess: () => markForm.reset()
        });
    };

    const handleCreateType = (e: React.FormEvent) => {
        e.preventDefault();
        typeForm.post(route('settings.admin.types.store'), {
            onSuccess: () => typeForm.reset()
        });
    };

    const handleCreateFuel = (e: React.FormEvent) => {
        e.preventDefault();
        fuelForm.post(route('settings.admin.fuels.store'), {
            onSuccess: () => fuelForm.reset()
        });
    };

    const handleCreateTemplate = (e: React.FormEvent) => {
        e.preventDefault();
        templateForm.post(route('settings.admin.templates.store'), {
            onSuccess: () => {
                templateForm.reset('label', 'default_value');
                templateForm.setData('options', []);
            }
        });
    };

    const handleDelete = (resource: 'marks' | 'types' | 'fuels' | 'templates', id: number) => {
        if (confirm('¿Estás seguro de eliminar este elemento? Podría afectar a vehículos o concesionarios existentes.')) {
            router.delete(route(`settings.admin.${resource}.destroy`, id));
        }
    };

    const startEditing = (id: number, name: string) => {
        setEditingId(id);
        setEditName(name);
    };

    const handleUpdate = (resource: 'marks' | 'types' | 'fuels', id: number) => {
        if (!editName.trim()) return;
        router.put(route(`settings.admin.${resource}.update`, id), {
            name: editName
        }, {
            onSuccess: () => {
                setEditingId(null);
                setEditName('');
            }
        });
    };

    const handleAddTemplateOption = () => {
        if (newOptionVal.trim() && !templateForm.data.options.includes(newOptionVal.trim())) {
            templateForm.setData('options', [...templateForm.data.options, newOptionVal.trim()]);
            setNewOptionVal('');
        }
    };

    const handleRemoveTemplateOption = (opt: string) => {
        templateForm.setData('options', templateForm.data.options.filter(o => o !== opt));
    };

    const formatLabel = (lbl: string) => {
        return lbl
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AutoDealer - Admin Global" />
            <div className="px-6 py-6 max-w-7xl mx-auto">
                <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-indigo-500" />
                                Panel de Administrador Global
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-zinc-400">
                                Configura marcas, tipos de vehículos, combustibles y plantillas por defecto del sistema SaaS.
                            </p>
                        </div>
                    </div>

                    <Separator />

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

                    {/* Tabs Navigation */}
                    <div className="flex border-b border-slate-200 dark:border-zinc-800">
                        <button
                            onClick={() => setActiveTab('marks')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                                activeTab === 'marks'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Award className="h-4 w-4" />
                            Marcas ({marks.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('types')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                                activeTab === 'types'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Layers className="h-4 w-4" />
                            Tipos de Vehículo ({types.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('fuels')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                                activeTab === 'fuels'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Flame className="h-4 w-4" />
                            Combustibles ({fuels.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                                activeTab === 'templates'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Sparkles className="h-4 w-4" />
                            Plantillas del Sistema ({templates.length})
                        </button>
                    </div>

                    {/* Tab 1: MARCAS */}
                    {activeTab === 'marks' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-1 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                                        <Plus className="h-4 w-4 text-indigo-500" />
                                        Agregar Marca
                                    </CardTitle>
                                    <CardDescription>Crea un fabricante de vehículos</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleCreateMark}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mark-name">Nombre de la Marca</Label>
                                            <Input
                                                id="mark-name"
                                                placeholder="Ej: BMW, Audi, Fiat..."
                                                value={markForm.data.name}
                                                onChange={e => markForm.setData('name', e.target.value)}
                                            />
                                            {markForm.errors.name && <p className="text-xs text-red-500">{markForm.errors.name}</p>}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 text-white dark:text-slate-900 font-semibold"
                                            disabled={markForm.processing}
                                        >
                                            Crear Marca
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>

                            <Card className="lg:col-span-2 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold">Listado de Marcas</CardTitle>
                                    <CardDescription>Visualiza y administra las marcas del catálogo global</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2">
                                    {marks.map(m => (
                                        <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/60 dark:bg-zinc-800/40 border border-slate-200/50 dark:border-zinc-800">
                                            {editingId === m.id ? (
                                                <div className="flex items-center gap-2 w-full mr-4">
                                                    <Input
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="h-8 max-w-xs"
                                                    />
                                                    <Button size="sm" onClick={() => handleUpdate('marks', m.id)} className="bg-green-600 hover:bg-green-700 h-8">
                                                        Listo
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 text-xs">
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-sm text-slate-800 dark:text-zinc-200">{m.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">Slug: {m.slug}</p>
                                                </div>
                                            )}
                                            {editingId !== m.id && (
                                                <div className="flex gap-1.5">
                                                    <Button size="icon" variant="ghost" onClick={() => startEditing(m.id, m.name)} className="text-slate-400 hover:text-indigo-500">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleDelete('marks', m.id)} className="text-slate-400 hover:text-red-500">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {marks.length === 0 && (
                                        <p className="text-sm text-slate-400 italic text-center py-6">No hay marcas definidas.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab 2: TIPOS DE VEHICULO */}
                    {activeTab === 'types' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-1 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                                        <Plus className="h-4 w-4 text-indigo-500" />
                                        Agregar Tipo de Vehículo
                                    </CardTitle>
                                    <CardDescription>Crea una categoría de vehículo</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleCreateType}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="type-name">Nombre del Tipo</Label>
                                            <Input
                                                id="type-name"
                                                placeholder="Ej: Auto, Moto, Camioneta..."
                                                value={typeForm.data.name}
                                                onChange={e => typeForm.setData('name', e.target.value)}
                                            />
                                            {typeForm.errors.name && <p className="text-xs text-red-500">{typeForm.errors.name}</p>}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 text-white dark:text-slate-900 font-semibold"
                                            disabled={typeForm.processing}
                                        >
                                            Crear Tipo
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>

                            <Card className="lg:col-span-2 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold">Listado de Tipos</CardTitle>
                                    <CardDescription>Administra los tipos de vehículos que tendrán plantillas asociadas</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2">
                                    {types.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/60 dark:bg-zinc-800/40 border border-slate-200/50 dark:border-zinc-800">
                                            {editingId === t.id ? (
                                                <div className="flex items-center gap-2 w-full mr-4">
                                                    <Input
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="h-8 max-w-xs"
                                                    />
                                                    <Button size="sm" onClick={() => handleUpdate('types', t.id)} className="bg-green-600 hover:bg-green-700 h-8">
                                                        Listo
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 text-xs">
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-sm text-slate-800 dark:text-zinc-200">{t.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">Slug: {t.slug}</p>
                                                </div>
                                            )}
                                            {editingId !== t.id && (
                                                <div className="flex gap-1.5">
                                                    <Button size="icon" variant="ghost" onClick={() => startEditing(t.id, t.name)} className="text-slate-400 hover:text-indigo-500">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleDelete('types', t.id)} className="text-slate-400 hover:text-red-500">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {types.length === 0 && (
                                        <p className="text-sm text-slate-400 italic text-center py-6">No hay tipos definidos.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab 3: COMBUSTIBLES */}
                    {activeTab === 'fuels' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-1 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                                        <Plus className="h-4 w-4 text-indigo-500" />
                                        Agregar Combustible
                                    </CardTitle>
                                    <CardDescription>Crea una opción de combustible</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleCreateFuel}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fuel-name">Nombre del Combustible</Label>
                                            <Input
                                                id="fuel-name"
                                                placeholder="Ej: Gasolina, Gasoil, Eléctrico..."
                                                value={fuelForm.data.name}
                                                onChange={e => fuelForm.setData('name', e.target.value)}
                                            />
                                            {fuelForm.errors.name && <p className="text-xs text-red-500">{fuelForm.errors.name}</p>}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 text-white dark:text-slate-900 font-semibold"
                                            disabled={fuelForm.processing}
                                        >
                                            Crear Combustible
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>

                            <Card className="lg:col-span-2 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold">Listado de Combustibles</CardTitle>
                                    <CardDescription>Combustibles que se ofrecerán al cargar y filtrar stock</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2">
                                    {fuels.map(f => (
                                        <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/60 dark:bg-zinc-800/40 border border-slate-200/50 dark:border-zinc-800">
                                            {editingId === f.id ? (
                                                <div className="flex items-center gap-2 w-full mr-4">
                                                    <Input
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="h-8 max-w-xs"
                                                    />
                                                    <Button size="sm" onClick={() => handleUpdate('fuels', f.id)} className="bg-green-600 hover:bg-green-700 h-8">
                                                        Listo
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 text-xs">
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="font-semibold text-sm text-slate-800 dark:text-zinc-200">{f.name}</p>
                                            )}
                                            {editingId !== f.id && (
                                                <div className="flex gap-1.5">
                                                    <Button size="icon" variant="ghost" onClick={() => startEditing(f.id, f.name)} className="text-slate-400 hover:text-indigo-500">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleDelete('fuels', f.id)} className="text-slate-400 hover:text-red-500">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {fuels.length === 0 && (
                                        <p className="text-sm text-slate-400 italic text-center py-6">No hay combustibles definidos.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab 4: PLANTILLAS POR DEFECTO DEL SISTEMA */}
                    {activeTab === 'templates' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-1 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                                        <Plus className="h-4 w-4 text-indigo-500" />
                                        Agregar Campo Global
                                    </CardTitle>
                                    <CardDescription>Crea un campo predefinido para nuevos concesionarios</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleCreateTemplate}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tpl-type-id">Tipo de Vehículo</Label>
                                            <Select value={templateForm.data.vehicle_type_id} onValueChange={val => templateForm.setData('vehicle_type_id', val)}>
                                                <SelectTrigger id="tpl-type-id">
                                                    <SelectValue placeholder="Seleccionar Tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {types.map(t => (
                                                        <SelectItem key={t.id} value={String(t.id)}>
                                                            {t.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tpl-label">Nombre del Campo</Label>
                                            <Input
                                                id="tpl-label"
                                                placeholder="Ej: puertas, transmision..."
                                                value={templateForm.data.label}
                                                onChange={e => templateForm.setData('label', e.target.value.toLowerCase().trim().replace(/\s+/g, '_'))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tpl-input-type">Tipo de Input</Label>
                                            <Select value={templateForm.data.type} onValueChange={(val: any) => {
                                                templateForm.setData('type', val);
                                                templateForm.setData('options', []);
                                            }}>
                                                <SelectTrigger id="tpl-input-type">
                                                    <SelectValue placeholder="Tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Texto Libre</SelectItem>
                                                    <SelectItem value="number">Número</SelectItem>
                                                    <SelectItem value="select">Selector (Desplegable)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tpl-default">Valor por Defecto</Label>
                                            <Input
                                                id="tpl-default"
                                                placeholder="Ej: Manual, Sí..."
                                                value={templateForm.data.default_value}
                                                onChange={e => templateForm.setData('default_value', e.target.value)}
                                            />
                                        </div>

                                        {templateForm.data.type === 'select' && (
                                            <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800 pt-3">
                                                <Label className="text-xs font-bold text-slate-500 uppercase">Opciones del Selector</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Nueva opción..."
                                                        value={newOptionVal}
                                                        onChange={e => setNewOptionVal(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTemplateOption())}
                                                    />
                                                    <Button type="button" onClick={handleAddTemplateOption} variant="secondary">
                                                        Añadir
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {templateForm.data.options.map(opt => (
                                                        <span key={opt} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs px-2 py-0.5 rounded-full">
                                                            <span>{opt}</span>
                                                            <button type="button" onClick={() => handleRemoveTemplateOption(opt)} className="text-slate-400 hover:text-red-500 font-bold ml-1">
                                                                &times;
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 text-white dark:text-slate-900 font-semibold"
                                            disabled={templateForm.processing || !templateForm.data.label}
                                        >
                                            Crear Campo Global
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>

                            <Card className="lg:col-span-2 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold">Listado de Plantillas Globales</CardTitle>
                                    <CardDescription>Plantillas por defecto que heredarán los nuevos concesionarios creados en el SaaS</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {templates.map(t => (
                                        <div key={t.id} className="flex items-start justify-between p-3.5 rounded-lg bg-slate-50/60 dark:bg-zinc-800/40 border border-slate-200/50 dark:border-zinc-800">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200">
                                                        {formatLabel(t.label)}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                                                        {t.type}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded">
                                                        {types.find(type => type.id === t.vehicle_type_id)?.name || 'Tipo: ' + t.vehicle_type_id}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 dark:text-zinc-500">
                                                    {t.default_value ? <>Valor por defecto: <strong>{t.default_value}</strong></> : <span className="italic">Sin valor predeterminado</span>}
                                                </p>
                                                {t.type === 'select' && Array.isArray(t.options) && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {t.options.map(o => (
                                                            <span key={o} className="bg-white dark:bg-zinc-900 text-slate-500 border border-slate-100 dark:border-zinc-800 text-[9px] px-1.5 py-0.2 rounded">
                                                                {o}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <Button size="icon" variant="ghost" onClick={() => handleDelete('templates', t.id)} className="text-slate-400 hover:text-red-500">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {templates.length === 0 && (
                                        <p className="text-sm text-slate-400 italic text-center py-6">No hay campos de plantilla globales definidos.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
