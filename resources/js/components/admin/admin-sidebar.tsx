import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, Landmark, Layers, Car, ArrowLeft, Tags, Boxes, Fuel } from 'lucide-react';
import AppLogo from '../app-logo';
import { NavUser } from '../nav-user';

export function AdminSidebar() {
    const { url } = usePage();

    const isUrlActive = (path: string) => {
        return url.startsWith(path);
    };

    const menuItems = [
        {
            title: 'Panel General',
            url: '/admin/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Usuarios',
            url: '/admin/users',
            icon: Users,
        },
        {
            title: 'Concesionarios',
            url: '/admin/stores',
            icon: Landmark,
        },
        {
            title: 'Marcas',
            url: '/admin/marks',
            icon: Tags,
        },
        {
            title: 'Tipos de Vehículo',
            url: '/admin/types',
            icon: Boxes,
        },
        {
            title: 'Combustibles',
            url: '/admin/fuels',
            icon: Fuel,
        },
        {
            title: 'Inventario Global',
            url: '/admin/vehicles',
            icon: Car,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin/dashboard">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <div className="px-3 py-4">
                    <p className="px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Administración
                    </p>
                    <SidebarMenu className="gap-1">
                        {menuItems.map((item) => {
                            const active = isUrlActive(item.url);
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        className={active ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </div>

                {/* <div className="px-3 py-2 mt-auto border-t border-sidebar-border">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Volver al Portal">
                                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Volver al Portal</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div> */}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
