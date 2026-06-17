import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2, Layers, ShieldAlert, X, ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';

interface VehicleType {
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
}

interface TypeTemplatesProps {
    type: VehicleType;
    templates: Template[];
    status?: string;
    message?: string;
}

export default function TypeTemplates({ type, templates, status, message }: TypeTemplatesProps) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Tipos de Vehículo', href: '/admin/types' },
        { title: `Plantillas de ${type.name}`, href: `/admin/types/${type.id}/templates` },
    ];

    // Dialog states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    // Option state inside forms
    const [newOption, setNewOption] = useState('');

    // Form setups
    const createForm = useForm({
        vehicle_type_id: String(type.id),
        store_id: '' as string | null,
        label: '',
        type: 'text',
        options: [] as string[],
        default_value: '',
        redirect_type_id: String(type.id),
    });

    const editForm = useForm({
        id: null as number | null,
        vehicle_type_id: String(type.id),
        store_id: '' as string | null,
        label: '',
        type: 'text',
        options: [] as string[],
        default_value: '',
        redirect_type_id: String(type.id),
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
            vehicle_type_id: String(type.id),
            store_id: null,
            label: '',
            type: 'text',
            options: [],
            default_value: '',
            redirect_type_id: String(type.id),
        });
        setIsCreateOpen(true);
    };

    const openEdit = (template: Template) => {
        setSelectedTemplate(template);
        editForm.setData({
            id: template.id,
            vehicle_type_id: String(type.id),
            store_id: null,
            label: template.label,
            type: template.type,
            options: template.options || [],
            default_value: template.default_value || '',
            redirect_type_id: String(type.id),
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
        router.delete(`/admin/templates/${selectedTemplate.id}?redirect_type_id=${type.id}`, {
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Plantilla - ${type.name}`} />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Link href="/admin/types" className="flex items-center gap-1 hover:text-foreground transition-colors">
                                <ArrowLeft className="h-4 w-4" /> Volver a Tipos de Vehículo
                            </Link>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Campos por Defecto: {type.name}</h2>
                        <p className="text-muted-foreground">
                            Gestiona las especificaciones técnicas globales y campos por defecto que tienen todos los vehículos de tipo "{type.name}".
                        </p>
                    </div>
                    <Button onClick={openCreate} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Campo Global
                    </Button>
                </div>

                {/* Session Message */}
                {(status === 'success' || message) && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
                        {message || 'Operación completada con éxito.'}
                    </div>
                )}

                {/* Fields Table/Card */}
                <Card className="border-border">
                    <CardHeader className="pb-3 border-b bg-muted/20">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <Layers className="h-5 w-5" />
                            <CardTitle className="text-lg">Campos Técnicos del Sistema</CardTitle>
                        </div>
                        <CardDescription>
                            Estos campos se solicitan de forma obligatoria en la ficha de cualquier concesionario, a menos que el concesionario defina un campo personalizado con el mismo nombre para sobrescribirlo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {templates.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                                <Layers className="h-8 w-8 text-muted-foreground/50" />
                                <p className="text-sm">No hay campos globales definidos para {type.name}.</p>
                                <Button variant="outline" size="sm" onClick={openCreate} className="mt-2">
                                    <Plus className="h-3 w-3 mr-1" /> Crear Primero
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {templates.map((tpl) => (
                                    <div key={tpl.id} className="p-4 flex items-start justify-between hover:bg-muted/10 transition-colors">
                                        <div className="space-y-1.5 flex-1 pr-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm capitalize">{tpl.label.replace(/_/g, ' ')}</span>
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
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>Crear Campo Global</DialogTitle>
                        <DialogDescription>
                            Añade un campo global que aparecerá por defecto en las fichas de tipo {type.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4 py-2">
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
                        <DialogTitle>Editar Campo Global</DialogTitle>
                        <DialogDescription>
                            Modifica las propiedades de este campo por defecto del sistema.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTemplate && (
                        <form onSubmit={submitEdit} className="space-y-4 py-2">
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
                            ¿Estás seguro de que deseas eliminar la plantilla de campo global <strong>{selectedTemplate?.label.replace(/_/g, ' ')}</strong>?
                            Esto provocará que este campo deje de mostrarse por defecto en todos los vehículos del sistema que no lo sobrescriban. Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={submitDelete}>
                            Eliminar Campo Global
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
