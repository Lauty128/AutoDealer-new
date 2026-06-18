import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/admin/pagination';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Edit2, ShieldAlert, Receipt, DollarSign, Calendar, Landmark, Users } from 'lucide-react';
import InputError from '@/components/input-error';

interface Plan {
    id: number;
    name: string;
    slug: string;
    price: string | number;
    currency: string;
    billing_period: string;
    trial_days: number;
}

interface StoreUser {
    id: number;
    name: string;
    email: string;
    pivot: {
        role: string;
    };
}

interface Store {
    id: number;
    name: string;
    slug: string;
    users: StoreUser[];
}

interface Subscription {
    id: number;
    store_id: number;
    plan_id: number;
    status: 'trialing' | 'active' | 'pending_payment' | 'cancelled' | 'expired';
    trial_ends_at: string | null;
    starts_at: string | null;
    ends_at: string | null;
    mercadopago_preference_id: string | null;
    cancelled_at: string | null;
    created_at: string;
    store: Store;
    plan: Plan;
}

interface Payment {
    id: number;
    store_id: number;
    subscription_id: number | null;
    amount: string | number;
    currency: string;
    status: 'approved' | 'pending' | 'rejected';
    mercadopago_payment_id: string | null;
    mercadopago_preference_id: string | null;
    payment_type: string | null;
    paid_at: string | null;
    created_at: string;
    store: Store;
    subscription?: {
        plan: Plan;
    } | null;
}

interface PaginatedSubscriptions {
    data: Subscription[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
}

interface PaginatedPayments {
    data: Payment[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
}

interface SubscriptionsProps {
    subscriptions: PaginatedSubscriptions;
    payments: PaginatedPayments;
    plans: Plan[];
    filters: {
        search: string;
    };
    status?: string;
    message?: string;
}

export default function SubscriptionsIndex({ subscriptions, payments, plans, filters, status, message }: SubscriptionsProps) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Suscripciones y Pagos', href: '/admin/subscriptions' },
    ];

    const [activeTab, setActiveTab] = useState<'subscriptions' | 'payments'>('subscriptions');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    
    // Modal states
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

    // Form setup for editing a subscription
    const editForm = useForm({
        plan_id: '',
        status: '' as 'trialing' | 'active' | 'pending_payment' | 'cancelled' | 'expired',
        starts_at: '',
        ends_at: '',
        trial_ends_at: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/subscriptions', { search: searchTerm }, { preserveState: true });
    };

    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return '';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return '';
            // Return YYYY-MM-DD
            return d.toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    const formatDateString = (dateString: string | null) => {
        if (!dateString) return '-';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return '-';
            return d.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        } catch {
            return '-';
        }
    };

