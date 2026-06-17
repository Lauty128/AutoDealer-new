import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { 
    Building2, Share2, Image as ImageIcon, Clock, Sparkles, Palette, 
    FileText, Plus, Trash2, Globe, Eye, ShieldAlert
} from 'lucide-react';
import { FormEventHandler, useRef, useEffect, useState } from 'react';

// Form interface
interface StoreService {
    id?: number | null;
    name: string;
    description: string;
    icon?: string;
}

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
    working_hours: Record<string, string> | null;
    map_iframe: string | null;
    meta_title: string | null;
    meta_description: string | null;
    services: StoreService[];
}

interface StoreSelectorItem {
    id: number;
    name: string;
}

interface StoreProps {
    stores: StoreSelectorItem[];
    activeStore: Store | null;
    status?: string;
    message?: string;
}

interface StoreForm {
    id: number;
    name: string;
    slug: string;
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    website: string;
    logo_file: File | null;
    banner_file: File | null;
    primary_color: string;
    secondary_color: string;
    custom_css: string;
    presentation: string;
    working_hours: Record<string, string>;
    map_iframe: string;
    meta_title: string;
    meta_description: string;
    services: StoreService[];
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Concesionario',
        href: '/store/settings',
    },
];

// Rich Text Editor Component
function RichTextEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCmd = (command: string, arg: string = '') => {
        document.execCommand(command, false, arg);
        handleInput();
    };

    return (
        <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
            <div className="flex flex-wrap gap-1 bg-slate-50 dark:bg-zinc-800/80 p-2 border-b border-slate-200 dark:border-zinc-800">
                <button type="button" onClick={() => execCmd('bold')} className="p-1.5 px-3 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200" title="Negrita">B</button>
                <button type="button" onClick={() => execCmd('italic')} className="p-1.5 px-3 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs italic text-slate-800 dark:text-zinc-200" title="Cursiva">I</button>
                <button type="button" onClick={() => execCmd('underline')} className="p-1.5 px-3 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs underline text-slate-800 dark:text-zinc-200" title="Subrayado">U</button>
                <span className="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1"></span>
                <button type="button" onClick={() => execCmd('insertUnorderedList')} className="p-1.5 px-2.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs text-slate-800 dark:text-zinc-200" title="Lista Viñetas">• Lista</button>
                <button type="button" onClick={() => execCmd('formatBlock', '<h2>')} className="p-1.5 px-2.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs text-slate-800 dark:text-zinc-200" title="Título 2">H2</button>
                <button type="button" onClick={() => execCmd('formatBlock', '<h3>')} className="p-1.5 px-2.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs text-slate-800 dark:text-zinc-200" title="Título 3">H3</button>
                <button type="button" onClick={() => execCmd('formatBlock', '<p>')} className="p-1.5 px-2.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs text-slate-800 dark:text-zinc-200" title="Párrafo">P</button>
                <span className="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1"></span>
                <button type="button" onClick={() => execCmd('removeFormat')} className="p-1.5 px-2.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs text-red-500 font-semibold" title="Limpiar Formato">Limpiar</button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="p-4 min-h-[200px] focus:outline-hidden prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-zinc-200 bg-transparent"
                style={{ direction: 'ltr' }}
            />
        </div>
    );
}

