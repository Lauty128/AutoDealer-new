import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2, Layers, Landmark, ShieldAlert, X, ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';

interface VehicleType {
    id: number;
    name: string;
    slug: string;
}

interface Store {
    id: number;
    name: string;
    slug: string;
}

interface Template {
    id: number;
    vehicle_type_id: number;
    store_id: number | null;
    label: string;
    type: string;
    options: string[] | null;
    default_value: string | null;
    created_at: string;
    typeRelation?: VehicleType;
}

interface StoreTemplatesProps {
    store: Store;
    types: VehicleType[];
    storeTemplates: Template[];
    globalTemplates: Template[];
    status?: string;
    message?: string;
}

export default function StoreTemplates({ store, types, storeTemplates, globalTemplates, status, message }: StoreTemplatesProps) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Concesionarios', href: '/admin/stores' },
        { title: `Plantillas de ${store.name}`, href: `/admin/stores/${store.id}/templates` },
    ];

    const [activeTypeId, setActiveTypeId] = useState<number>(types[0]?.id || 1);

    // Dialog states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    // Option state inside forms
    const [newOption, setNewOption] = useState('');

    // Form setups
    const createForm = useForm({
        vehicle_type_id: String(activeTypeId),
        store_id: String(store.id),
        label: '',
        type: 'text',
        options: [] as string[],
        default_value: '',
        redirect_store_id: String(store.id),
    });

    const editForm = useForm({
        id: null as number | null,
        vehicle_type_id: '',
        store_id: String(store.id),
        label: '',
        type: 'text',
        options: [] as string[],
        default_value: '',
        redirect_store_id: String(store.id),
    });

    // Options builder helpers
    const addOptionToForm = (form: 'create' | 'edit') => {
        if (!newOption.trim()) return;

        if (form === 'create') {
            createForm.setData('options', [...createForm.data.options, newOption.trim()]);
        } else {
            editForm.setData('options', [...editForm.data.options, newOption.trim()]);
        }
        setNewOption('');
    };

    const removeOptionFromForm = (index: number, form: 'create' | 'edit') => {
        if (form === 'create') {
            const updated = [...createForm.data.options];
            updated.splice(index, 1);
            createForm.setData('options', updated);
        } else {
            const updated = [...editForm.data.options];
            updated.splice(index, 1);
            editForm.setData('options', updated);
        }
    };

    const openCreate = () => {
        createForm.reset();
        createForm.setData({
            vehicle_type_id: String(activeTypeId),
            store_id: String(store.id),
            label: '',
            type: 'text',
            options: [],
            default_value: '',
            redirect_store_id: String(store.id),
        });
        setIsCreateOpen(true);
    };

    const openEdit = (template: Template) => {
        setSelectedTemplate(template);
        editForm.setData({
            id: template.id,
            vehicle_type_id: String(template.vehicle_type_id),
            store_id: String(store.id),
            label: template.label,
            type: template.type,
            options: template.options || [],
            default_value: template.default_value || '',
            redirect_store_id: String(store.id),
        });
        setIsEditOpen(true);
    };

    const openDelete = (template: Template) => {
        setSelectedTemplate(template);
        setIsDeleteOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/templates', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.data.id) return;
        editForm.post(`/admin/templates/${editForm.data.id}`, {
            onSuccess: () => {
                editForm.reset();
                setIsEditOpen(false);
            },
        });
    };

    const submitDelete = () => {
        if (!selectedTemplate) return;
        router.delete(`/admin/templates/${selectedTemplate.id}?redirect_store_id=${store.id}`, {
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    // Filter templates for the active vehicle type
    const activeStoreTemplates = storeTemplates.filter(t => t.vehicle_type_id === activeTypeId);
    const activeGlobalTemplates = globalTemplates.filter(t => t.vehicle_type_id === activeTypeId);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Plantillas - ${store.name}`} />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Link href="/admin/stores" className="flex items-center gap-1 hover:text-foreground transition-colors">
                                <ArrowLeft className="h-4 w-4" /> Volver a Concesionarios
                            </Link>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Plantillas de {store.name}</h2>
                        <p className="text-muted-foreground">
                            Personaliza los campos de especificación técnica para los vehículos de este concesionario.
                        </p>
                    </div>
                    <Button onClick={openCreate} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Campo Personalizado
                    </Button>
                </div>

                {/* Session Message */}
                {(status === 'success' || message) && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
                        {message || 'Operación completada con éxito.'}
                    </div>
                )}

                {/* Vehicle Type Tabs */}
                <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
                    {types.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setActiveTypeId(type.id)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTypeId === type.id
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {type.name}
                        </button>
                    ))}
                </div>

                {/* Templates Grid Container */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Dealer Custom Fields */}
                    <Card className="border-border">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                <Landmark className="h-5 w-5" />
                                <CardTitle className="text-lg">Campos del Concesionario</CardTitle>
                            </div>
                            <CardDescription>
                                Campos específicos configurados únicamente para {store.name}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {activeStoreTemplates.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                                    <Landmark className="h-8 w-8 text-muted-foreground/50" />
                                    <p className="text-sm">No hay campos personalizados para este tipo de vehículo.</p>
                                    <Button variant="outline" size="sm" onClick={openCreate} className="mt-2">
                                        <Plus className="h-3 w-3 mr-1" /> Crear Primero
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {activeStoreTemplates.map((tpl) => (
                                        <div key={tpl.id} className="p-4 flex items-start justify-between hover:bg-muted/10 transition-colors">
                                            <div className="space-y-1.5 flex-1 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm capitalize">{tpl.label.replace(/_/g, ' ')}</span>
                                                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 border px-1.5 py-0.2 rounded text-[10px] font-mono">
                                                        {tpl.type}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-muted-foreground space-y-1">
                                                    {tpl.default_value && (
                                                        <p>
                                                            Valor por defecto: <strong className="font-mono text-foreground">{tpl.default_value}</strong>
                                                        </p>
                                                    )}
                                                    {tpl.options && tpl.options.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 items-center pt-0.5">
                                                            <span>Opciones:</span>
                                                            {tpl.options.map((opt, i) => (
                                                                <span key={i} className="bg-zinc-50 dark:bg-zinc-900 border text-[10px] px-1 rounded">
                                                                    {opt}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(tpl)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <Edit2 className="h-4 w-4" />
                                                    <span className="sr-only">Editar</span>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openDelete(tpl)} className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Eliminar</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Global System Fields */}
                    <Card className="border-border">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <Layers className="h-5 w-5" />
                                <CardTitle className="text-lg">Campos por Defecto (Sistema)</CardTitle>
                            </div>
                            <CardDescription>
                                Campos globales habilitados en todo el sistema. No modificables por concesionario.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {activeGlobalTemplates.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                                    <Layers className="h-8 w-8 text-muted-foreground/50" />
                                    <p className="text-sm">No hay campos del sistema globales definidos.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {activeGlobalTemplates.map((tpl) => (
                                        <div key={tpl.id} className="p-4 flex items-start justify-between hover:bg-muted/10 transition-colors">
                                            <div className="space-y-1.5 flex-1 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm capitalize text-muted-foreground">{tpl.label.replace(/_/g, ' ')}</span>
                                                    <span className="bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 px-1.5 py-0.2 rounded text-[10px] font-mono">
                                                        {tpl.type}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-muted-foreground space-y-1">
                                                    {tpl.default_value && (
                                                        <p>
                                                            Valor por defecto: <strong className="font-mono text-foreground">{tpl.default_value}</strong>
                                                        </p>
                                                    )}
                                                    {tpl.options && tpl.options.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 items-center pt-0.5">
                                                            <span>Opciones:</span>
                                                            {tpl.options.map((opt, i) => (
                                                                <span key={i} className="bg-zinc-50 dark:bg-zinc-900 border text-[10px] px-1 rounded">
                                                                    {opt}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider bg-muted border px-2 py-0.5 rounded-full self-center">
                                                Global
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>Crear Campo Personalizado</DialogTitle>
                        <DialogDescription>
                            Añade una especificación técnica exclusiva para los vehículos de {store.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4 py-2">
                        {/* Hidden Inputs managed by state */}
                        <div className="grid gap-2">
                            <Label htmlFor="vehicle_type_id">Tipo de Vehículo</Label>
                            <Select
                                value={createForm.data.vehicle_type_id}
                                onValueChange={(val) => createForm.setData('vehicle_type_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el tipo de vehículo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={createForm.errors.vehicle_type_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="label">Etiqueta de Campo (Ej: traccion, techo_solar, cilindrada)</Label>
                            <Input
                                id="label"
                                value={createForm.data.label}
                                onChange={(e) => createForm.setData('label', e.target.value)}
                                placeholder="Escribe el nombre en minúsculas y sin espacios"
                                required
                            />
                            <InputError message={createForm.errors.label} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Tipo de Campo</Label>
                            <Select
                                value={createForm.data.type}
                                onValueChange={(val) => createForm.setData('type', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Texto Libre</SelectItem>
                                    <SelectItem value="number">Numérico</SelectItem>
                                    <SelectItem value="select">Selección Desplegable</SelectItem>
                                    <SelectItem value="checkbox">Opción Sí/No</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={createForm.errors.type} />
                        </div>

                        {createForm.data.type === 'select' && (
                            <div className="border p-3 rounded-lg bg-muted/20 space-y-2">
                                <Label className="text-xs font-semibold">Opciones del Desplegable</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ej: Manual"
                                        value={newOption}
                                        onChange={(e) => setNewOption(e.target.value)}
                                    />
                                    <Button type="button" size="sm" onClick={() => addOptionToForm('create')}>
                                        Añadir
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-1.5">
                                    {createForm.data.options.map((opt, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 rounded bg-background border px-2 py-0.5 text-xs text-foreground">
                                            {opt}
                                            <button type="button" onClick={() => removeOptionFromForm(i, 'create')} className="text-muted-foreground hover:text-foreground">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="default_value">Valor por Defecto</Label>
                            <Input
                                id="default_value"
                                value={createForm.data.default_value}
                                onChange={(e) => createForm.setData('default_value', e.target.value)}
                                placeholder="Valor inicial (opcional)..."
                            />
                            <InputError message={createForm.errors.default_value} />
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Guardar Campo
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-md bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>Editar Campo Personalizado</DialogTitle>
                        <DialogDescription>
                            Modifica las propiedades de este campo para {store.name}.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTemplate && (
                        <form onSubmit={submitEdit} className="space-y-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-vehicle_type_id">Tipo de Vehículo</Label>
                                <Select
                                    value={editForm.data.vehicle_type_id}
                                    onValueChange={(val) => editForm.setData('vehicle_type_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el tipo de vehículo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map((t) => (
                                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={editForm.errors.vehicle_type_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-label">Etiqueta de Campo</Label>
                                <Input
                                    id="edit-label"
                                    value={editForm.data.label}
                                    onChange={(e) => editForm.setData('label', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.label} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-type">Tipo de Campo</Label>
                                <Select
                                    value={editForm.data.type}
                                    onValueChange={(val) => editForm.setData('type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Texto Libre</SelectItem>
                                        <SelectItem value="number">Numérico</SelectItem>
                                        <SelectItem value="select">Selección Desplegable</SelectItem>
                                        <SelectItem value="checkbox">Opción Sí/No</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={editForm.errors.type} />
                            </div>

                            {editForm.data.type === 'select' && (
                                <div className="border p-3 rounded-lg bg-muted/20 space-y-2">
                                    <Label className="text-xs font-semibold">Opciones del Desplegable</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Ej: Manual"
                                            value={newOption}
                                            onChange={(e) => setNewOption(e.target.value)}
                                        />
                                        <Button type="button" size="sm" onClick={() => addOptionToForm('edit')}>
                                            Añadir
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                                        {editForm.data.options.map((opt, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 rounded bg-background border px-2 py-0.5 text-xs text-foreground">
                                                {opt}
                                                <button type="button" onClick={() => removeOptionFromForm(i, 'edit')} className="text-muted-foreground hover:text-foreground">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="edit-default_value">Valor por Defecto</Label>
                                <Input
                                    id="edit-default_value"
                                    value={editForm.data.default_value}
                                    onChange={(e) => editForm.setData('default_value', e.target.value)}
                                />
                                <InputError message={editForm.errors.default_value} />
                            </div>

                            <DialogFooter className="pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    Guardar Cambios
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-destructive gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            Confirmar Eliminación
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            ¿Estás seguro de que deseas eliminar la plantilla de campo <strong>{selectedTemplate?.label.replace(/_/g, ' ')}</strong>?
                            Esto provocará que este campo deje de mostrarse para los vehículos de este concesionario. Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={submitDelete}>
                            Eliminar Campo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
