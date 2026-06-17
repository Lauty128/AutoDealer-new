import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const isSuperAdmin = user.is_superadmin === true || user.is_superadmin === 1;

    // Check if user is owner/manager in any store
    const stores = (user.stores as any[]) || [];
    const isOwnerOrManager = stores.some(s => s.pivot?.role === 'owner' || s.pivot?.role === 'manager');
    const isAdmin = currentPath.startsWith('/admin');

    // Dynamically build navigation tabs
    const sidebarNavItems: NavItem[] = [
        {
            title: 'Perfil',
            url: isAdmin ? '/admin/settings/profile' : '/dashboard/settings/profile',
        },
        {
            title: 'Contraseña',
            url: isAdmin ? '/admin/settings/password' : '/dashboard/settings/password',
        },
        {
            title: 'Apariencia',
            url: isAdmin ? '/admin/settings/appearance' : '/dashboard/settings/appearance',
        },
    ];

    return (
        <div className="px-4 py-6">
            <Heading title="Configuración" description="Administra la configuración de tu perfil, concesionarios y parámetros del sistema" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={item.url}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === item.url,
                                })}
                            >
                                <Link href={item.url} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1">
                    <section className="space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
