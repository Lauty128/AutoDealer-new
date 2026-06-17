import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import AdminLayout from '@/layouts/admin-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Appearance() {
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Configuración de apariencia',
            href: isAdmin ? '/admin/settings/appearance' : '/dashboard/settings/appearance',
        },
    ];

    const Layout = isAdmin ? AdminLayout : AppLayout;

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de apariencia" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Configuración de apariencia" description="Actualiza la configuración de apariencia de tu cuenta" />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </Layout>
    );
}
