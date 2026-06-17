import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { 
    CreditCard, Calendar, CheckCircle2, AlertTriangle, ShieldAlert,
    Clock, RefreshCw, CheckCircle, ArrowLeftRight
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Store {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    pivot?: {
        role: string;
    };
}

interface Plan {
    id: number;
    name: string;
    price: number;
    currency: string;
    billing_period: string;
    trial_days: number;
    description: string;
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
    plan: Plan;
}

interface Payment {
    id: number;
    amount: number;
    currency: string;
    status: 'approved' | 'pending' | 'rejected';
    mercadopago_payment_id: string | null;
    paid_at: string | null;
    payment_type: string | null;
}

interface BillingProps {
    stores: Store[];
    activeStoreId: number | null;
    subscription: Subscription | null;
    payments: Payment[];
    flash?: {
        warning?: string;
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Suscripción',
        href: '/dashboard/billing',
    },
];

export default function Billing({ 
    stores, 
    activeStoreId, 
    subscription, 
    payments,
    flash 
}: BillingProps) {
    const activeStore = stores.find(s => s.id === activeStoreId);
    const storeRole = activeStore?.pivot?.role || 'employee';
    const isOwnerOrManager = storeRole === 'owner' || storeRole === 'manager';

    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleStoreChange = (storeId: number) => {
        router.get(route('billing.index'), { store_id: storeId });
    };

    const handleCheckout = () => {
        if (!activeStoreId) return;
        setIsCheckingOut(true);
        router.post(route('billing.checkout'), {
            store_id: activeStoreId
        }, {
            onFinish: () => setIsCheckingOut(false)
        });
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency === 'USD' ? 'USD' : 'ARS',
            maximumFractionDigits: 0
        }).format(price);
    };

    // Calculate trial days left
    const getTrialDaysLeft = () => {
        if (!subscription || subscription.status !== 'trialing' || !subscription.trial_ends_at) return 0;
        const trialEnd = new Date(subscription.trial_ends_at);
        const today = new Date();
        const diffTime = trialEnd.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const trialDaysLeft = getTrialDaysLeft();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AutoDealer - Facturación" />

            <div className="flex flex-col gap-6 p-6 max-w-[1300px] mx-auto w-full min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
                
                {/* Upper Navbar - Store Selector */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-indigo-500" />
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                                Facturación y Planes
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                Administra tu suscripción para {activeStore ? activeStore.name : 'tu concesionario'}
                            </p>
                        </div>
                    </div>

                    {stores.length > 1 && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label htmlFor="store-select" className="text-sm font-medium text-slate-600 dark:text-zinc-400 hidden md:block whitespace-nowrap">
                                Seleccionar Concesionario:
                            </label>
                            <select
                                id="store-select"
                                value={activeStoreId || ''}
                                onChange={(e) => handleStoreChange(Number(e.target.value))}
                                className="bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2.5 sm:w-64"
                            >
                                {stores.map((store) => (
                                    <option key={store.id} value={store.id}>
                                        {store.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Notifications & Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-3 shadow-xs">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">{flash.success}</span>
                    </div>
                )}
                {flash?.warning && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 p-4 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center gap-3 shadow-xs">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">{flash.warning}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-3 shadow-xs">
                        <ShieldAlert className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">{flash.error}</span>
                    </div>
                )}

                {stores.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 rounded-2xl text-center">
                        <ShieldAlert className="h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-200">No tienes concesionarios asignados</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-sm">
                            Comunícate con el administrador para que asocie tu cuenta de usuario a uno o más concesionarios.
                        </p>
                    </div>
                ) : (
                    activeStore && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Left Section: Current Subscription Status & Payment triggers */}
                            <div className="lg:col-span-2 space-y-6">
                                
                                {/* Status Card */}
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm p-6 space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                                        <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">
                                            Estado del Servicio
                                        </h3>
                                        {subscription && (
                                            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                                                subscription.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                                                subscription.status === 'trialing' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400' :
                                                'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                                            }`}>
                                                {subscription.status === 'active' ? 'Activo (Pago)' :
                                                 subscription.status === 'trialing' ? 'Prueba Activa' :
                                                 subscription.status === 'expired' ? 'Expirado' : 'Pendiente de Pago'}
                                            </span>
                                        )}
                                    </div>

                                    {subscription ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            
                                            {/* Details metrics */}
                                            <div className="space-y-4">
                                                {subscription.status === 'trialing' && (
                                                    <div className="bg-indigo-50/50 dark:bg-indigo-950/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 flex flex-col justify-between space-y-2">
                                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Período de Prueba</span>
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-3xl font-black text-slate-950 dark:text-zinc-100">{trialDaysLeft}</span>
                                                            <span className="text-xs font-semibold text-slate-500">días restantes</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500">
                                                            Vence el {formatDate(subscription.trial_ends_at)}
                                                        </p>
                                                    </div>
                                                )}

                                                {subscription.status === 'active' && (
                                                    <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-950 flex flex-col justify-between space-y-2">
                                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Próximo Vencimiento</span>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-5 w-5 text-emerald-600" />
                                                            <span className="text-lg font-extrabold text-slate-900 dark:text-zinc-100">
                                                                {formatDate(subscription.ends_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500">
                                                            Tu cuenta está cubierta y activa.
                                                        </p>
                                                    </div>
                                                )}

                                                {subscription.status !== 'active' && subscription.status !== 'trialing' && (
                                                    <div className="bg-red-50/50 dark:bg-red-950/10 p-4 rounded-xl border border-red-100 dark:border-red-950 flex flex-col justify-between space-y-2">
                                                        <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Cuenta Suspendida</span>
                                                        <div className="flex items-center gap-2">
                                                            <ShieldAlert className="h-5 w-5 text-red-600" />
                                                            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                                                                Suscripción vencida.
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500">
                                                            Tu catálogo público y herramientas de carga están temporalmente inactivos.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action triggers */}
                                            <div className="flex flex-col justify-center gap-4">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                                                        Plan asignado: {subscription.plan.name}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Costo de renovación: <strong>{formatPrice(subscription.plan.price, subscription.plan.currency)} / {subscription.plan.billing_period === 'yearly' ? 'año' : 'mes'}</strong>
                                                    </p>
                                                </div>

                                                {isOwnerOrManager ? (
                                                    <Button 
                                                        onClick={handleCheckout} 
                                                        disabled={isCheckingOut}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer w-full"
                                                    >
                                                        {isCheckingOut ? (
                                                            <>
                                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                                <span>Conectando MercadoPago...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CreditCard className="h-4 w-4" />
                                                                <span>{subscription.status === 'trialing' ? 'Suscribirse Ahora' : 'Renovar Suscripción'}</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <p className="text-xs text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200/50">
                                                        Sólo los administradores del concesionario pueden realizar el pago de la suscripción.
                                                    </p>
                                                )}
                                            </div>

                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">Cargando información del plan...</p>
                                    )}
                                </div>

                                {/* Billing History */}
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm p-6">
                                    <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-4 mb-4">
                                        Historial de Pagos
                                    </h3>

                                    {payments.length === 0 ? (
                                        <div className="py-8 text-center text-slate-400">
                                            <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                            <p className="text-xs">No se han registrado pagos aún en este concesionario.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left text-slate-500 dark:text-zinc-400">
                                                <thead className="text-xs text-slate-400 uppercase bg-slate-50 dark:bg-zinc-800/50">
                                                    <tr>
                                                        <th scope="col" className="px-4 py-3">Fecha</th>
                                                        <th scope="col" className="px-4 py-3">Transacción MP</th>
                                                        <th scope="col" className="px-4 py-3">Medio</th>
                                                        <th scope="col" className="px-4 py-3">Monto</th>
                                                        <th scope="col" className="px-4 py-3">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {payments.map((p) => (
                                                        <tr key={p.id} className="bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50/50">
                                                            <td className="px-4 py-3 font-semibold text-slate-700 dark:text-zinc-300">
                                                                {formatDate(p.paid_at)}
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-xs">
                                                                {p.mercadopago_payment_id || 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-3 text-xs capitalize">
                                                                {p.payment_type || 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-zinc-200">
                                                                {formatPrice(p.amount, p.currency)}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                                                    p.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30' :
                                                                    p.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30' :
                                                                    'bg-red-100 text-red-800 dark:bg-red-950/30'
                                                                }`}>
                                                                    {p.status === 'approved' ? 'Aprobado' :
                                                                     p.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Right Section: Plan details card */}
                            <div className="lg:col-span-1">
                                <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-3xl text-white p-6 shadow-md border border-indigo-900/30 space-y-6 sticky top-24">
                                    <div className="space-y-1">
                                        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-500/30">
                                            Plan Actual
                                        </span>
                                        <h3 className="text-2xl font-black tracking-tight pt-2">
                                            Plan Premium
                                        </h3>
                                        <p className="text-xs text-indigo-200/80 leading-relaxed">
                                            Acceso total a las funciones profesionales de gestión comercial de vehículos en AutoDealer.
                                        </p>
                                    </div>

                                    <div className="flex items-baseline gap-1 py-4 border-y border-indigo-900/40">
                                        <span className="text-4xl font-black tracking-tight">$4.500</span>
                                        <span className="text-xs text-indigo-300/80">/ mes (ARS)</span>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                                            ¿Qué incluye el plan?
                                        </h4>
                                        <ul className="space-y-2.5 text-xs text-indigo-100/90">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                                <span>Carga ilimitada de vehículos</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                                <span>Galería de fotos múltiple y portada</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                                <span>Catálogo digital público en SSR/SEO</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                                <span>Personalización visual y CSS inyectado</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                                <span>Generación de fichas técnicas para impresión</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                                <span>Botones rápidos de compartir en redes</span>
                                            </li>
                                        </ul>
                                    </div>
                                    
                                </div>
                            </div>

                        </div>
                    )
                )}

            </div>
        </AppLayout>
    );
}