export default function StoreSettings({ stores, activeStore, status, message }: StoreProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'social' | 'images' | 'services' | 'hours' | 'design'>('general');
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user.is_superadmin === true || auth.user.is_superadmin === 1;
    
    // Preview states for image uploads
    const [logoPreview, setLogoPreview] = useState<string | null>(activeStore?.logo || null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(activeStore?.banner || null);

    if (!activeStore) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="AutoDealer - Concesionario" />
                <div className="px-6 py-6 max-w-7xl mx-auto">
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-4 rounded-xl text-center">
                        <p className="text-red-700 dark:text-red-400 font-medium">No tienes concesionarios asignados a tu cuenta.</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Default working hours mapping
    const defaultWorkingHours = {
        lunes: '09:00 - 18:00',
        martes: '09:00 - 18:00',
        miercoles: '09:00 - 18:00',
        jueves: '09:00 - 18:00',
        viernes: '09:00 - 18:00',
        sabado: '09:00 - 13:00',
        domingo: 'Cerrado',
        ...(activeStore.working_hours || {})
    };

    const { data, setData, post, errors, processing, recentlySuccessful, reset } = useForm<StoreForm>({
        id: activeStore.id,
        name: activeStore.name || '',
        slug: activeStore.slug || '',
        phone: activeStore.phone || '',
        email: activeStore.email || '',
        address: activeStore.address || '',
        whatsapp: activeStore.whatsapp || '',
        instagram: activeStore.instagram || '',
        facebook: activeStore.facebook || '',
        tiktok: activeStore.tiktok || '',
        website: activeStore.website || '',
        logo_file: null as File | null,
        banner_file: null as File | null,
        primary_color: activeStore.primary_color || '#d8af0d',
        secondary_color: activeStore.secondary_color || '#bfa10b',
        custom_css: activeStore.custom_css || '',
        presentation: activeStore.presentation || '',
        working_hours: defaultWorkingHours,
        map_iframe: activeStore.map_iframe || '',
        meta_title: activeStore.meta_title || '',
        meta_description: activeStore.meta_description || '',
        services: activeStore.services || [],
    });

    // Reset form fields when activeStore changes
    useEffect(() => {
        setLogoPreview(activeStore.logo);
        setBannerPreview(activeStore.banner);
        setData({
            id: activeStore.id,
            name: activeStore.name || '',
            slug: activeStore.slug || '',
            phone: activeStore.phone || '',
            email: activeStore.email || '',
            address: activeStore.address || '',
            whatsapp: activeStore.whatsapp || '',
            instagram: activeStore.instagram || '',
            facebook: activeStore.facebook || '',
            tiktok: activeStore.tiktok || '',
            website: activeStore.website || '',
            logo_file: null,
            banner_file: null,
            primary_color: activeStore.primary_color || '#d8af0d',
            secondary_color: activeStore.secondary_color || '#bfa10b',
            custom_css: activeStore.custom_css || '',
            presentation: activeStore.presentation || '',
            working_hours: {
                lunes: '09:00 - 18:00',
                martes: '09:00 - 18:00',
                miercoles: '09:00 - 18:00',
                jueves: '09:00 - 18:00',
                viernes: '09:00 - 18:00',
                sabado: '09:00 - 13:00',
                domingo: 'Cerrado',
                ...(activeStore.working_hours || {})
            },
            map_iframe: activeStore.map_iframe || '',
            meta_title: activeStore.meta_title || '',
            meta_description: activeStore.meta_description || '',
            services: activeStore.services || [],
        });
    }, [activeStore]);

    const handleStoreChange = (id: number) => {
        router.get(route('store.settings.edit'), { store_id: id });
    };

    // Handle File Changes and set previews
    const handleLogoChange = (file: File | null) => {
        setData('logo_file', file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setLogoPreview(activeStore.logo);
        }
    };

    const handleBannerChange = (file: File | null) => {
        setData('banner_file', file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setBannerPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setBannerPreview(activeStore.banner);
        }
    };

    // Services Manager
    const handleAddService = () => {
        const newService: StoreService = {
            id: -(Date.now()), // Negative temp ID for new item tracking
            name: '',
            description: '',
            icon: 'Sparkles'
        };
        setData('services', [...data.services, newService]);
    };

    const handleRemoveService = (index: number) => {
        const updated = [...data.services];
        updated.splice(index, 1);
        setData('services', updated);
    };

    const handleServiceChange = (index: number, key: keyof StoreService, val: string) => {
        const updated = [...data.services];
        updated[index] = { ...updated[index], [key]: val };
        setData('services', updated);
    };

    // Working Hours Manager
    const handleWorkingHoursChange = (day: string, value: string) => {
        setData('working_hours', {
            ...data.working_hours,
            [day]: value,
        });
    };

    const toggleDayClosed = (day: string, isClosed: boolean) => {
        handleWorkingHoursChange(day, isClosed ? 'Cerrado' : '09:00 - 18:00');
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Since Laravel has issues with files on PUT/PATCH, we use POST
        post(route('store.settings.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AutoDealer - Concesionario" />

            <div className="px-6 py-6 max-w-7xl mx-auto">
                <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
                        <HeadingSmall 
                            title="Datos del Concesionario" 
                            description="Personaliza la información de marca, contacto y apariencia de tu local" 
                        />
                        {isSuperAdmin ? (
                            <div className="flex items-center gap-2">
                                <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs px-3 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                    Modo Administrador (Simulado)
                                </div>
                            </div>
                        ) : (
                            stores.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="store-selector" className="text-xs font-semibold text-slate-500 whitespace-nowrap">Gestionar:</Label>
                                    <select
                                        id="store-selector"
                                        value={data.id}
                                        onChange={(e) => handleStoreChange(Number(e.target.value))}
                                        className="bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs rounded-lg p-2 w-48 font-medium focus:ring-brand focus:border-brand"
                                    >
                                        {stores.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )
                        )}
                    </div>

                    {status === 'success' && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold">
                            {message}
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold">
                            {message}
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-zinc-800 overflow-x-auto gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('general')}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 'general'
                                    ? 'border-brand text-brand'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Building2 className="h-3.5 w-3.5" />
                            General & Contacto
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('social')}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 'social'
                                    ? 'border-brand text-brand'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Share2 className="h-3.5 w-3.5" />
                            Contacto & Redes
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('images')}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 'images'
                                    ? 'border-brand text-brand'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                            }`}
                        >
                            <ImageIcon className="h-3.5 w-3.5" />
                            Imágenes de Marca
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('services')}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 'services'
                                    ? 'border-brand text-brand'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            Servicios Ofrecidos
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('hours')}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 'hours'
                                    ? 'border-brand text-brand'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Clock className="h-3.5 w-3.5" />
                            Horarios de Atención
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('design')}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 'design'
                                    ? 'border-brand text-brand'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Palette className="h-3.5 w-3.5" />
                            Diseño & SEO
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Tab Content 1: General & Contacto */}
                        {activeTab === 'general' && (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre del Concesionario</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        placeholder="Ej: AutoDealer Palermo"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug (URL identificador)</Label>
                                    <div className="relative flex items-center">
                                        <span className="text-xs bg-slate-100 dark:bg-zinc-800 px-3 py-2 border border-r-0 border-slate-300 dark:border-zinc-700 rounded-l-md text-slate-500 font-medium select-none">autodealer.com/</span>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={(e) => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                                            required
                                            className="rounded-l-none"
                                            placeholder="ej-autodealer-palermo"
                                        />
                                    </div>
                                    <InputError message={errors.slug} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Correo Electrónico Comercial</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="ventas@concesionario.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Teléfono de Línea</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+54 11 4567-8901"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Dirección Física</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Av. del Libertador 4500, Palermo, CABA"
                                    />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="presentation">Descripción de Presentación (Texto Enriquecido)</Label>
                                    <RichTextEditor
                                        value={data.presentation}
                                        onChange={(val) => setData('presentation', val)}
                                    />
                                    <InputError message={errors.presentation} />
                                </div>
                            </div>
                        )}

                        {/* Tab Content 2: Redes Sociales */}
                        {activeTab === 'social' && (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="whatsapp" className="flex items-center gap-1">WhatsApp <span className="text-[10px] text-green-500 font-semibold">(Para consultas de stock)</span></Label>
                                    <Input
                                        id="whatsapp"
                                        value={data.whatsapp}
                                        onChange={(e) => setData('whatsapp', e.target.value)}
                                        placeholder="5491134567890 (Solo números con código de país)"
                                    />
                                    <InputError message={errors.whatsapp} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="instagram">Instagram (Nombre de usuario o enlace)</Label>
                                    <Input
                                        id="instagram"
                                        value={data.instagram}
                                        onChange={(e) => setData('instagram', e.target.value)}
                                        placeholder="@mi_concesionaria"
                                    />
                                    <InputError message={errors.instagram} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="facebook">Facebook (Nombre de usuario o enlace)</Label>
                                    <Input
                                        id="facebook"
                                        value={data.facebook}
                                        onChange={(e) => setData('facebook', e.target.value)}
                                        placeholder="facebook.com/mi_concesionaria"
                                    />
                                    <InputError message={errors.facebook} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="tiktok">TikTok (Nombre de usuario)</Label>
                                    <Input
                                        id="tiktok"
                                        value={data.tiktok}
                                        onChange={(e) => setData('tiktok', e.target.value)}
                                        placeholder="@mi_concesionaria"
                                    />
                                    <InputError message={errors.tiktok} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="website">Sitio Web Externo</Label>
                                    <div className="relative flex items-center">
                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="website"
                                            value={data.website}
                                            onChange={(e) => setData('website', e.target.value)}
                                            className="pl-9"
                                            placeholder="https://www.mi-concesionaria.com"
                                        />
                                    </div>
                                    <InputError message={errors.website} />
                                </div>
                            </div>
                        )}

                        {/* Tab Content 3: Imágenes de Marca */}
                        {activeTab === 'images' && (
                            <div className="space-y-6">
                                {/* Logo uploader */}
                                <div className="grid gap-3 p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-800">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Logotipo de la Empresa</h3>
                                        <p className="text-xs text-slate-500">Suba una imagen cuadrada, preferentemente con fondo transparente (Formatos permitidos: PNG, JPG, WEBP. Máximo: 2MB).</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="h-24 w-24 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 shadow-inner">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 w-full space-y-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleLogoChange(e.target.files?.[0] || null)}
                                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand file:text-slate-900 hover:file:bg-brand-hover file:cursor-pointer"
                                            />
                                            {logoPreview !== activeStore.logo && (
                                                <Button type="button" variant="outline" size="sm" onClick={() => handleLogoChange(null)} className="h-8 text-xs">
                                                    Restaurar Original
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <InputError message={errors.logo_file} />
                                </div>

                                {/* Banner uploader */}
                                <div className="grid gap-3 p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-800">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Banner de Cabecera</h3>
                                        <p className="text-xs text-slate-500">Esta imagen se mostrará en la parte superior de tu portal de catálogo (Relación recomendada: 16:9 o 3:1. Máximo: 4MB).</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="aspect-video w-full max-h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center shadow-inner">
                                            {bannerPreview ? (
                                                <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-slate-400">Sin Imagen de Cabecera</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleBannerChange(e.target.files?.[0] || null)}
                                                className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand file:text-slate-900 hover:file:bg-brand-hover file:cursor-pointer"
                                            />
                                            {bannerPreview !== activeStore.banner && (
                                                <Button type="button" variant="outline" size="sm" onClick={() => handleBannerChange(null)} className="h-8 text-xs">
                                                    Restaurar Original
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <InputError message={errors.banner_file} />
                                </div>
                            </div>
                        )}

                        {/* Tab Content 4: Servicios Ofrecidos */}
                        {activeTab === 'services' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Listado de Servicios</h3>
                                        <p className="text-xs text-slate-500">Agrega los servicios oficiales que ofrece el concesionario (ej: Service Oficial, Financiación, Gestoría).</p>
                                    </div>
                                    <Button type="button" onClick={handleAddService} size="sm" className="flex items-center gap-1 text-xs">
                                        <Plus className="h-3.5 w-3.5" /> Agregar
                                    </Button>
                                </div>

                                {data.services.length === 0 ? (
                                    <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                                        No has agregado servicios todavía. Haz clic en "Agregar" para crear uno.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {data.services.map((service, index) => (
                                            <div key={service.id || index} className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800/80 space-y-3 relative group">
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveService(index)}
                                                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-md transition-colors"
                                                    title="Eliminar Servicio"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-10">
                                                    <div className="grid gap-1.5">
                                                        <Label className="text-xs">Nombre del Servicio</Label>
                                                        <Input
                                                            value={service.name}
                                                            onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                                            required
                                                            placeholder="Ej: Financiación Exclusiva"
                                                        />
                                                    </div>
                                                    <div className="grid gap-1.5">
                                                        <Label className="text-xs">Icono (Ej: Sparkles, Landmark, Key, Shield)</Label>
                                                        <Input
                                                            value={service.icon || 'Sparkles'}
                                                            onChange={(e) => handleServiceChange(index, 'icon', e.target.value)}
                                                            placeholder="Sparkles"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid gap-1.5">
                                                    <Label className="text-xs">Descripción breve</Label>
                                                    <textarea
                                                        value={service.description}
                                                        onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                                                        className="w-full bg-transparent border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-lg p-2.5 focus:ring-brand focus:border-brand"
                                                        rows={2}
                                                        placeholder="Financia tu próximo vehículo en hasta 60 cuotas fijas con mínimos requisitos."
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <InputError message={errors.services} />
                            </div>
                        )}

                        {/* Tab Content 5: Horarios de Atención */}
                        {activeTab === 'hours' && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Horarios de Atención Semanales</h3>
                                    <p className="text-xs text-slate-500">Indica el rango de horarios para cada día de la semana o márcalo como cerrado.</p>
                                </div>

                                <div className="bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-200 dark:border-zinc-800 p-4 divide-y divide-slate-200 dark:divide-zinc-800">
                                    {Object.keys(data.working_hours).map((day) => {
                                        const value = data.working_hours[day];
                                        const isClosed = value === 'Cerrado';

                                        return (
                                            <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                                                <Label className="capitalize text-sm font-semibold text-slate-700 dark:text-zinc-300 w-28">
                                                    {day.replace(/_/g, ' ')}
                                                </Label>

                                                <div className="flex items-center gap-4 flex-1">
                                                    <Input
                                                        value={isClosed ? '' : value}
                                                        onChange={(e) => handleWorkingHoursChange(day, e.target.value)}
                                                        disabled={isClosed}
                                                        placeholder="Ej: 09:00 - 18:00"
                                                        className="flex-1 max-w-md h-9 text-xs"
                                                    />

                                                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={isClosed}
                                                            onChange={(e) => toggleDayClosed(day, e.target.checked)}
                                                            className="rounded border-slate-300 dark:border-zinc-700 text-brand focus:ring-brand h-4 w-4"
                                                        />
                                                        <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">Cerrado</span>
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.working_hours} />
                            </div>
                        )}

                        {/* Tab Content 6: Diseño & SEO */}
                        {activeTab === 'design' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="primary_color" className="flex items-center justify-between">
                                            Color Primario 
                                            <span className="text-xs font-mono text-slate-500">{data.primary_color}</span>
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="primary_color"
                                                type="color"
                                                value={data.primary_color}
                                                onChange={(e) => setData('primary_color', e.target.value)}
                                                className="h-10 w-20 rounded border border-slate-300 dark:border-zinc-700 cursor-pointer"
                                            />
                                            <Input
                                                type="text"
                                                value={data.primary_color}
                                                onChange={(e) => setData('primary_color', e.target.value)}
                                                maxLength={7}
                                                className="flex-1 font-mono uppercase"
                                            />
                                        </div>
                                        <InputError message={errors.primary_color} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="secondary_color" className="flex items-center justify-between">
                                            Color Secundario 
                                            <span className="text-xs font-mono text-slate-500">{data.secondary_color}</span>
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="secondary_color"
                                                type="color"
                                                value={data.secondary_color}
                                                onChange={(e) => setData('secondary_color', e.target.value)}
                                                className="h-10 w-20 rounded border border-slate-300 dark:border-zinc-700 cursor-pointer"
                                            />
                                            <Input
                                                type="text"
                                                value={data.secondary_color}
                                                onChange={(e) => setData('secondary_color', e.target.value)}
                                                maxLength={7}
                                                className="flex-1 font-mono uppercase"
                                            />
                                        </div>
                                        <InputError message={errors.secondary_color} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="custom_css">Estilos CSS Personalizados</Label>
                                    <textarea
                                        id="custom_css"
                                        value={data.custom_css}
                                        onChange={(e) => setData('custom_css', e.target.value)}
                                        rows={4}
                                        className="font-mono text-xs w-full bg-transparent border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-lg p-2.5 focus:ring-brand focus:border-brand"
                                        placeholder="/* Modifica el estilo visual de tu portal con clases CSS custom */&#10;.header-custom { background-color: #222; }"
                                    />
                                    <InputError message={errors.custom_css} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="map_iframe">Código Iframe de Google Maps</Label>
                                    <textarea
                                        id="map_iframe"
                                        value={data.map_iframe}
                                        onChange={(e) => setData('map_iframe', e.target.value)}
                                        rows={3}
                                        className="text-xs w-full bg-transparent border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-lg p-2.5 focus:ring-brand focus:border-brand"
                                        placeholder='Pegue el código <iframe> completo copiado desde Google Maps (Compartir > Insertar un mapa)'
                                    />
                                    {data.map_iframe && (
                                        <p className="text-[10px] text-green-500 font-semibold flex items-center gap-1"><Eye className="h-3 w-3" /> Iframe detectado y configurado.</p>
                                    )}
                                    <InputError message={errors.map_iframe} />
                                </div>

                                <div className="border-t border-slate-200 dark:border-zinc-800 pt-4 mt-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Posicionamiento SEO</h3>

                                    <div className="grid gap-4">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="meta_title">Título Meta (SEO Title)</Label>
                                            <Input
                                                id="meta_title"
                                                value={data.meta_title}
                                                onChange={(e) => setData('meta_title', e.target.value)}
                                                placeholder="Ej: Concesionario de Autos Oficiales en Palermo | Stock Completo"
                                            />
                                            <InputError message={errors.meta_title} />
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label htmlFor="meta_description">Meta Descripción (SEO Description)</Label>
                                            <Input
                                                id="meta_description"
                                                value={data.meta_description}
                                                onChange={(e) => setData('meta_description', e.target.value)}
                                                placeholder="Ingresa una breve descripción de tu stock y servicios para los buscadores de Google."
                                            />
                                            <InputError message={errors.meta_description} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 border-t border-slate-200 dark:border-zinc-800 pt-5">
                            <Button disabled={processing} className="px-6">Guardar Cambios</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">Datos guardados con éxito</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