    const openEdit = (sub: Subscription) => {
        setSelectedSubscription(sub);
        editForm.setData({
            plan_id: String(sub.plan_id),
            status: sub.status,
            starts_at: formatDateForInput(sub.starts_at),
            ends_at: formatDateForInput(sub.ends_at),
            trial_ends_at: formatDateForInput(sub.trial_ends_at),
        });
        setIsEditOpen(true);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubscription) return;
        editForm.post(`/admin/subscriptions/${selectedSubscription.id}`, {
            onSuccess: () => {
                editForm.reset();
                setIsEditOpen(false);
            },
        });
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
            case 'trialing':
                return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
            case 'pending_payment':
                return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
            case 'cancelled':
                return 'bg-red-500/10 text-red-500 border border-red-500/20';
            case 'expired':
                return 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20';
            default:
                return 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/10';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return 'Activo (Pago)';
            case 'trialing':
                return 'Período de Prueba';
            case 'pending_payment':
                return 'Pago Pendiente';
            case 'cancelled':
                return 'Cancelada';
            case 'expired':
                return 'Expirada';
            default:
                return status;
        }
    };

    const getPaymentStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
            case 'pending':
                return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
            case 'rejected':
                return 'bg-red-500/10 text-red-500 border border-red-500/20';
            default:
                return 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/10';
        }
    };

    const getPaymentStatusLabel = (status: string) => {
        switch (status) {
            case 'approved':
                return 'Aprobado';
            case 'pending':
                return 'Pendiente';
            case 'rejected':
                return 'Rechazado';
            default:
                return status;
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Suscripciones y Historial de Pagos" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Suscripciones y Pagos</h2>
                    <p className="text-muted-foreground">
                        Monitorea los planes activos de los concesionarios y revisa el historial de pagos procesados.
                    </p>
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

                {/* Filter and search bar */}
                <Card>
                    <CardHeader className="p-4 sm:p-6 pb-2">
                        <CardTitle className="text-lg">Buscar Suscripciones y Pagos</CardTitle>
                        <CardDescription>Busca por concesionario, nombre de usuario o dirección de correo electrónico.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Buscar por concesionario, usuario, email..."
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

                {/* Tabs selection */}
                <div className="flex border-b border-border gap-2">
                    <button
                        onClick={() => setActiveTab('subscriptions')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'subscriptions'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Suscripciones Activas ({subscriptions.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'payments'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Historial de Pagos ({payments.total})
                    </button>
                </div>

                {/* Tab content */}
                {activeTab === 'subscriptions' ? (
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                        <th className="p-4">Concesionario</th>
                                        <th className="p-4">Plan Actual</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4">Período de Cobertura</th>
                                        <th className="p-4">Usuarios Propietarios</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                No se encontraron suscripciones.
                                            </td>
                                        </tr>
                                    ) : (
                                        subscriptions.data.map((sub) => (
                                            <tr key={sub.id} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="p-4 font-semibold text-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Landmark className="h-4 w-4 text-muted-foreground" />
                                                        {sub.store?.name || 'Tienda Eliminada'}
                                                    </div>
                                                    {sub.store?.slug && (
                                                        <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                                                            {sub.store.slug}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 font-medium text-foreground">
                                                    {sub.plan?.name || 'Plan Indefinido'}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(sub.status)}`}>
                                                        {getStatusLabel(sub.status)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs text-muted-foreground space-y-1">
                                                    {sub.status === 'trialing' ? (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>Prueba hasta: {formatDateString(sub.trial_ends_at)}</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div>Inicio: {formatDateString(sub.starts_at)}</div>
                                                            <div>Fin: {formatDateString(sub.ends_at)}</div>
                                                        </>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        {sub.store?.users && sub.store.users.length > 0 ? (
                                                            sub.store.users.map((user) => (
                                                                <div key={user.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                                    <Users className="h-3 w-3 text-muted-foreground/60" />
                                                                    <span>{user.name} ({user.pivot.role})</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">Sin dueños</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(sub)} className="h-8 w-8">
                                                        <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                        <span className="sr-only">Editar</span>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={subscriptions.links} />
                    </div>
                ) : (
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                        <th className="p-4">Concesionario</th>
                                        <th className="p-4">Plan</th>
                                        <th className="p-4">Monto</th>
                                        <th className="p-4">ID Transacción</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4">Fecha Pago</th>
                                        <th className="p-4">Usuarios Propietarios</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                                No se encontraron pagos en el historial.
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.data.map((payment) => (
                                            <tr key={payment.id} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="p-4 font-semibold text-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Landmark className="h-4 w-4 text-muted-foreground" />
                                                        {payment.store?.name || 'Tienda Eliminada'}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-medium text-foreground">
                                                    {payment.subscription?.plan?.name || 'Suscripción'}
                                                </td>
                                                <td className="p-4 font-semibold text-foreground">
                                                    {payment.currency} {Number(payment.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4 text-xs font-mono text-muted-foreground space-y-0.5">
                                                    {payment.mercadopago_payment_id ? (
                                                        <div>MP ID: {payment.mercadopago_payment_id}</div>
                                                    ) : (
                                                        <span className="italic">Sin ID</span>
                                                    )}
                                                    {payment.payment_type && (
                                                        <div className="text-[10px] text-muted-foreground">Método: {payment.payment_type}</div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPaymentStatusBadgeClass(payment.status)}`}>
                                                        {getPaymentStatusLabel(payment.status)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-muted-foreground text-xs">
                                                    {payment.paid_at ? formatDateString(payment.paid_at) : formatDateString(payment.created_at)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        {payment.store?.users && payment.store.users.length > 0 ? (
                                                            payment.store.users.map((user) => (
                                                                <div key={user.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                                    <Users className="h-3 w-3 text-muted-foreground/60" />
                                                                    <span>{user.name}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">Sin dueños</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={payments.links} />
                    </div>
                )}
            </div>

            {/* Edit Subscription Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-md bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>Editar Suscripción</DialogTitle>
                        <DialogDescription>
                            Modifica manualmente el plan contratado, estado y fechas de cobertura de la tienda{' '}
                            <strong>{selectedSubscription?.store?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSubscription && (
                        <form onSubmit={submitEdit} className="space-y-4 py-2">
                            <div className="grid gap-2">
                                <Label htmlFor="plan_id">Plan de Suscripción</Label>
                                <Select
                                    value={editForm.data.plan_id}
                                    onValueChange={(val) => editForm.setData('plan_id', val)}
                                >
                                    <SelectTrigger id="plan_id">
                                        <SelectValue placeholder="Selecciona un plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name} ({p.currency} {Number(p.price).toLocaleString('es-AR')})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={editForm.errors.plan_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Estado</Label>
                                <Select
                                    value={editForm.data.status}
                                    onValueChange={(val) => editForm.setData('status', val as any)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Estado de Suscripción" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="trialing">Período de Prueba</SelectItem>
                                        <SelectItem value="active">Activo (Pago Aprobado)</SelectItem>
                                        <SelectItem value="pending_payment">Pago Pendiente</SelectItem>
                                        <SelectItem value="cancelled">Cancelada</SelectItem>
                                        <SelectItem value="expired">Expirada</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={editForm.errors.status} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="trial_ends_at">Fecha de Finalización de Prueba (Trial)</Label>
                                <Input
                                    id="trial_ends_at"
                                    type="date"
                                    value={editForm.data.trial_ends_at}
                                    onChange={(e) => editForm.setData('trial_ends_at', e.target.value)}
                                />
                                <InputError message={editForm.errors.trial_ends_at} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="starts_at">Fecha de Inicio</Label>
                                    <Input
                                        id="starts_at"
                                        type="date"
                                        value={editForm.data.starts_at}
                                        onChange={(e) => editForm.setData('starts_at', e.target.value)}
                                    />
                                    <InputError message={editForm.errors.starts_at} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ends_at">Fecha de Vencimiento</Label>
                                    <Input
                                        id="ends_at"
                                        type="date"
                                        value={editForm.data.ends_at}
                                        onChange={(e) => editForm.setData('ends_at', e.target.value)}
                                    />
                                    <InputError message={editForm.errors.ends_at} />
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
        </AdminLayout>
    );
}
