import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Landmark, Users, Car, Layers, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Stats {
    stores_count: number;
    users_count: number;
    vehicles_count: number;
    templates_count: number;
}

interface StoreItem {
    id: number;
    name: string;
    slug: string;
    vehicles_count: number;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    is_superadmin: boolean;
    created_at: string;
}

interface DashboardProps {
    stats: Stats;
    stores: StoreItem[];
    recentUsers: UserItem[];
}

export default function AdminDashboard({ stats, stores, recentUsers }: DashboardProps) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Panel General', href: '/admin/dashboard' },
    ];

    const statCards = [
        {
            title: 'Concesionarios',
            value: stats.stores_count,
            icon: Landmark,
            description: 'Concesionarios registrados',
            href: '/admin/stores',
            color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        },
        {
            title: 'Usuarios',
            value: stats.users_count,
            icon: Users,
            description: 'Usuarios en la plataforma',
            href: '/admin/users',
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        },
        {
            title: 'Vehículos Totales',
            value: stats.vehicles_count,
            icon: Car,
            description: 'Vehículos en stock global',
            href: '/admin/vehicles',
            color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        },
        // {
        //     title: 'Plantillas de Campos',
        //     value: stats.templates_count,
        //     icon: Layers,
        //     description: 'Campos personalizados de ficha',
        //     href: '/admin/templates',
        //     color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        // },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel de Administración" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Panel General</h2>
                    <p className="text-muted-foreground">
                        Bienvenido al sistema de administración global de AutoDealer.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Card key={card.title} className="relative overflow-hidden group hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                    <div className={`p-2 rounded-xl border ${card.color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{card.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                                    <Link
                                        href={card.href}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-4 group-hover:underline"
                                    >
                                        Administrar <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Concesionarios Destacados</CardTitle>
                            <CardDescription>
                                Concesionarios con mayor cantidad de vehículos en stock.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stores.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No hay concesionarios registrados.</p>
                                ) : (
                                    stores.map((store) => (
                                        <div key={store.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{store.name}</p>
                                                <p className="text-xs text-muted-foreground">slug: {store.slug}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                                                    {store.vehicles_count} vehículos
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Usuarios Registrados Recientemente</CardTitle>
                            <CardDescription>
                                Últimos usuarios creados en la plataforma.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentUsers.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No hay usuarios registrados.</p>
                                ) : (
                                    recentUsers.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${user.is_superadmin
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                                                    }`}>
                                                    {user.is_superadmin ? 'Admin Global' : 'Usuario'}
                                                </span>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">{user.created_at}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
