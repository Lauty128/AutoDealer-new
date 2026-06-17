import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/admin/pagination';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Search, Plus, Trash2, Edit2, ShieldAlert, Boxes, Layers } from 'lucide-react';
import InputError from '@/components/input-error';

interface VehicleType {
    id: number;
    name: string;
    slug: string;
    vehicles_count: number;
}

interface PaginatedTypes {
    data: VehicleType[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
}

interface TypesProps {
    types: PaginatedTypes;
    filters: {
        search: string;
    };
    status?: string;
    message?: string;
}

export default function TypesIndex({ types, filters, status, message }: TypesProps) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Tipos de Vehículo', href: '/admin/types' },
    ];

    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<VehicleType | null>(null);

    // Form setups
    const createForm = useForm({
        name: '',
    });

    const editForm = useForm({
        id: null as number | null,
        name: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/types', { search: searchTerm }, { preserveState: true });
    };

    const generateSlugPreview = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
            .replace(/\s+/g, '-') // Collapse whitespace
            .replace(/-+/g, '-'); // Collapse dashes
    };

    const openEdit = (type: VehicleType) => {
        setSelectedType(type);
        editForm.setData({
            id: type.id,
            name: type.name,
        });
        setIsEditOpen(true);
    };

    const openDelete = (type: VehicleType) => {
        setSelectedType(type);
        setIsDeleteOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/types', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.data.id) return;
        editForm.post(`/admin/types/${editForm.data.id}`, {
            onSuccess: () => {
                editForm.reset();
                setIsEditOpen(false);
            },
        });
    };

    const submitDelete = () => {
        if (!selectedType) return;
        router.delete(`/admin/types/${selectedType.id}`, {
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Administración de Tipos de Vehículo" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Tipos de Vehículo</h2>
                        <p className="text-muted-foreground">
                            Administra los tipos y categorías de vehículos (ej: Auto, Moto, Camioneta) disponibles.
                        </p>
                    </div>
                    <Button onClick={() => { createForm.reset(); setIsCreateOpen(true); }} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Tipo
                    </Button>
                </div>

                {/* Session Message */}
                {status === 'success' && message && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
                        {message}
                    </div>
                )}
                {status === 'error' && message && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                        {message}
                    </div>
                )}

                <Card>
                    <CardHeader className="p-4 sm:p-6 pb-2">
                        <CardTitle className="text-lg">Buscar Tipos de Vehículo</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Buscar tipos por nombre o slug..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-background"
                                />
                            </div>
                            <Button type="submit">Buscar</Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                    <th className="p-4 w-[80px]">ID</th>
                                    <th className="p-4">Nombre</th>
                                    <th className="p-4">Slug / URL</th>
                                    <th className="p-4">Vehículos Asociados</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {types.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No se encontraron tipos de vehículos registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    types.data.map((type) => (
                                        <tr key={type.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="p-4 text-muted-foreground font-mono text-xs">#{type.id}</td>
                                            <td className="p-4 font-semibold">{type.name}</td>
                                            <td className="p-4">
                                                <span className="font-mono text-xs bg-muted border px-1.5 py-0.5 rounded text-muted-foreground">
                                                    {type.slug}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2.5 py-0.5 rounded-full text-xs border border-zinc-200/50 dark:border-zinc-700/50 font-medium">
                                                    {type.vehicles_count} vehículos
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8" title="Plantillas por defecto">
                                                        <Link href={`/admin/types/${type.id}/templates`}>
                                                            <Layers className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                            <span className="sr-only">Plantillas</span>
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(type)} className="h-8 w-8">
                                                        <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                        <span className="sr-only">Editar</span>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openDelete(type)} className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Eliminar</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={types.links} />
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>Crear Tipo de Vehículo</DialogTitle>
                        <DialogDescription>
                            Añade una nueva categoría de vehículos al sistema global.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Tipo</Label>
                            <Input
                                id="name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Ej: Auto, Moto, Camioneta, Camión..."
                                required
                            />
                            <InputError message={createForm.errors.name} />
                        </div>

                        {createForm.data.name && (
                            <div className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded border border-dashed">
                                Vista previa de URL/Slug: <strong className="font-mono text-foreground">{generateSlugPreview(createForm.data.name)}</strong>
                            </div>
                        )}

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Guardar Tipo
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-md bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>Editar Tipo de Vehículo</DialogTitle>
                        <DialogDescription>
                            Modifica los detalles del tipo de vehículo seleccionado.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedType && (
                        <form onSubmit={submitEdit} className="space-y-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Nombre del Tipo</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.name} />
                            </div>

                            {editForm.data.name && (
                                <div className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded border border-dashed">
                                    Nuevo URL/Slug: <strong className="font-mono text-foreground">{generateSlugPreview(editForm.data.name)}</strong>
                                </div>
                            )}

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
                            ¿Estás seguro de que deseas eliminar el tipo de vehículo <strong>{selectedType?.name}</strong>?
                            Este tipo ya no estará disponible para seleccionar en nuevos vehículos. Si hay vehículos registrados con este tipo, la base de datos impedirá la eliminación.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={submitDelete}>
                            Eliminar Tipo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
