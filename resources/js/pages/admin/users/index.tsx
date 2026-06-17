import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/admin/pagination';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Trash2, Edit2, Shield, User as UserIcon, Store as StoreIcon, ShieldAlert } from 'lucide-react';
import InputError from '@/components/input-error';

interface Store {
    id: number;
    name: string;
    slug: string;
}

interface UserStore {
    id: number;
    name: string;
    pivot: {
        role: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    is_superadmin: boolean;
    stores: UserStore[];
    created_at: string;
}

interface PaginatedUsers {
    data: User[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
}

interface UsersProps {
    users: PaginatedUsers;
    stores: Store[];
    filters: {
        search: string;
        role: string;
    };
    status?: string;
    message?: string;
}

export default function UsersIndex({ users, stores, filters, status, message }: UsersProps) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Usuarios', href: '/admin/users' },
    ];

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form setups
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        is_superadmin: false,
        stores: [] as { store_id: string; role: string }[],
    });

    const editForm = useForm({
        id: null as number | null,
        name: '',
        email: '',
        password: '',
        is_superadmin: false,
        stores: [] as { store_id: string; role: string }[],
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { search: searchTerm, role: roleFilter }, { preserveState: true });
    };

    const handleRoleFilterChange = (value: string) => {
        setRoleFilter(value);
        router.get('/admin/users', { search: searchTerm, role: value === 'all' ? '' : value }, { preserveState: true });
    };

    // Store association helpers
    const addStoreToCreate = () => {
        createForm.setData('stores', [...createForm.data.stores, { store_id: '', role: 'editor' }]);
    };

    const removeStoreFromCreate = (index: number) => {
        const updated = [...createForm.data.stores];
        updated.splice(index, 1);
        createForm.setData('stores', updated);
    };

    const updateStoreInCreate = (index: number, field: 'store_id' | 'role', value: string) => {
        const updated = [...createForm.data.stores];
        updated[index] = { ...updated[index], [field]: value };
        createForm.setData('stores', updated);
    };

    const addStoreToEdit = () => {
        editForm.setData('stores', [...editForm.data.stores, { store_id: '', role: 'editor' }]);
    };

    const removeStoreFromEdit = (index: number) => {
        const updated = [...editForm.data.stores];
        updated.splice(index, 1);
        editForm.setData('stores', updated);
    };

    const updateStoreInEdit = (index: number, field: 'store_id' | 'role', value: string) => {
        const updated = [...editForm.data.stores];
        updated[index] = { ...updated[index], [field]: value };
        editForm.setData('stores', updated);
    };

    const openEdit = (user: User) => {
        setSelectedUser(user);
        editForm.setData({
            id: user.id,
            name: user.name,
            email: user.email,
            password: '',
            is_superadmin: user.is_superadmin,
            stores: user.stores.map(s => ({ store_id: String(s.id), role: s.pivot.role })),
        });
        setIsEditOpen(true);
    };

    const openDelete = (user: User) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/users', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.data.id) return;
        editForm.post(`/admin/users/${editForm.data.id}`, {
            onSuccess: () => {
                editForm.reset();
                setIsEditOpen(false);
            },
        });
    };

    const submitDelete = () => {
        if (!selectedUser) return;
        router.delete(`/admin/users/${selectedUser.id}`, {
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Administración de Usuarios" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
                        <p className="text-muted-foreground">
                            Administra las cuentas de usuario y sus permisos de acceso a concesionarios.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Usuario
                    </Button>
                </div>

                {(status === 'success' || message) && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
                        {message || 'Operación completada con éxito.'}
                    </div>
                )}
                
                {status === 'error' && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                        {message || 'Ocurrió un error inesperado.'}
                    </div>
                )}

                <Card>
                    <CardHeader className="p-4 sm:p-6 pb-2">
                        <CardTitle className="text-lg">Buscar y Filtrar</CardTitle>
                        <CardDescription>Usa los filtros para encontrar usuarios específicos.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Buscar por nombre o email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-background"
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                                <SelectTrigger className="w-full sm:w-[200px] bg-background">
                                    <SelectValue placeholder="Tipo de Rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Roles</SelectItem>
                                    <SelectItem value="admin">Administrador Global</SelectItem>
                                    <SelectItem value="user">Usuario Regular</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                                Buscar
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                    <th className="p-4">Nombre</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Rol Global</th>
                                    <th className="p-4">Concesionarios</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No se encontraron usuarios.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="p-4 font-medium">{user.name}</td>
                                            <td className="p-4 text-muted-foreground">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                    user.is_superadmin 
                                                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                                        : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/10'
                                                }`}>
                                                    {user.is_superadmin ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                                                    {user.is_superadmin ? 'Admin Global' : 'Usuario'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                                                    {user.stores.length === 0 ? (
                                                        <span className="text-xs text-muted-foreground italic">Sin asignar</span>
                                                    ) : (
                                                        user.stores.map((st) => (
                                                            <span key={st.id} className="inline-flex items-center gap-1 rounded bg-muted border text-[11px] px-1.5 py-0.5">
                                                                <StoreIcon className="h-2.5 w-2.5 text-muted-foreground" />
                                                                {st.name} ({st.pivot.role})
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(user)} className="h-8 w-8">
                                                        <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                        <span className="sr-only">Editar</span>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openDelete(user)} className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10">
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
                    <Pagination links={users.links} />
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                        <DialogDescription>Completa el formulario para registrar un nuevo usuario en la plataforma.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input
                                id="name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña (Mínimo 8 caracteres)</Label>
                            <Input
                                id="password"
                                type="password"
                                value={createForm.data.password}
                                onChange={(e) => createForm.setData('password', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.password} />
                        </div>

                        <div className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/20">
                            <Checkbox
                                id="is_superadmin"
                                checked={createForm.data.is_superadmin}
                                onCheckedChange={(checked) => createForm.setData('is_superadmin', !!checked)}
                            />
                            <div className="grid gap-1">
                                <Label htmlFor="is_superadmin" className="cursor-pointer font-semibold">Administrador Global (Superadmin)</Label>
                                <p className="text-xs text-muted-foreground">
                                    Permite acceso completo a este panel administrativo e inventario global.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between border-b pb-2">
                                <Label className="text-sm font-semibold">Accesos a Concesionarios</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addStoreToCreate}>
                                    <Plus className="h-3 w-3 mr-1" /> Asociar
                                </Button>
                            </div>

                            {createForm.data.stores.map((item, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <div className="flex-1">
                                        <Select
                                            value={item.store_id}
                                            onValueChange={(val) => updateStoreInCreate(index, 'store_id', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar Concesionario" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stores.map((st) => (
                                                    <SelectItem key={st.id} value={String(st.id)}>
                                                        {st.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-[140px]">
                                        <Select
                                            value={item.role}
                                            onValueChange={(val) => updateStoreInCreate(index, 'role', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Rol" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="owner">Dueño</SelectItem>
                                                <SelectItem value="manager">Gerente</SelectItem>
                                                <SelectItem value="editor">Editor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeStoreFromCreate(index)}
                                        className="text-destructive hover:bg-destructive/10 h-9 w-9"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Guardar Usuario
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>Modifica los datos del usuario. Deja la contraseña en blanco si no deseas cambiarla.</DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <form onSubmit={submitEdit} className="space-y-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Nombre Completo</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-email">Correo Electrónico</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-password">Nueva Contraseña (Opcional)</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={editForm.data.password}
                                    onChange={(e) => editForm.setData('password', e.target.value)}
                                    placeholder="Dejar en blanco para conservar contraseña actual"
                                />
                                <InputError message={editForm.errors.password} />
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/20">
                                <Checkbox
                                    id="edit-is_superadmin"
                                    checked={editForm.data.is_superadmin}
                                    onCheckedChange={(checked) => editForm.setData('is_superadmin', !!checked)}
                                />
                                <div className="grid gap-1">
                                    <Label htmlFor="edit-is_superadmin" className="cursor-pointer font-semibold">Administrador Global (Superadmin)</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Permite acceso completo a este panel administrativo e inventario global.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <Label className="text-sm font-semibold">Accesos a Concesionarios</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addStoreToEdit}>
                                        <Plus className="h-3 w-3 mr-1" /> Asociar
                                    </Button>
                                </div>

                                {editForm.data.stores.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <div className="flex-1">
                                            <Select
                                                value={item.store_id}
                                                onValueChange={(val) => updateStoreInEdit(index, 'store_id', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar Concesionario" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stores.map((st) => (
                                                        <SelectItem key={st.id} value={String(st.id)}>
                                                            {st.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-[140px]">
                                            <Select
                                                value={item.role}
                                                onValueChange={(val) => updateStoreInEdit(index, 'role', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Rol" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="owner">Dueño</SelectItem>
                                                    <SelectItem value="manager">Gerente</SelectItem>
                                                    <SelectItem value="editor">Editor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeStoreFromEdit(index)}
                                            className="text-destructive hover:bg-destructive/10 h-9 w-9"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
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
                            ¿Estás seguro de que deseas eliminar permanentemente a <strong>{selectedUser?.name}</strong>?
                            Esta acción desvinculará todos sus accesos a concesionarios y no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={submitDelete}>
                            Eliminar Usuario
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
