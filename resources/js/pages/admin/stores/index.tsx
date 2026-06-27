import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/admin/pagination';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Search, Plus, Trash2, Edit2, Landmark, Globe, Phone, Mail, Image as ImageIcon, Sparkles, ShieldAlert, Layers, ExternalLink, Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';
import axios from 'axios';

interface Store {
    id: number;
    name: string;
    slug: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    whatsapp: string | null;
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
    whatsapp_phone_number_id: string | null;
    whatsapp_catalog_id: string | null;
    whatsapp_access_token: string | null;
    whatsapp_business_id: string | null;
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

type FormTab = 'basic' | 'social' | 'appearance' | 'integrations';

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

    // WhatsApp Wizard States
    const [isWizardActive, setIsWizardActive] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [wizardPhoneId, setWizardPhoneId] = useState('');
    const [wizardMethod, setWizardMethod] = useState<'SMS' | 'VOICE'>('SMS');
    const [wizardCode, setWizardCode] = useState('');
    const [wizardPin, setWizardPin] = useState('');
    const [wizardLoading, setWizardLoading] = useState(false);
    const [wizardError, setWizardError] = useState<string | null>(null);
    const [wizardSuccess, setWizardSuccess] = useState<string | null>(null);
    const [isCatalogLoading, setIsCatalogLoading] = useState(false);

    // Form setups
    const createForm = useForm({
        name: '',
        slug: '',
        phone: '',
        email: '',
        address: '',
        whatsapp: '',
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
        whatsapp_phone_number_id: '',
        whatsapp_catalog_id: '',
        whatsapp_access_token: '',
        whatsapp_business_id: '',
    });

