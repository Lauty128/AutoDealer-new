import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/admin/pagination';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Search, Plus, Trash2, Edit2, Landmark, Globe, Phone, Mail, Image as ImageIcon, Sparkles, ShieldAlert, Layers, ExternalLink } from 'lucide-react';
import InputError from '@/components/input-error';

interface Store {
    id: number;
    name: string;
    slug: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    whatsapp: string | null;
    whatsapp_catalog_id: string | null;
    whatsapp_catalog_phone: string | null;
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    website: string | null;
    logo: string | null;
    banner: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    custom_css: string | null;
    presentation: string | null;
    map_iframe: string | null;
    meta_title: string | null;
    meta_description: string | null;
    vehicles_count: number;
}

interface PaginatedStores {
    data: Store[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
}

interface StoresProps {
    stores: PaginatedStores;
    filters: {
        search: string;
    };
    status?: string;
    message?: string;
}

type FormTab = 'basic' | 'social' | 'appearance' | 'whatsapp';

export default function StoresIndex({ stores, filters, status, message }: StoresProps) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Concesionarios', href: '/admin/stores' },
    ];

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState<FormTab>('basic');



    // Dialog states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    // Form setups
    const createForm = useForm({
        name: '',
        slug: '',
        phone: '',
        email: '',
        address: '',
        whatsapp: '',
        whatsapp_catalog_id: '',
        whatsapp_catalog_phone: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        website: '',
        logo_file: null as File | null,
        banner_file: null as File | null,
        primary_color: '#000000',
        secondary_color: '#ffffff',
        presentation: '',
        custom_css: '',
        map_iframe: '',
        meta_title: '',
        meta_description: '',
    });

    const editForm = useForm({
        id: null as number | null,
        name: '',
        slug: '',
        phone: '',
        email: '',
        address: '',
        whatsapp: '',
        whatsapp_catalog_id: '',
        whatsapp_catalog_phone: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        website: '',
        logo_file: null as File | null,
        banner_file: null as File | null,
        logo_url: null as string | null,
        banner_url: null as string | null,
        primary_color: '#000000',
        secondary_color: '#ffffff',
        presentation: '',
        custom_css: '',
        map_iframe: '',
        meta_title: '',
        meta_description: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/stores', { search: searchTerm }, { preserveState: true });
    };

    const handleImpersonate = (storeId: number) => {
        router.post(`/admin/stores/${storeId}/impersonate`);
    };

    const generateSlug = (name: string, form: 'create' | 'edit') => {
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
            .replace(/\s+/g, '-') // Collapse whitespace
            .replace(/-+/g, '-'); // Collapse dashes

        if (form === 'create') {
            createForm.setData(data => ({ ...data, slug, meta_title: `${name} | AutoDealer` }));
        } else {
            editForm.setData(data => ({ ...data, slug, meta_title: `${name} | AutoDealer` }));
        }
    };

    const openEdit = (store: Store) => {
        setSelectedStore(store);
        setActiveTab('basic');
        editForm.setData({
            id: store.id,
            name: store.name,
            slug: store.slug,
            phone: store.phone || '',
            email: store.email || '',
            address: store.address || '',
            whatsapp: store.whatsapp || '',
            instagram: store.instagram || '',
            facebook: store.facebook || '',
            tiktok: store.tiktok || '',
            website: store.website || '',
            logo_file: null,
            banner_file: null,
            logo_url: store.logo,
            banner_url: store.banner,
            primary_color: store.primary_color || '#000000',
            secondary_color: store.secondary_color || '#ffffff',
            presentation: store.presentation || '',
            custom_css: store.custom_css || '',
            map_iframe: store.map_iframe || '',
            meta_title: store.meta_title || '',
            meta_description: store.meta_description || '',
            whatsapp_catalog_id: store.whatsapp_catalog_id || '',
            whatsapp_catalog_phone: store.whatsapp_catalog_phone || '',
        });
        setIsEditOpen(true);
    };

    const openDelete = (store: Store) => {
        setSelectedStore(store);
        setIsDeleteOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/stores', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.data.id) return;

        // Use post method because PUT/PATCH does not support uploading files natively in PHP Laravel multipart forms.
        editForm.post(`/admin/stores/${editForm.data.id}`, {
            onSuccess: () => {
                editForm.reset();
                setIsEditOpen(false);
            },
        });
    };

    const submitDelete = () => {
        if (!selectedStore) return;
        router.delete(`/admin/stores/${selectedStore.id}`, {
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Administración de Concesionarios" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Concesionarios</h2>
                        <p className="text-muted-foreground">
                            Administra los concesionarios (tiendas) registrados en la plataforma.
                        </p>
                    </div>
                    <Button onClick={() => { createForm.reset(); setActiveTab('basic'); setIsCreateOpen(true); }} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Concesionario
                    </Button>
                </div>

                {(status === 'success' || message) && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
                        {message || 'Operación completada con éxito.'}
                    </div>
                )}

                <Card>
                    <CardHeader className="p-4 sm:p-6 pb-2">
                        <CardTitle className="text-lg">Buscar</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Buscar por nombre, slug, email..."
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
                                    <th className="p-4">Logo</th>
                                    <th className="p-4">Nombre</th>
                                    <th className="p-4">Slug / URL</th>
                                    <th className="p-4">Contacto</th>
                                    <th className="p-4">Vehículos</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stores.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            No se encontraron concesionarios.
                                        </td>
                                    </tr>
                                ) : (
                                    stores.data.map((store) => (
                                        <tr key={store.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                {store.logo ? (
                                                    <img src={store.logo} alt={store.name} className="h-8 w-8 rounded-md object-cover border bg-white" />
                                                ) : (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground border">
                                                        <Landmark className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 font-semibold">{store.name}</td>
                                            <td className="p-4 text-muted-foreground">
                                                <span className="font-mono text-xs bg-muted border px-1.5 py-0.5 rounded">
                                                    /{store.slug}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
                                                    {store.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {store.email}</span>}
                                                    {store.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {store.phone}</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium">
                                                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-0.5 rounded text-xs">
                                                    {store.vehicles_count} autos
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleImpersonate(store.id)} className="h-8 w-8" title="Ingresar como dueño">
                                                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-indigo-600" />
                                                        <span className="sr-only">Ingresar como dueño</span>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8" title="Plantillas de campos">
                                                        <Link href={`/admin/stores/${store.id}/templates`}>
                                                            <Layers className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                            <span className="sr-only">Plantillas</span>
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(store)} className="h-8 w-8">
                                                        <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                        <span className="sr-only">Editar</span>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openDelete(store)} className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10">
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
                    <Pagination links={stores.links} />
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>Crear Concesionario</DialogTitle>
                        <DialogDescription>Llena la información del nuevo concesionario para agregarlo al sistema.</DialogDescription>
                    </DialogHeader>

                    {/* Tab Navigation */}
                    <div className="flex border-b gap-4 mb-4 text-sm font-medium">
                        <button
                            type="button"
                            onClick={() => setActiveTab('basic')}
                            className={`pb-2 border-b-2 transition-colors ${activeTab === 'basic' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                        >
                            Información Básica
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('social')}
                            className={`pb-2 border-b-2 transition-colors ${activeTab === 'social' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                        >
                            Contacto y Redes
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('appearance')}
                            className={`pb-2 border-b-2 transition-colors ${activeTab === 'appearance' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                        >
                            Apariencia y SEO
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('whatsapp')}
                            className={`pb-2 border-b-2 transition-colors ${activeTab === 'whatsapp' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                        >
                            Catálogo WhatsApp
                        </button>
                    </div>

                    <form onSubmit={submitCreate} className="space-y-4">
                        {activeTab === 'basic' && (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre del Concesionario</Label>
                                    <Input
                                        id="name"
                                        value={createForm.data.name}
                                        onChange={(e) => {
                                            createForm.setData('name', e.target.value);
                                            generateSlug(e.target.value, 'create');
                                        }}
                                        required
                                    />
                                    <InputError message={createForm.errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug (URL)</Label>
                                    <div className="flex items-center">
                                        <span className="bg-muted border border-r-0 rounded-l-md px-3 py-2 text-xs font-mono text-muted-foreground">/catalogo/</span>
                                        <Input
                                            id="slug"
                                            value={createForm.data.slug}
                                            onChange={(e) => createForm.setData('slug', e.target.value)}
                                            className="rounded-l-none"
                                            required
                                        />
                                    </div>
                                    <InputError message={createForm.errors.slug} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="presentation">Presentación / Descripción</Label>
                                    <textarea
                                        id="presentation"
                                        value={createForm.data.presentation}
                                        onChange={(e) => createForm.setData('presentation', e.target.value)}
                                        placeholder="Descripción corta que se mostrará en el catálogo..."
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <InputError message={createForm.errors.presentation} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Dirección Física</Label>
                                    <Input
                                        id="address"
                                        value={createForm.data.address}
                                        onChange={(e) => createForm.setData('address', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.address} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="map_iframe">Iframe de Google Maps (URL / HTML)</Label>
                                    <Input
                                        id="map_iframe"
                                        value={createForm.data.map_iframe}
                                        onChange={(e) => createForm.setData('map_iframe', e.target.value)}
                                        placeholder="Embed map URL o HTML..."
                                    />
                                    <InputError message={createForm.errors.map_iframe} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'social' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email del Concesionario</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                        />
                                        <InputError message={createForm.errors.email} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Teléfono Fijo / Celular</Label>
                                        <Input
                                            id="phone"
                                            value={createForm.data.phone}
                                            onChange={(e) => createForm.setData('phone', e.target.value)}
                                        />
                                        <InputError message={createForm.errors.phone} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="whatsapp">WhatsApp (Sólo números, ej: 541112345678)</Label>
                                        <Input
                                            id="whatsapp"
                                            value={createForm.data.whatsapp}
                                            onChange={(e) => createForm.setData('whatsapp', e.target.value)}
                                        />
                                        <InputError message={createForm.errors.whatsapp} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="website">Sitio Web (Opcional)</Label>
                                        <Input
                                            id="website"
                                            type="url"
                                            value={createForm.data.website}
                                            onChange={(e) => createForm.setData('website', e.target.value)}
                                            placeholder="https://..."
                                        />
                                        <InputError message={createForm.errors.website} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="instagram">Perfil Instagram (URL)</Label>
                                    <Input
                                        id="instagram"
                                        value={createForm.data.instagram}
                                        onChange={(e) => createForm.setData('instagram', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.instagram} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="facebook">Perfil Facebook (URL)</Label>
                                        <Input
                                            id="facebook"
                                            value={createForm.data.facebook}
                                            onChange={(e) => createForm.setData('facebook', e.target.value)}
                                        />
                                        <InputError message={createForm.errors.facebook} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tiktok">Perfil TikTok (URL)</Label>
                                        <Input
                                            id="tiktok"
                                            value={createForm.data.tiktok}
                                            onChange={(e) => createForm.setData('tiktok', e.target.value)}
                                        />
                                        <InputError message={createForm.errors.tiktok} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="logo_file" className="cursor-pointer">Logo Corporativo</Label>
                                        <Input
                                            id="logo_file"
                                            type="file"
                                            onChange={(e) => createForm.setData('logo_file', e.target.files?.[0] || null)}
                                            accept="image/*"
                                            className="cursor-pointer bg-background"
                                        />
                                        <InputError message={createForm.errors.logo_file} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="banner_file" className="cursor-pointer">Banner Principal</Label>
                                        <Input
                                            id="banner_file"
                                            type="file"
                                            onChange={(e) => createForm.setData('banner_file', e.target.files?.[0] || null)}
                                            accept="image/*"
                                            className="cursor-pointer bg-background"
                                        />
                                        <InputError message={createForm.errors.banner_file} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="primary_color">Color Primario (Header/Botones)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="primary_color"
                                                type="color"
                                                value={createForm.data.primary_color || ''}
                                                onChange={(e) => createForm.setData('primary_color', e.target.value)}
                                                className="w-12 h-10 p-1 bg-background"
                                            />
                                            <Input
                                                type="text"
                                                value={createForm.data.primary_color || ''}
                                                onChange={(e) => createForm.setData('primary_color', e.target.value)}
                                                className="flex-1 bg-background"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="secondary_color">Color Secundario (Destacados)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="secondary_color"
                                                type="color"
                                                value={createForm.data.secondary_color || ''}
                                                onChange={(e) => createForm.setData('secondary_color', e.target.value)}
                                                className="w-12 h-10 p-1 bg-background"
                                            />
                                            <Input
                                                type="text"
                                                value={createForm.data.secondary_color || ''}
                                                onChange={(e) => createForm.setData('secondary_color', e.target.value)}
                                                className="flex-1 bg-background"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-3 mt-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Metadatos SEO</p>
                                    <div className="grid gap-2">
                                        <Label htmlFor="meta_title">Título Meta</Label>
                                        <Input
                                            id="meta_title"
                                            value={createForm.data.meta_title}
                                            onChange={(e) => createForm.setData('meta_title', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2 mt-2">
                                        <Label htmlFor="meta_description">Descripción Meta</Label>
                                        <Input
                                            id="meta_description"
                                            value={createForm.data.meta_description}
                                            onChange={(e) => createForm.setData('meta_description', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'whatsapp' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="create_whatsapp_catalog_id">WhatsApp Catalog ID</Label>
                                        <Input
                                            id="create_whatsapp_catalog_id"
                                            value={createForm.data.whatsapp_catalog_id}
                                            onChange={(e) => createForm.setData('whatsapp_catalog_id', e.target.value)}
                                            placeholder="Ingresa el ID del Catálogo de Meta..."
                                        />
                                        <InputError message={createForm.errors.whatsapp_catalog_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="create_whatsapp_catalog_phone">Teléfono del Catálogo</Label>
                                        <Input
                                            id="create_whatsapp_catalog_phone"
                                            value={createForm.data.whatsapp_catalog_phone}
                                            onChange={(e) => createForm.setData('whatsapp_catalog_phone', e.target.value)}
                                            placeholder="Ej: 5491112345678"
                                        />
                                        <InputError message={createForm.errors.whatsapp_catalog_phone} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Guardar Concesionario
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle>Editar Concesionario</DialogTitle>
                        <DialogDescription>Edita la configuración del concesionario seleccionado.</DialogDescription>
                    </DialogHeader>

                    {/* Tab Navigation */}
                    <div className="flex border-b gap-4 mb-4 text-sm font-medium">
                        <button
                            type="button"
                            onClick={() => setActiveTab('basic')}
                            className={`pb-2 border-b-2 transition-colors ${activeTab === 'basic' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                        >
                            Información Básica
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('social')}
                            className={`pb-2 border-b-2 transition-colors ${activeTab === 'social' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                        >
                            Contacto y Redes
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('appearance')}
                            className={`pb-2 border-b-2 transition-colors ${activeTab === 'appearance' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                        >
                            Apariencia y SEO
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('whatsapp')}
                            className={`pb-2 border-b-2 transition-colors ${activeTab === 'whatsapp' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                        >
                            Catálogo WhatsApp
                        </button>
                    </div>

                    <form onSubmit={submitEdit} className="space-y-4">
                        {activeTab === 'basic' && (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Nombre del Concesionario</Label>
                                    <Input
                                        id="edit-name"
                                        value={editForm.data.name}
                                        onChange={(e) => {
                                            editForm.setData('name', e.target.value);
                                            generateSlug(e.target.value, 'edit');
                                        }}
                                        required
                                    />
                                    <InputError message={editForm.errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-slug">Slug (URL)</Label>
                                    <div className="flex items-center">
                                        <span className="bg-muted border border-r-0 rounded-l-md px-3 py-2 text-xs font-mono text-muted-foreground">/catalogo/</span>
                                        <Input
                                            id="edit-slug"
                                            value={editForm.data.slug}
                                            onChange={(e) => editForm.setData('slug', e.target.value)}
                                            className="rounded-l-none"
                                            required
                                        />
                                    </div>
                                    <InputError message={editForm.errors.slug} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-presentation">Presentación / Descripción</Label>
                                    <textarea
                                        id="edit-presentation"
                                        value={editForm.data.presentation}
                                        onChange={(e) => editForm.setData('presentation', e.target.value)}
                                        placeholder="Descripción corta que se mostrará en el catálogo..."
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <InputError message={editForm.errors.presentation} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-address">Dirección Física</Label>
                                    <Input
                                        id="edit-address"
                                        value={editForm.data.address}
                                        onChange={(e) => editForm.setData('address', e.target.value)}
                                    />
                                    <InputError message={editForm.errors.address} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-map_iframe">Iframe de Google Maps (URL o HTML)</Label>
                                    <Input
                                        id="edit-map_iframe"
                                        value={editForm.data.map_iframe}
                                        onChange={(e) => editForm.setData('map_iframe', e.target.value)}
                                    />
                                    <InputError message={editForm.errors.map_iframe} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'social' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-email">Email del Concesionario</Label>
                                        <Input
                                            id="edit-email"
                                            type="email"
                                            value={editForm.data.email}
                                            onChange={(e) => editForm.setData('email', e.target.value)}
                                        />
                                        <InputError message={editForm.errors.email} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-phone">Teléfono Fijo / Celular</Label>
                                        <Input
                                            id="edit-phone"
                                            value={editForm.data.phone}
                                            onChange={(e) => editForm.setData('phone', e.target.value)}
                                        />
                                        <InputError message={editForm.errors.phone} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-whatsapp">WhatsApp (Sólo números, ej: 541112345678)</Label>
                                        <Input
                                            id="edit-whatsapp"
                                            value={editForm.data.whatsapp}
                                            onChange={(e) => editForm.setData('whatsapp', e.target.value)}
                                        />
                                        <InputError message={editForm.errors.whatsapp} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-website">Sitio Web (Opcional)</Label>
                                        <Input
                                            id="edit-website"
                                            type="url"
                                            value={editForm.data.website}
                                            onChange={(e) => editForm.setData('website', e.target.value)}
                                            placeholder="https://..."
                                        />
                                        <InputError message={editForm.errors.website} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-instagram">Perfil Instagram (URL)</Label>
                                    <Input
                                        id="edit-instagram"
                                        value={editForm.data.instagram}
                                        onChange={(e) => editForm.setData('instagram', e.target.value)}
                                    />
                                    <InputError message={editForm.errors.instagram} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-facebook">Perfil Facebook (URL)</Label>
                                        <Input
                                            id="edit-facebook"
                                            value={editForm.data.facebook}
                                            onChange={(e) => editForm.setData('facebook', e.target.value)}
                                        />
                                        <InputError message={editForm.errors.facebook} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-tiktok">Perfil TikTok (URL)</Label>
                                        <Input
                                            id="edit-tiktok"
                                            value={editForm.data.tiktok}
                                            onChange={(e) => editForm.setData('tiktok', e.target.value)}
                                        />
                                        <InputError message={editForm.errors.tiktok} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-logo_file" className="cursor-pointer">Cambiar Logo</Label>
                                        <Input
                                            id="edit-logo_file"
                                            type="file"
                                            onChange={(e) => editForm.setData('logo_file', e.target.files?.[0] || null)}
                                            accept="image/*"
                                            className="cursor-pointer bg-background"
                                        />
                                        <InputError message={editForm.errors.logo_file} />
                                        {editForm.data.logo_url && (
                                            <div className="mt-1 flex items-center gap-2">
                                                <img src={editForm.data.logo_url} alt="Logo actual" className="h-10 w-10 rounded border object-cover bg-white" />
                                                <span className="text-xs text-muted-foreground">Logo actual</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-banner_file" className="cursor-pointer">Cambiar Banner</Label>
                                        <Input
                                            id="edit-banner_file"
                                            type="file"
                                            onChange={(e) => editForm.setData('banner_file', e.target.files?.[0] || null)}
                                            accept="image/*"
                                            className="cursor-pointer bg-background"
                                        />
                                        <InputError message={editForm.errors.banner_file} />
                                        {editForm.data.banner_url && (
                                            <div className="mt-1 flex items-center gap-2">
                                                <img src={editForm.data.banner_url} alt="Banner actual" className="h-10 w-20 rounded border object-cover bg-white" />
                                                <span className="text-xs text-muted-foreground">Banner actual</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-primary_color">Color Primario</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="edit-primary_color"
                                                type="color"
                                                value={editForm.data.primary_color || ''}
                                                onChange={(e) => editForm.setData('primary_color', e.target.value)}
                                                className="w-12 h-10 p-1 bg-background"
                                            />
                                            <Input
                                                type="text"
                                                value={editForm.data.primary_color || ''}
                                                onChange={(e) => editForm.setData('primary_color', e.target.value)}
                                                className="flex-1 bg-background"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-secondary_color">Color Secundario</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="edit-secondary_color"
                                                type="color"
                                                value={editForm.data.secondary_color || ''}
                                                onChange={(e) => editForm.setData('secondary_color', e.target.value)}
                                                className="w-12 h-10 p-1 bg-background"
                                            />
                                            <Input
                                                type="text"
                                                value={editForm.data.secondary_color || ''}
                                                onChange={(e) => editForm.setData('secondary_color', e.target.value)}
                                                className="flex-1 bg-background"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-3 mt-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Metadatos SEO</p>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-meta_title">Título Meta</Label>
                                        <Input
                                            id="edit-meta_title"
                                            value={editForm.data.meta_title}
                                            onChange={(e) => editForm.setData('meta_title', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2 mt-2">
                                        <Label htmlFor="edit-meta_description">Descripción Meta</Label>
                                        <Input
                                            id="edit-meta_description"
                                            value={editForm.data.meta_description}
                                            onChange={(e) => editForm.setData('meta_description', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'whatsapp' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_whatsapp_catalog_id">WhatsApp Catalog ID</Label>
                                        <Input
                                            id="edit_whatsapp_catalog_id"
                                            value={editForm.data.whatsapp_catalog_id}
                                            onChange={(e) => editForm.setData('whatsapp_catalog_id', e.target.value)}
                                            placeholder="Ingresa el ID del Catálogo de Meta..."
                                        />
                                        <InputError message={editForm.errors.whatsapp_catalog_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_whatsapp_catalog_phone">Teléfono del Catálogo</Label>
                                        <Input
                                            id="edit_whatsapp_catalog_phone"
                                            value={editForm.data.whatsapp_catalog_phone}
                                            onChange={(e) => editForm.setData('whatsapp_catalog_phone', e.target.value)}
                                            placeholder="Ej: 5491112345678"
                                        />
                                        <InputError message={editForm.errors.whatsapp_catalog_phone} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
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
                            ¿Estás seguro de que deseas eliminar el concesionario <strong>{selectedStore?.name}</strong>?
                            Esto eliminará permanentemente la tienda, sus catálogos, servicios y registros asociados. Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={submitDelete}>
                            Eliminar Concesionario
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
