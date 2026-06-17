import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { 
    Plus, Trash2, ShieldAlert, Award, Layers, Flame, Check, Sparkles, 
    Pencil, Building2, Users, Mail, Phone, MapPin, Shield, UserPlus, Key
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface VehicleMark {
    id: number;
    name: string;
    slug: string;
}

interface VehicleType {
    id: number;
    name: string;
    slug: string;
}

interface VehicleFuel {
    id: number;
    name: string;
}

interface TemplateField {
    id: number;
    vehicle_type_id: number;
    label: string;
    type: 'text' | 'number' | 'select';
    options: string[] | null;
    default_value: string | null;
}

interface Store {
    id: number;
    name: string;
    slug: string;
    phone: string | null;
    email: string | null;
    address: string | null;
}

interface UserStoreRelation {
    id: number;
    name: string;
    pivot: {
        role: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    is_superadmin: boolean | number;
    stores: UserStoreRelation[];
}

interface AdminProps {
    marks: VehicleMark[];
    types: VehicleType[];
    fuels: VehicleFuel[];
    templates: TemplateField[];
    stores: Store[];
    users: User[];
    status?: string;
    message?: string;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin Global', href: '/settings/admin' },
];

export default function Admin({ 
    marks, 
    types, 
    fuels, 
    templates, 
    stores, 
    users, 
    status, 
    message 
}: AdminProps) {
    const { auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;

    const [activeTab, setActiveTab] = useState<'stores' | 'users' | 'marks' | 'types' | 'fuels' | 'templates'>('stores');

    // Modals Control
    const [isOpenStoreModal, setIsOpenStoreModal] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);

    const [isOpenUserModal, setIsOpenUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Param Modals (Editing Marks, Types, Fuels inline)
    const [editingParamId, setEditingParamId] = useState<number | null>(null);
    const [editParamName, setEditParamName] = useState('');

    // Local form options helpers
    const [newOptionVal, setNewOptionVal] = useState('');
    const [assocStoreId, setAssocStoreId] = useState<string>('');
    const [assocRole, setAssocRole] = useState<string>('editor');

    // Forms
    const markForm = useForm({ name: '' });
    const typeForm = useForm({ name: '' });
    const fuelForm = useForm({ name: '' });
    
    const templateForm = useForm({
        vehicle_type_id: types.length > 0 ? String(types[0].id) : '',
        label: '',
        type: 'text',
        options: [] as string[],
        default_value: '',
    });

    const storeForm = useForm({
        name: '',
        slug: '',
        phone: '',
        email: '',
        address: '',
    });

    const userForm = useForm({
        name: '',
        email: '',
        password: '',
        is_superadmin: false,
        stores: [] as { store_id: number; role: string }[],
    });

    // --- STORE CRUD ACTIONS ---
    const openCreateStoreModal = () => {
        setEditingStore(null);
        storeForm.setData({
            name: '',
            slug: '',
            phone: '',
            email: '',
            address: '',
        });
        storeForm.clearErrors();
        setIsOpenStoreModal(true);
    };

    const openEditStoreModal = (store: Store) => {
        setEditingStore(store);
        storeForm.setData({
            name: store.name,
            slug: store.slug,
            phone: store.phone || '',
            email: store.email || '',
            address: store.address || '',
        });
        storeForm.clearErrors();
        setIsOpenStoreModal(true);
    };

    const handleStoreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingStore) {
            storeForm.put(route('settings.admin.stores.update', editingStore.id), {
                onSuccess: () => {
                    setIsOpenStoreModal(false);
                    storeForm.reset();
                }
            });
        } else {
            storeForm.post(route('settings.admin.stores.store'), {
                onSuccess: () => {
                    setIsOpenStoreModal(false);
                    storeForm.reset();
                }
            });
        }
    };

    const handleDeleteStore = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este concesionario? Se borrarán todos sus vehículos, servicios y asociaciones de usuarios de forma permanente.')) {
            router.delete(route('settings.admin.stores.destroy', id));
        }
    };

    const generateStoreSlug = (nameVal: string) => {
        return nameVal
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    // --- USER CRUD ACTIONS ---
    const openCreateUserModal = () => {
        setEditingUser(null);
        userForm.setData({
            name: '',
            email: '',
            password: '',
            is_superadmin: false,
            stores: [],
        });
        setAssocStoreId('');
        setAssocRole('editor');
        userForm.clearErrors();
        setIsOpenUserModal(true);
    };

    const openEditUserModal = (user: User) => {
        setEditingUser(user);
        
        // Map user store relations to form state
        const mappedStores = user.stores.map(s => ({
            store_id: s.id,
            role: s.pivot.role,
        }));

        userForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            is_superadmin: user.is_superadmin === true || user.is_superadmin === 1,
            stores: mappedStores,
        });
        setAssocStoreId('');
        setAssocRole('editor');
        userForm.clearErrors();
        setIsOpenUserModal(true);
    };

    const handleUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            userForm.put(route('settings.admin.users.update', editingUser.id), {
                onSuccess: () => {
                    setIsOpenUserModal(false);
                    userForm.reset();
                }
            });
        } else {
            userForm.post(route('settings.admin.users.store'), {
                onSuccess: () => {
                    setIsOpenUserModal(false);
                    userForm.reset();
                }
            });
        }
    };

    const handleDeleteUser = (id: number) => {
        if (id === currentUserId) {
            alert('No puedes eliminar tu propio usuario de administrador.');
            return;
        }
        if (confirm('¿Estás seguro de eliminar este usuario? Perderá acceso a todos los concesionarios.')) {
            router.delete(route('settings.admin.users.destroy', id));
        }
    };

    const handleAddStoreAssociation = () => {
        if (!assocStoreId) return;
        
        const storeIdNum = Number(assocStoreId);
        
        // Check if already associated in local form state
        if (userForm.data.stores.some(s => s.store_id === storeIdNum)) {
            alert('Este concesionario ya está en la lista de asociaciones.');
            return;
        }

        userForm.setData('stores', [
            ...userForm.data.stores,
            { store_id: storeIdNum, role: assocRole }
        ]);

        setAssocStoreId('');
        setAssocRole('editor');
    };

    const handleRemoveStoreAssociation = (storeId: number) => {
        userForm.setData('stores', userForm.data.stores.filter(s => s.store_id !== storeId));
    };

    // --- PARAM CRUD ACTIONS (Marks, Types, Fuels) ---
    const handleCreateMark = (e: React.FormEvent) => {
        e.preventDefault();
        markForm.post(route('settings.admin.marks.store'), {
            onSuccess: () => markForm.reset()
        });
    };

    const handleCreateType = (e: React.FormEvent) => {
        e.preventDefault();
        typeForm.post(route('settings.admin.types.store'), {
            onSuccess: () => typeForm.reset()
        });
    };

    const handleCreateFuel = (e: React.FormEvent) => {
        e.preventDefault();
        fuelForm.post(route('settings.admin.fuels.store'), {
            onSuccess: () => fuelForm.reset()
        });
    };

    const handleDeleteParam = (resource: 'marks' | 'types' | 'fuels', id: number) => {
        if (confirm('¿Estás seguro de eliminar este elemento? Podría afectar a vehículos o concesionarios existentes.')) {
            router.delete(route(`settings.admin.${resource}.destroy`, id));
        }
    };

    const startEditingParam = (id: number, name: string) => {
        setEditingParamId(id);
        setEditParamName(name);
    };

    const handleUpdateParam = (resource: 'marks' | 'types' | 'fuels', id: number) => {
        if (!editParamName.trim()) return;
        router.put(route(`settings.admin.${resource}.update`, id), {
            name: editParamName
        }, {
            onSuccess: () => {
                setEditingParamId(null);
                setEditParamName('');
            }
        });
    };

    // --- TEMPLATES ACTIONS ---
    const handleCreateTemplate = (e: React.FormEvent) => {
        e.preventDefault();
        templateForm.post(route('settings.admin.templates.store'), {
            onSuccess: () => {
                templateForm.reset('label', 'default_value');
                templateForm.setData('options', []);
            }
        });
    };

    const handleDeleteTemplate = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este campo global? Afectará a nuevos concesionarios.')) {
            router.delete(route('settings.admin.templates.destroy', id));
        }
    };

    const handleAddTemplateOption = () => {
        if (newOptionVal.trim() && !templateForm.data.options.includes(newOptionVal.trim())) {
            templateForm.setData('options', [...templateForm.data.options, newOptionVal.trim()]);
            setNewOptionVal('');
        }
    };

    const handleRemoveTemplateOption = (opt: string) => {
        templateForm.setData('options', templateForm.data.options.filter(o => o !== opt));
    };

    const formatLabel = (lbl: string) => {
        return lbl
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AutoDealer - Admin Global" />

            <div className="px-6 py-6 max-w-7xl mx-auto">
                <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-indigo-500" />
                                Panel de Administrador Global
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-zinc-400">
                                Administra los concesionarios del SaaS, cuentas de usuarios, combustibles, marcas, tipos y plantillas del sistema.
                            </p>
                        </div>
                        
                        {/* Quick action actions */}
                        <div className="flex gap-2">
                            {activeTab === 'stores' && (
                                <Button onClick={openCreateStoreModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5">
                                    <Building2 className="h-4 w-4" />
                                    Crear Concesionario
                                </Button>
                            )}
                            {activeTab === 'users' && (
                                <Button onClick={openCreateUserModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5">
                                    <UserPlus className="h-4 w-4" />
                                    Crear Usuario
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {status === 'success' && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-lg text-sm">
                            {message}
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-lg text-sm">
                            {message}
                        </div>
                    )}

                    {/* Tabs Navigation */}
                    <div className="flex border-b border-slate-200 dark:border-zinc-800 overflow-x-auto gap-2">
                        <button
                            onClick={() => setActiveTab('stores')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === 'stores'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Building2 className="h-4 w-4" />
                            Concesionarios ({stores.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === 'users'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Users className="h-4 w-4" />
                            Usuarios ({users.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('marks')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === 'marks'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Award className="h-4 w-4" />
                            Marcas ({marks.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('types')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === 'types'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Layers className="h-4 w-4" />
                            Tipos ({types.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('fuels')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === 'fuels'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Flame className="h-4 w-4" />
                            Combustibles ({fuels.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                activeTab === 'templates'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Sparkles className="h-4 w-4" />
                            Plantillas del Sistema ({templates.length})
                        </button>
                    </div>

                    {/* Tab 0a: CONCESIONARIOS */}
                    {activeTab === 'stores' && (
                        <div className="space-y-4">
                            {stores.length === 0 ? (
                                <p className="text-sm text-slate-400 italic text-center py-12">No hay concesionarios cargados en el sistema.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {stores.map(s => (
                                        <Card key={s.id} className="border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow transition-shadow">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                                                    <Building2 className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                                                    {s.name}
                                                </CardTitle>
                                                <CardDescription className="text-xs font-mono font-semibold text-slate-400 dark:text-zinc-500 select-all">
                                                    slug: {s.slug}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-2 text-xs text-slate-600 dark:text-zinc-400 pb-4">
                                                {s.email && (
                                                    <p className="flex items-center gap-1.5 truncate">
                                                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                        {s.email}
                                                    </p>
                                                )}
                                                {s.phone && (
                                                    <p className="flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                        {s.phone}
                                                    </p>
                                                )}
                                                {s.address && (
                                                    <p className="flex items-center gap-1.5 truncate">
                                                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                        {s.address}
                                                    </p>
                                                )}
                                            </CardContent>
                                            <CardFooter className="border-t border-slate-100 dark:border-zinc-800 pt-3 flex justify-between items-center text-xs">
                                                <a 
                                                    href={`/catalogo/${s.slug}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                                                >
                                                    Ver Showroom →
                                                </a>
                                                <div className="flex gap-2">
                                                    <Button size="icon" variant="ghost" onClick={() => openEditStoreModal(s)} className="text-slate-400 hover:text-indigo-600 h-8 w-8">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleDeleteStore(s.id)} className="text-slate-400 hover:text-red-500 h-8 w-8">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 0b: USUARIOS */}
                    {activeTab === 'users' && (
                        <div className="space-y-4">
                            {users.length === 0 ? (
                                <p className="text-sm text-slate-400 italic text-center py-12">No hay usuarios cargados en el sistema.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {users.map(u => (
                                        <Card key={u.id} className="border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <CardTitle className="text-base font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                                                            <Users className="h-4.5 w-4.5 text-indigo-500" />
                                                            {u.name}
                                                        </CardTitle>
                                                        {u.is_superadmin ? (
                                                            <span className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                                                                <Shield className="h-3 w-3" />
                                                                Admin
                                                            </span>
                                                        ) : (
                                                            <span className="bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                                                SaaS User
                                                            </span>
                                                        )}
                                                    </div>
                                                    <CardDescription className="text-xs truncate">{u.email}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-2 pb-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">Concesionarios asociados</p>
                                                        {u.stores && u.stores.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {u.stores.map(us => (
                                                                    <span key={us.id} className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded">
                                                                        {us.name} <span className="text-indigo-500 font-semibold uppercase text-[8px] ml-0.5">({us.pivot.role})</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-[10px] text-slate-400 italic">Sin concesionarios asociados</p>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </div>
                                            <CardFooter className="border-t border-slate-100 dark:border-zinc-800 pt-3 flex justify-end gap-1 text-xs">
                                                <Button size="icon" variant="ghost" onClick={() => openEditUserModal(u)} className="text-slate-400 hover:text-indigo-600 h-8 w-8">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    onClick={() => handleDeleteUser(u.id)} 
                                                    className="text-slate-400 hover:text-red-500 h-8 w-8"
                                                    disabled={u.id === currentUserId}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 1: MARCAS */}
                    {activeTab === 'marks' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-1 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                                        <Plus className="h-4 w-4 text-indigo-500" />
                                        Agregar Marca
                                    </CardTitle>
                                    <CardDescription>Crea un fabricante de vehículos</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleCreateMark}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mark-name">Nombre de la Marca</Label>
                                            <Input
                                                id="mark-name"
                                                placeholder="Ej: BMW, Audi, Fiat..."
                                                value={markForm.data.name}
                                                onChange={e => markForm.setData('name', e.target.value)}
                                            />
                                            {markForm.errors.name && <p className="text-xs text-red-500">{markForm.errors.name}</p>}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 text-white dark:text-slate-900 font-semibold"
                                            disabled={markForm.processing || !markForm.data.name}
                                        >
                                            {markForm.processing ? 'Procesando...' : 'Crear Marca'}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>

                            <Card className="lg:col-span-2 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold">Marcas Registradas</CardTitle>
                                    <CardDescription>Listado general que verán todos los concesionarios</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {marks.map(m => (
                                        <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/60 dark:bg-zinc-800/40 border border-slate-200/55 dark:border-zinc-800">
                                            {editingParamId === m.id ? (
                                                <div className="flex items-center gap-2 w-full pr-2">
                                                    <Input
                                                        size={30}
                                                        value={editParamName}
                                                        onChange={e => setEditParamName(e.target.value)}
                                                        className="h-8 py-1"
                                                    />
                                                    <Button size="sm" onClick={() => handleUpdateParam('marks', m.id)} className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5">
                                                        Listo
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingParamId(null)} className="h-8 text-slate-400">
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="space-y-0.5">
                                                        <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200">{m.name}</span>
                                                        <p className="text-[10px] text-slate-400 font-mono">slug: {m.slug}</p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button size="icon" variant="ghost" onClick={() => startEditingParam(m.id, m.name)} className="text-slate-400 hover:text-indigo-500 h-8 w-8">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" onClick={() => handleDeleteParam('marks', m.id)} className="text-slate-400 hover:text-red-500 h-8 w-8">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    {marks.length === 0 && (
                                        <p className="text-sm text-slate-400 italic text-center py-6">No hay marcas definidas.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab 2: TIPOS DE VEHICULO */}
                    {activeTab === 'types' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-1 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                                        <Plus className="h-4 w-4 text-indigo-500" />
                                        Agregar Tipo de Vehículo
                                    </CardTitle>
                                    <CardDescription>Crea una nueva clasificación general</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleCreateType}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="type-name">Nombre del Tipo</Label>
                                            <Input
                                                id="type-name"
                                                placeholder="Ej: Auto, Camioneta, Moto, Cuatriciclo..."
                                                value={typeForm.data.name}
                                                onChange={e => typeForm.setData('name', e.target.value)}
                                            />
                                            {typeForm.errors.name && <p className="text-xs text-red-500">{typeForm.errors.name}</p>}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 text-white dark:text-slate-900 font-semibold"
                                            disabled={typeForm.processing || !typeForm.data.name}
                                        >
                                            {typeForm.processing ? 'Procesando...' : 'Crear Tipo'}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>

                            <Card className="lg:col-span-2 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold">Tipos de Vehículo Activos</CardTitle>
                                    <CardDescription>Administra los tipos de vehículos que tendrán plantillas asociadas</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {types.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/60 dark:bg-zinc-800/40 border border-slate-200/55 dark:border-zinc-800">
                                            {editingParamId === t.id ? (
                                                <div className="flex items-center gap-2 w-full pr-2">
                                                    <Input
                                                        size={30}
                                                        value={editParamName}
                                                        onChange={e => setEditParamName(e.target.value)}
                                                        className="h-8 py-1"
                                                    />
                                                    <Button size="sm" onClick={() => handleUpdateParam('types', t.id)} className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5">
                                                        Listo
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingParamId(null)} className="h-8 text-slate-400">
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="space-y-0.5">
                                                        <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200">{t.name}</span>
                                                        <p className="text-[10px] text-slate-400 font-mono">slug: {t.slug}</p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button size="icon" variant="ghost" onClick={() => startEditingParam(t.id, t.name)} className="text-slate-400 hover:text-indigo-500 h-8 w-8">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" onClick={() => handleDeleteParam('types', t.id)} className="text-slate-400 hover:text-red-500 h-8 w-8">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    {types.length === 0 && (
                                        <p className="text-sm text-slate-400 italic text-center py-6">No hay tipos de vehículos definidos.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab 3: COMBUSTIBLES */}
                    {activeTab === 'fuels' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-1 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                                        <Plus className="h-4 w-4 text-indigo-500" />
                                        Agregar Combustible
                                    </CardTitle>
                                    <CardDescription>Crea un tipo de combustible o propulsión</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleCreateFuel}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fuel-name">Nombre de Combustible</Label>
                                            <Input
                                                id="fuel-name"
                                                placeholder="Ej: Nafta, Diesel, Híbrido..."
                                                value={fuelForm.data.name}
                                                onChange={e => fuelForm.setData('name', e.target.value)}
                                            />
                                            {fuelForm.errors.name && <p className="text-xs text-red-500">{fuelForm.errors.name}</p>}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 text-white dark:text-slate-900 font-semibold"
                                            disabled={fuelForm.processing || !fuelForm.data.name}
                                        >
                                            {fuelForm.processing ? 'Procesando...' : 'Crear Combustible'}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>

                            <Card className="lg:col-span-2 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold">Tipos de Combustible Registrados</CardTitle>
                                    <CardDescription>Parámetros generales compartidos por los concesionarios</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {fuels.map(f => (
                                        <div key={f.id} className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50/60 dark:bg-zinc-800/40 border border-slate-200/50 dark:border-zinc-800">
                                            {editingParamId === f.id ? (
                                                <div className="flex items-center gap-2 w-full pr-2">
                                                    <Input
                                                        size={30}
                                                        value={editParamName}
                                                        onChange={e => setEditParamName(e.target.value)}
                                                        className="h-8 py-1"
                                                    />
                                                    <Button size="sm" onClick={() => handleUpdateParam('fuels', f.id)} className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5">
                                                        Listo
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingParamId(null)} className="h-8 text-slate-400">
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200">{f.name}</span>
                                                    <div className="flex gap-1">
                                                        <Button size="icon" variant="ghost" onClick={() => startEditingParam(f.id, f.name)} className="text-slate-400 hover:text-indigo-500 h-8 w-8">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" onClick={() => handleDeleteParam('fuels', f.id)} className="text-slate-400 hover:text-red-500 h-8 w-8">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    {fuels.length === 0 && (
                                        <p className="text-sm text-slate-400 italic text-center py-6">No hay combustibles definidos.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab 4: PLANTILLAS POR DEFECTO DEL SISTEMA */}
                    {activeTab === 'templates' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-1 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                                        <Plus className="h-4 w-4 text-indigo-500" />
                                        Agregar Campo Global
                                    </CardTitle>
                                    <CardDescription>Crea un campo predefinido para nuevos concesionarios</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleCreateTemplate}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tpl-type-id">Tipo de Vehículo</Label>
                                            <Select value={templateForm.data.vehicle_type_id} onValueChange={val => templateForm.setData('vehicle_type_id', val)}>
                                                <SelectTrigger id="tpl-type-id">
                                                    <SelectValue placeholder="Seleccionar Tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {types.map(t => (
                                                        <SelectItem key={t.id} value={String(t.id)}>
                                                            {t.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tpl-label">Nombre del Campo</Label>
                                            <Input
                                                id="tpl-label"
                                                placeholder="Ej: puertas, transmision..."
                                                value={templateForm.data.label}
                                                onChange={e => templateForm.setData('label', e.target.value.toLowerCase().trim().replace(/\s+/g, '_'))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tpl-input-type">Tipo de Input</Label>
                                            <Select value={templateForm.data.type} onValueChange={(val: any) => {
                                                templateForm.setData('type', val);
                                                templateForm.setData('options', []);
                                            }}>
                                                <SelectTrigger id="tpl-input-type">
                                                    <SelectValue placeholder="Tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Texto Libre</SelectItem>
                                                    <SelectItem value="number">Número</SelectItem>
                                                    <SelectItem value="select">Selector (Desplegable)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tpl-default">Valor por Defecto</Label>
                                            <Input
                                                id="tpl-default"
                                                placeholder="Ej: Manual, Sí..."
                                                value={templateForm.data.default_value}
                                                onChange={e => templateForm.setData('default_value', e.target.value)}
                                            />
                                        </div>

                                        {templateForm.data.type === 'select' && (
                                            <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800 pt-3">
                                                <Label className="text-xs font-bold text-slate-500 uppercase">Opciones del Selector</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Nueva opción..."
                                                        value={newOptionVal}
                                                        onChange={e => setNewOptionVal(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTemplateOption())}
                                                    />
                                                    <Button type="button" onClick={handleAddTemplateOption} variant="secondary">
                                                        Añadir
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {templateForm.data.options.map(opt => (
                                                        <span key={opt} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs px-2 py-0.5 rounded-full">
                                                            <span>{opt}</span>
                                                            <button type="button" onClick={() => handleRemoveTemplateOption(opt)} className="text-slate-400 hover:text-red-500 font-bold ml-1">
                                                                &times;
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            className="w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 text-white dark:text-slate-900 font-semibold"
                                            disabled={templateForm.processing || !templateForm.data.label}
                                        >
                                            Crear Campo Global
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>

                            <Card className="lg:col-span-2 border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold">Listado de Plantillas Globales</CardTitle>
                                    <CardDescription>Plantillas por defecto que heredarán los nuevos concesionarios creados en el SaaS</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {templates.map(t => (
                                        <div key={t.id} className="flex items-start justify-between p-3.5 rounded-lg bg-slate-50/60 dark:bg-zinc-800/40 border border-slate-200/50 dark:border-zinc-800">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-slate-800 dark:text-zinc-200">
                                                        {formatLabel(t.label)}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                                                        {t.type}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded">
                                                        {types.find(type => type.id === t.vehicle_type_id)?.name || 'Tipo: ' + t.vehicle_type_id}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 dark:text-zinc-500">
                                                    {t.default_value ? <>Valor por defecto: <strong>{t.default_value}</strong></> : <span className="italic">Sin valor predeterminado</span>}
                                                </p>
                                                {t.type === 'select' && Array.isArray(t.options) && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {t.options.map(o => (
                                                            <span key={o} className="bg-white dark:bg-zinc-900 text-slate-500 border border-slate-100 dark:border-zinc-800 text-[9px] px-1.5 py-0.2 rounded">
                                                                {o}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <Button size="icon" variant="ghost" onClick={() => handleDeleteTemplate(t.id)} className="text-slate-400 hover:text-red-500">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {templates.length === 0 && (
                                        <p className="text-sm text-slate-400 italic text-center py-6">No hay campos de plantilla globales definidos.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* --- DIALOG MODAL: CONCESIONARIO CREATE/EDIT --- */}
            <Dialog open={isOpenStoreModal} onOpenChange={setIsOpenStoreModal}>
                <DialogContent className="max-w-lg bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            {editingStore ? 'Editar Concesionario' : 'Crear Concesionario'}
                        </DialogTitle>
                        <DialogDescription>
                            Completa los datos de identificación del concesionario.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleStoreSubmit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="store-name">Nombre Comercial</Label>
                            <Input 
                                id="store-name" 
                                value={storeForm.data.name} 
                                onChange={e => {
                                    storeForm.setData('name', e.target.value);
                                    if (!editingStore) {
                                        storeForm.setData('slug', generateStoreSlug(e.target.value));
                                    }
                                }}
                                placeholder="Ej: Automotores Palermo" 
                                required
                            />
                            {storeForm.errors.name && <p className="text-xs text-red-500">{storeForm.errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="store-slug">Slug de URL (Identificador Único)</Label>
                            <Input 
                                id="store-slug" 
                                value={storeForm.data.slug} 
                                onChange={e => storeForm.setData('slug', generateStoreSlug(e.target.value))}
                                placeholder="ej: automotores-palermo" 
                                required
                            />
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                                Dirección web: <strong className="text-indigo-500">/catalogo/{storeForm.data.slug || 'slug'}</strong>
                            </p>
                            {storeForm.errors.slug && <p className="text-xs text-red-500">{storeForm.errors.slug}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="store-phone">Teléfono de Contacto</Label>
                                <Input 
                                    id="store-phone" 
                                    value={storeForm.data.phone} 
                                    onChange={e => storeForm.setData('phone', e.target.value)}
                                    placeholder="+54 11 1234-5678" 
                                />
                                {storeForm.errors.phone && <p className="text-xs text-red-500">{storeForm.errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="store-email">Email Comercial</Label>
                                <Input 
                                    id="store-email" 
                                    type="email"
                                    value={storeForm.data.email} 
                                    onChange={e => storeForm.setData('email', e.target.value)}
                                    placeholder="contacto@local.com" 
                                />
                                {storeForm.errors.email && <p className="text-xs text-red-500">{storeForm.errors.email}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="store-address">Dirección Física</Label>
                            <Input 
                                id="store-address" 
                                value={storeForm.data.address} 
                                onChange={e => storeForm.setData('address', e.target.value)}
                                placeholder="Av. Cabildo 1500, Belgrano, CABA" 
                            />
                            {storeForm.errors.address && <p className="text-xs text-red-500">{storeForm.errors.address}</p>}
                        </div>

                        <DialogFooter className="pt-4 flex gap-2 justify-end">
                            <Button type="button" variant="ghost" onClick={() => setIsOpenStoreModal(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" disabled={storeForm.processing}>
                                {storeForm.processing ? 'Guardando...' : editingStore ? 'Actualizar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- DIALOG MODAL: USUARIO CREATE/EDIT --- */}
            <Dialog open={isOpenUserModal} onOpenChange={setIsOpenUserModal}>
                <DialogContent className="max-w-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            {editingUser ? 'Editar Usuario' : 'Crear Cuenta de Usuario'}
                        </DialogTitle>
                        <DialogDescription>
                            Registra o edita los accesos de usuario y sus roles en los concesionarios.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUserSubmit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="user-name">Nombre Completo</Label>
                            <Input 
                                id="user-name" 
                                value={userForm.data.name} 
                                onChange={e => userForm.setData('name', e.target.value)}
                                placeholder="Ej: Juan Pérez" 
                                required
                            />
                            {userForm.errors.name && <p className="text-xs text-red-500">{userForm.errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-email">Correo Electrónico (Login)</Label>
                            <Input 
                                id="user-email" 
                                type="email"
                                value={userForm.data.email} 
                                onChange={e => userForm.setData('email', e.target.value)}
                                placeholder="juan@gmail.com" 
                                required
                            />
                            {userForm.errors.email && <p className="text-xs text-red-500">{userForm.errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-password">
                                {editingUser ? 'Nueva Contraseña (Dejar vacío para mantener actual)' : 'Contraseña de Acceso'}
                            </Label>
                            <Input 
                                id="user-password" 
                                type="password"
                                value={userForm.data.password} 
                                onChange={e => userForm.setData('password', e.target.value)}
                                placeholder="••••••••" 
                                required={!editingUser}
                            />
                            {userForm.errors.password && <p className="text-xs text-red-500">{userForm.errors.password}</p>}
                        </div>

                        <div className="flex items-center gap-2 border border-slate-100 dark:border-zinc-800 p-3 rounded-lg bg-slate-50/50 dark:bg-zinc-800/10">
                            <input
                                id="user-admin"
                                type="checkbox"
                                checked={userForm.data.is_superadmin}
                                onChange={e => userForm.setData('is_superadmin', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <Label htmlFor="user-admin" className="font-bold text-slate-800 dark:text-zinc-200 cursor-pointer flex items-center gap-1">
                                <Shield className="h-4 w-4 text-indigo-500" />
                                ¿Otorgar perfil de Administrador Global (Superadmin)?
                            </Label>
                        </div>

                        {/* Store Associations */}
                        <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Asociar a Concesionarios</Label>
                            
                            {/* Current associations */}
                            <div className="space-y-2">
                                {userForm.data.stores.map(item => {
                                    const storeObj = stores.find(st => st.id === item.store_id);
                                    return (
                                        <div key={item.store_id} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 text-xs">
                                            <span className="font-semibold">{storeObj ? storeObj.name : 'ID: ' + item.store_id}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="uppercase text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded">
                                                    {item.role}
                                                </span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveStoreAssociation(item.store_id)}
                                                    className="text-slate-400 hover:text-red-500 font-bold ml-1"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {userForm.data.stores.length === 0 && (
                                    <p className="text-xs text-slate-400 italic">Este usuario no está asociado a ningún concesionario todavía.</p>
                                )}
                            </div>

                            {/* Add association selector */}
                            <div className="flex gap-2 items-end pt-1">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-[10px] text-slate-400 font-bold uppercase">Concesionario</Label>
                                    <select
                                        value={assocStoreId}
                                        onChange={e => setAssocStoreId(e.target.value)}
                                        className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs rounded-lg p-2 block w-full focus:ring-brand focus:border-brand"
                                    >
                                        <option value="">Seleccionar concesionario...</option>
                                        {stores
                                            .filter(st => !userForm.data.stores.some(as => as.store_id === st.id))
                                            .map(st => (
                                                <option key={st.id} value={st.id}>{st.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-slate-400 font-bold uppercase">Rol en local</Label>
                                    <select
                                        value={assocRole}
                                        onChange={e => setAssocRole(e.target.value)}
                                        className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs rounded-lg p-2 block w-full focus:ring-brand focus:border-brand"
                                    >
                                        <option value="owner">Dueño (Owner)</option>
                                        <option value="manager">Gerente (Manager)</option>
                                        <option value="editor">Editor (Stock CRUD)</option>
                                        <option value="employee">Empleado (Lectura)</option>
                                    </select>
                                </div>
                                <Button type="button" onClick={handleAddStoreAssociation} disabled={!assocStoreId} variant="secondary" className="px-3 shrink-0 h-9">
                                    Asociar
                                </Button>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 flex gap-2 justify-end">
                            <Button type="button" variant="ghost" onClick={() => setIsOpenUserModal(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" disabled={userForm.processing}>
                                {userForm.processing ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