    const editForm = useForm({
        id: null as number | null,
        name: '',
        slug: '',
        phone: '',
        email: '',
        address: '',
        whatsapp: '',
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
        whatsapp_phone_number_id: '',
        whatsapp_catalog_id: '',
        whatsapp_access_token: '',
        whatsapp_business_id: '',
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

    const resetWizard = () => {
        setIsWizardActive(false);
        setWizardStep(1);
        setWizardPhoneId('');
        setWizardMethod('SMS');
        setWizardCode('');
        setWizardPin('');
        setWizardLoading(false);
        setWizardError(null);
        setWizardSuccess(null);
    };

    const openEdit = (store: Store) => {
        setSelectedStore(store);
        setActiveTab('basic');
        resetWizard();
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
            whatsapp_phone_number_id: store.whatsapp_phone_number_id || '',
            whatsapp_catalog_id: store.whatsapp_catalog_id || '',
            whatsapp_access_token: store.whatsapp_access_token || '',
            whatsapp_business_id: store.whatsapp_business_id || '',
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

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.data.id) return;
        if (!wizardPhoneId.trim()) {
            setWizardError('El ID del número de teléfono es obligatorio.');
            return;
        }

        setWizardLoading(true);
        setWizardError(null);
        setWizardSuccess(null);

        try {
            const response = await axios.post(`/admin/stores/${editForm.data.id}/whatsapp/request-code`, {
                whatsapp_phone_number_id: wizardPhoneId,
                code_method: wizardMethod,
            });

            if (response.data.status === 'success') {
                setWizardStep(2);
                setWizardSuccess(response.data.message);
            } else {
                setWizardError(response.data.message || 'Error al solicitar el código.');
            }
        } catch (error: any) {
            console.error(error);
            setWizardError(error.response?.data?.message || 'Ocurrió un error al solicitar el código.');
        } finally {
            setWizardLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.data.id) return;
        if (!wizardCode.trim() || wizardCode.length !== 6) {
            setWizardError('El código de verificación debe tener 6 dígitos.');
            return;
        }
        if (!wizardPin.trim() || wizardPin.length !== 6) {
            setWizardError('El PIN 2FA debe tener 6 dígitos.');
            return;
        }

        setWizardLoading(true);
        setWizardError(null);
        setWizardSuccess(null);

        try {
            const response = await axios.post(`/admin/stores/${editForm.data.id}/whatsapp/verify-register`, {
                whatsapp_phone_number_id: wizardPhoneId,
                code: wizardCode,
                pin: wizardPin,
            });

            if (response.data.status === 'success') {
                setWizardSuccess(response.data.message);
                
                // Update form data with the results
                editForm.setData(data => ({
                    ...data,
                    whatsapp_phone_number_id: response.data.whatsapp_phone_number_id || wizardPhoneId,
                    whatsapp_catalog_id: response.data.whatsapp_catalog_id || '',
                }));

                // Reset wizard state after delay
                setTimeout(() => {
                    resetWizard();
                    // Reload page to refresh store in listing
                    router.reload();
                }, 3000);
            } else {
                setWizardError(response.data.message || 'Error al verificar e integrar.');
            }
        } catch (error: any) {
            console.error(error);
            setWizardError(error.response?.data?.message || 'Ocurrió un error al verificar e integrar.');
        } finally {
            setWizardLoading(false);
        }
    };

    const handleAutoCreateCatalog = async () => {
        if (!editForm.data.id) return;
        setIsCatalogLoading(true);
        try {
            const response = await axios.post(`/admin/stores/${editForm.data.id}/whatsapp/create-catalog`);
            if (response.data.status === 'success') {
                editForm.setData('whatsapp_catalog_id', response.data.whatsapp_catalog_id);
            } else {
                alert(response.data.message || 'Error al generar el catálogo.');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Ocurrió un error al generar el catálogo.');
        } finally {
            setIsCatalogLoading(false);
        }
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.data.id) return;

        // Use post method because PUT/PATCH does not support uploading files natively in PHP Laravel multipart forms.
        editForm.post(`/admin/stores/${editForm.data.id}`, {
            onSuccess: () => {
                editForm.reset();
                setIsEditOpen(false);
                resetWizard();
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
                            onClick={() => setActiveTab('integrations')}
                            className={`pb-2 border-b-2 transition-colors ${activeTab === 'integrations' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                        >
                            Integración Meta
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

                        {activeTab === 'integrations' && (
                            <div className="space-y-4">
                                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg border border-emerald-500/20 text-xs flex items-center gap-2">
                                    <Phone className="h-4 w-4 shrink-0" />
                                    <span>Configura la integración de WhatsApp y Catálogos de Meta para este concesionario.</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="whatsapp_phone_number_id">ID del Número de Teléfono (WA)</Label>
                                        <Input
                                            id="whatsapp_phone_number_id"
                                            value={createForm.data.whatsapp_phone_number_id}
                                            onChange={(e) => createForm.setData('whatsapp_phone_number_id', e.target.value)}
                                            placeholder="Ej: 9876543210987"
                                        />
                                        <InputError message={createForm.errors.whatsapp_phone_number_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="whatsapp_catalog_id">ID del Catálogo de WhatsApp</Label>
                                        <Input
                                            id="whatsapp_catalog_id"
                                            value={createForm.data.whatsapp_catalog_id}
                                            onChange={(e) => createForm.setData('whatsapp_catalog_id', e.target.value)}
                                            placeholder="Ej: 55667788990011"
                                        />
                                        <InputError message={createForm.errors.whatsapp_catalog_id} />
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
                            onClick={() => setActiveTab('integrations')}
                            className={`pb-2 border-b-2 transition-colors ${activeTab === 'integrations' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                        >
                            Integración Meta
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

                        {activeTab === 'integrations' && (
                            <div className="space-y-4">
                                <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-4 rounded-lg border border-amber-500/20 text-xs space-y-2">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <ShieldAlert className="h-4 w-4 shrink-0" />
                                        <span>Nueva arquitectura de integración (v19.0+)</span>
                                    </div>
                                    <p className="leading-relaxed">
                                        Para evitar desconectar la aplicación física de WhatsApp Business en el celular del cliente, la vinculación del catálogo se realiza ahora <strong>exclusivamente</strong> mediante Facebook Login (OAuth) con el permiso <code>catalog_management</code>.
                                    </p>
                                    <p className="leading-relaxed">
                                        El cliente puede configurarlo él mismo desde sus Ajustes de Concesionaria. Como administrador, puedes utilizar la función de <strong>Simulación (Impersonate)</strong> para iniciar sesión en su nombre y realizar el proceso.
                                    </p>
                                    <div className="pt-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleImpersonate(editForm.data.id!)}
                                            className="bg-amber-600 hover:bg-amber-700 text-white hover:text-white border-none text-[11px] h-8"
                                        >
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            Iniciar Simulación y Configurar
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-whatsapp_catalog_id">ID del Catálogo de WhatsApp</Label>
                                        <Input
                                            id="edit-whatsapp_catalog_id"
                                            value={editForm.data.whatsapp_catalog_id}
                                            onChange={(e) => editForm.setData('whatsapp_catalog_id', e.target.value)}
                                            placeholder="Ej: 55667788990011"
                                        />
                                        <InputError message={editForm.errors.whatsapp_catalog_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-whatsapp_business_id">ID del Administrador Comercial (Business ID)</Label>
                                        <Input
                                            id="edit-whatsapp_business_id"
                                            value={editForm.data.whatsapp_business_id}
                                            onChange={(e) => editForm.setData('whatsapp_business_id', e.target.value)}
                                            placeholder="Ej: 112233445566"
                                        />
                                        <InputError message={editForm.errors.whatsapp_business_id} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-whatsapp_access_token">Token de Acceso de Usuario Meta (OAuth)</Label>
                                    <Input
                                        id="edit-whatsapp_access_token"
                                        value={editForm.data.whatsapp_access_token}
                                        onChange={(e) => editForm.setData('whatsapp_access_token', e.target.value)}
                                        placeholder="EAAUX..."
                                    />
                                    <InputError message={editForm.errors.whatsapp_access_token} />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editForm.processing || isWizardActive}>
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
