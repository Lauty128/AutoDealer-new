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
import { Search, Plus, Trash2, Edit2, ShieldAlert, CreditCard, DollarSign } from 'lucide-react';
import InputError from '@/components/input-error';

interface Plan {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string | number;
    currency: string;
    billing_period: string;
    trial_days: number;
    is_active: boolean;
    created_at: string;
}

interface PaginatedPlans {
    data: Plan[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
}

interface PlansProps {
    plans: PaginatedPlans;
    filters: {
        search: string;
    };
    status?: string;
    message?: string;
}

export default function PlansIndex({ plans, filters, status, message }: PlansProps) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Planes', href: '/admin/plans' },
    ];

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    // Form setups
    const createForm = useForm({
        name: '',
        description: '',
        price: '',
        currency: 'ARS',
        billing_period: 'monthly',
        trial_days: 90,
        is_active: true,
    });

    const editForm = useForm({
        id: null as number | null,
        name: '',
        description: '',
        price: '' as string | number,
        currency: 'ARS',
        billing_period: 'monthly',
        trial_days: 90,
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/plans', { search: searchTerm }, { preserveState: true });
    };

    const openEdit = (plan: Plan) => {
        setSelectedPlan(plan);
        editForm.setData({
            id: plan.id,
            name: plan.name,
            description: plan.description || '',
            price: plan.price,
            currency: plan.currency,
            billing_period: plan.billing_period,
            trial_days: plan.trial_days,
            is_active: plan.is_active,
        });
        setIsEditOpen(true);
    };

    const openDelete = (plan: Plan) => {
        setSelectedPlan(plan);
        setIsDeleteOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/plans', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.data.id) return;
        editForm.post(`/admin/plans/${editForm.data.id}`, {
            onSuccess: () => {
                editForm.reset();
                setIsEditOpen(false);
            },
        });
    };

    const submitDelete = () => {
        if (!selectedPlan) return;
        router.delete(`/admin/plans/${selectedPlan.id}`, {
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Administración de Planes" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Planes de Suscripción</h2>
                        <p className="text-muted-foreground">
                            Crea y modifica los planes de suscripción para los concesionarios y sus tarifas correspondientes.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Plan
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
                        <CardTitle className="text-lg">Buscar Planes</CardTitle>
                        <CardDescription>Busca planes por su nombre o descripción.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Buscar por nombre o descripción..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-background"
                                />
                            </div>
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
                                    <th className="p-4">Plan</th>
                                    <th className="p-4">Precio</th>
                                    <th className="p-4">Período de Facturación</th>
                                    <th className="p-4">Días de Prueba</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            No se encontraron planes.
                                        </td>
                                    </tr>
                                ) : (
                                    plans.data.map((plan) => (
                                        <tr key={plan.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                        {plan.name}
                                                    </div>
                                                    {plan.description && (
                                                        <div className="text-xs text-muted-foreground max-w-xs mt-0.5 truncate">
                                                            {plan.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-foreground">
                                                {plan.currency} {Number(plan.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4">
                                                <span className="capitalize text-muted-foreground">
                                                    {plan.billing_period === 'monthly' ? 'Mensual' : plan.billing_period === 'yearly' ? 'Anual' : plan.billing_period}
                                                </span>
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {plan.trial_days} días
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    plan.is_active 
                                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                                        : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/10'
                                                }`}>
                                                    {plan.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(plan)} className="h-8 w-8">
                                                        <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                        <span className="sr-only">Editar</span>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openDelete(plan)} className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10">
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
                    <Pagination links={plans.links} />
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Plan</DialogTitle>
                        <DialogDescription>Completa los valores del plan para comenzar a comercializarlo.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Plan</Label>
                            <Input
                                id="name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Ej: Plan Premium"
                                required
                            />
                            <InputError message={createForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                                id="description"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                placeholder="Breve resumen de beneficios"
                            />
                            <InputError message={createForm.errors.description} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Precio</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={createForm.data.price}
                                    onChange={(e) => createForm.setData('price', e.target.value)}
                                    placeholder="4500.00"
                                    required
                                />
                                <InputError message={createForm.errors.price} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="currency">Moneda</Label>
                                <Select
                                    value={createForm.data.currency}
                                    onValueChange={(val) => createForm.setData('currency', val)}
                                >
                                    <SelectTrigger id="currency">
                                        <SelectValue placeholder="Moneda" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ARS">ARS ($)</SelectItem>
                                        <SelectItem value="USD">USD (u$s)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={createForm.errors.currency} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="billing_period">Facturación</Label>
                                <Select
                                    value={createForm.data.billing_period}
                                    onValueChange={(val) => createForm.setData('billing_period', val)}
                                >
                                    <SelectTrigger id="billing_period">
                                        <SelectValue placeholder="Período" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Mensual</SelectItem>
                                        <SelectItem value="yearly">Anual</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={createForm.errors.billing_period} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="trial_days">Días de Prueba Gratis</Label>
                                <Input
                                    id="trial_days"
                                    type="number"
                                    value={createForm.data.trial_days}
                                    onChange={(e) => createForm.setData('trial_days', parseInt(e.target.value) || 0)}
                                    required
                                />
                                <InputError message={createForm.errors.trial_days} />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/20">
                            <Checkbox
                                id="is_active"
                                checked={createForm.data.is_active}
                                onCheckedChange={(checked) => createForm.setData('is_active', !!checked)}
                            />
                            <div className="grid gap-1">
                                <Label htmlFor="is_active" className="cursor-pointer font-semibold">Plan Activo</Label>
                                <p className="text-xs text-muted-foreground">
                                    Los usuarios podrán suscribirse a este plan si está activo.
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Crear Plan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-md bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>Editar Plan</DialogTitle>
                        <DialogDescription>Modifica los valores del plan de suscripción.</DialogDescription>
                    </DialogHeader>
                    {selectedPlan && (
                        <form onSubmit={submitEdit} className="space-y-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Nombre del Plan</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Descripción</Label>
                                <Input
                                    id="edit-description"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                />
                                <InputError message={editForm.errors.description} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-price">Precio</Label>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        step="0.01"
                                        value={editForm.data.price}
                                        onChange={(e) => editForm.setData('price', e.target.value)}
                                        required
                                    />
                                    <InputError message={editForm.errors.price} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-currency">Moneda</Label>
                                    <Select
                                        value={editForm.data.currency}
                                        onValueChange={(val) => editForm.setData('currency', val)}
                                    >
                                        <SelectTrigger id="edit-currency">
                                            <SelectValue placeholder="Moneda" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ARS">ARS ($)</SelectItem>
                                            <SelectItem value="USD">USD (u$s)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={editForm.errors.currency} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-billing_period">Facturación</Label>
                                    <Select
                                        value={editForm.data.billing_period}
                                        onValueChange={(val) => editForm.setData('billing_period', val)}
                                    >
                                        <SelectTrigger id="edit-billing_period">
                                            <SelectValue placeholder="Período" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Mensual</SelectItem>
                                            <SelectItem value="yearly">Anual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={editForm.errors.billing_period} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-trial_days">Días de Prueba Gratis</Label>
                                    <Input
                                        id="edit-trial_days"
                                        type="number"
                                        value={editForm.data.trial_days}
                                        onChange={(e) => editForm.setData('trial_days', parseInt(e.target.value) || 0)}
                                        required
                                    />
                                    <InputError message={editForm.errors.trial_days} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/20">
                                <Checkbox
                                    id="edit-is_active"
                                    checked={editForm.data.is_active}
                                    onCheckedChange={(checked) => editForm.setData('is_active', !!checked)}
                                />
                                <div className="grid gap-1">
                                    <Label htmlFor="edit-is_active" className="cursor-pointer font-semibold">Plan Activo</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Los usuarios podrán suscribirse a este plan si está activo.
                                    </p>
                                </div>
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
                            ¿Estás seguro de que deseas eliminar el plan <strong>{selectedPlan?.name}</strong>?
                            Esta acción no se puede deshacer y fallará si existen suscripciones activas vinculadas a este plan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={submitDelete}>
                            Eliminar Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
