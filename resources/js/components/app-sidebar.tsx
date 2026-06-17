import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Car, Landmark, Layers, ShieldAlert } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const isSuperAdmin = user.is_superadmin === true || user.is_superadmin === 1;

    // Check if user is associated with any stores and check roles
    const stores = (user.stores as any[]) || [];
    const hasStores = stores.length > 0;
    const isOwnerOrManager = stores.some(s => s.pivot?.role === 'owner' || s.pivot?.role === 'manager');

    // Build main nav items dynamically
    const mainNavItems: NavItem[] = [
        {
            title: 'Panel de Control',
            url: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    if (hasStores) {
        mainNavItems.push({
            title: 'Vehículos',
            url: '/dashboard/vehicles/manage',
            icon: Car,
        });
    }

    if (isOwnerOrManager) {
        mainNavItems.push({
            title: 'Concesionario',
            url: '/dashboard/store/settings',
            icon: Landmark,
        });
        mainNavItems.push({
            title: 'Plantillas',
            url: '/dashboard/templates/settings',
            icon: Layers,
        });
    }

    if (isSuperAdmin) {
        mainNavItems.push({
            title: 'Admin Global',
            url: '/admin/dashboard',
            icon: ShieldAlert,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
