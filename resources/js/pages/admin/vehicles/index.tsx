import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import Pagination from '@/components/admin/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Search, Trash2, Eye, Landmark, Car, Tag, Calendar, Badge, ShieldAlert } from 'lucide-react';

interface Store {
    id: number;
    name: string;
}

interface VehicleType {
    id: number;
    name: string;
}

interface VehicleMark {
    id: number;
    name: string;
}

interface VehicleImage {
    id: number;
    path: string;
    sort_order: number;
}

interface VehicleDetail {
    id: number;
    label: string;
    value: string;
}

interface Vehicle {
    id: number;
    store_id: number;
    vehicle_type_id: number;
    vehicle_mark_id: number;
    model: string;
    year: number;
    price: number | string;
    currency: string;
    plate: string;
    cover_image: string | null;
    engine: string | null;
    fuel_type: string | null;
    mileage: number | null;
    description: string | null;
    status: string;
    created_at: string;
    store: Store;
    type: VehicleType;
    mark: VehicleMark;
    details: VehicleDetail[];
    images: VehicleImage[];
}

interface PaginatedVehicles {
    data: Vehicle[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
}

interface VehiclesProps {
    vehicles: PaginatedVehicles;
    stores: Store[];
    types: VehicleType[];
    marks: VehicleMark[];
    filters: {
        search: string;
        store_id: string;
        vehicle_type_id: string;
        vehicle_mark_id: string;
    };
    status?: string;
    message?: string;
}

export default function VehiclesIndex({ vehicles, stores, types, marks, filters, status, message }: VehiclesProps) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Inventario Global', href: '/admin/vehicles' },
    ];

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [storeFilter, setStoreFilter] = useState(filters.store_id || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.vehicle_type_id || 'all');
    const [markFilter, setMarkFilter] = useState(filters.vehicle_mark_id || 'all');

    // Dialog states
    const [isInspectOpen, setIsInspectOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(searchTerm, storeFilter, typeFilter, markFilter);
    };

    const applyFilters = (search: string, store: string, type: string, mark: string) => {
        router.get('/admin/vehicles', {
            search,
            store_id: store === 'all' ? '' : store,
            vehicle_type_id: type === 'all' ? '' : type,
            vehicle_mark_id: mark === 'all' ? '' : mark,
        }, { preserveState: true });
    };

    const handleStoreChange = (value: string) => {
        setStoreFilter(value);
        applyFilters(searchTerm, value, typeFilter, markFilter);
    };

    const handleTypeChange = (value: string) => {
        setTypeFilter(value);
        applyFilters(searchTerm, storeFilter, value, markFilter);
    };

    const handleMarkChange = (value: string) => {
        setMarkFilter(value);
        applyFilters(searchTerm, storeFilter, typeFilter, value);
    };

    const openInspect = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsInspectOpen(true);
    };

    const openDelete = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsDeleteOpen(true);
    };

    const submitDelete = () => {
        if (!selectedVehicle) return;
        router.delete(`/admin/vehicles/${selectedVehicle.id}`, {
            onSuccess: () => setIsDeleteOpen(false),
        });
    };

    const formatCurrency = (amount: number | string, currency: string) => {
        const value = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available':
                return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">Disponible</span>;
            case 'sold':
                return <span className="bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">Vendido</span>;
            case 'reserved':
                return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">Reservado</span>;
            default:
                return <span className="bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 px-2 py-0.5 rounded-full text-xs font-semibold capitalize">{status}</span>;
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventario Global de Vehículos" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Inventario Global</h2>
                        <p className="text-muted-foreground">
                            Visualiza e inspecciona todos los vehículos publicados por los distintos concesionarios.
                        </p>
                    </div>
                </div>

                {(status === 'success' || message) && (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
                        {message || 'Operación completada con éxito.'}
                    </div>
                )}

                <Card>
                    <CardHeader className="p-4 sm:p-6 pb-2">
                        <h3 className="font-semibold text-lg">Buscar y Filtrar</h3>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Buscar por modelo o patente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-background"
                                />
                            </div>

                            <Select value={storeFilter} onValueChange={handleStoreChange}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Concesionario" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los concesionarios</SelectItem>
                                    {stores.map(st => (
                                        <SelectItem key={st.id} value={String(st.id)}>{st.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={typeFilter} onValueChange={handleTypeChange}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los tipos</SelectItem>
                                    {types.map(t => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={markFilter} onValueChange={handleMarkChange}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Marca" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las marcas</SelectItem>
                                    {marks.map(m => (
                                        <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </form>
                    </CardContent>
                </Card>

                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                                    <th className="p-4">Foto</th>
                                    <th className="p-4">Vehículo</th>
                                    <th className="p-4">Patente</th>
                                    <th className="p-4">Concesionario</th>
                                    <th className="p-4">Precio</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            No se encontraron vehículos.
                                        </td>
                                    </tr>
                                ) : (
                                    vehicles.data.map((vehicle) => (
                                        <tr key={vehicle.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                {vehicle.cover_image ? (
                                                    <img src={vehicle.cover_image} alt={vehicle.model} className="h-10 w-16 rounded object-cover border bg-muted" />
                                                ) : (
                                                    <div className="flex h-10 w-16 items-center justify-center rounded bg-muted text-muted-foreground border">
                                                        <Car className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 font-semibold">
                                                <div className="flex flex-col">
                                                    <span>{vehicle.mark.name} {vehicle.model}</span>
                                                    <span className="text-xs text-muted-foreground font-normal">Año {vehicle.year} • {vehicle.type.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-xs uppercase">{vehicle.plate}</td>
                                            <td className="p-4">
                                                <span className="flex items-center gap-1 text-xs">
                                                    <Landmark className="h-3 w-3 text-muted-foreground" />
                                                    {vehicle.store.name}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium">{formatCurrency(vehicle.price, vehicle.currency)}</td>
                                            <td className="p-4">{getStatusBadge(vehicle.status)}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openInspect(vehicle)} className="h-8 w-8">
                                                        <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                        <span className="sr-only">Inspeccionar</span>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openDelete(vehicle)} className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10">
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
                    <Pagination links={vehicles.links} />
                </div>
            </div>

            {/* Inspect Sheet */}
            <Sheet open={isInspectOpen} onOpenChange={setIsInspectOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-background border-l border-border">
                    <SheetHeader className="pb-4 border-b">
                        <SheetTitle className="text-xl font-bold flex items-center gap-2">
                            <Car className="h-5 w-5 text-indigo-500" />
                            Inspeccionar Vehículo
                        </SheetTitle>
                        <SheetDescription>Ficha técnica completa y detalles del stock global.</SheetDescription>
                    </SheetHeader>
                    {selectedVehicle && (
                        <div className="space-y-6 py-6">
                            {/* Main Cover Image */}
                            <div className="relative rounded-xl overflow-hidden border bg-muted aspect-video">
                                {selectedVehicle.cover_image ? (
                                    <img src={selectedVehicle.cover_image} alt={selectedVehicle.model} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        No hay imagen de portada
                                    </div>
                                )}
                                <div className="absolute bottom-3 right-3">
                                    {getStatusBadge(selectedVehicle.status)}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <div>
                                    <Label className="text-[11px] text-muted-foreground uppercase">Marca / Modelo</Label>
                                    <p className="text-base font-semibold">{selectedVehicle.mark.name} {selectedVehicle.model}</p>
                                </div>
                                <div>
                                    <Label className="text-[11px] text-muted-foreground uppercase">Precio Publicado</Label>
                                    <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedVehicle.price, selectedVehicle.currency)}</p>
                                </div>
                                <div>
                                    <Label className="text-[11px] text-muted-foreground uppercase">Patente</Label>
                                    <p className="text-sm font-mono uppercase">{selectedVehicle.plate}</p>
                                </div>
                                <div>
                                    <Label className="text-[11px] text-muted-foreground uppercase">Concesionario</Label>
                                    <p className="text-sm font-medium">{selectedVehicle.store.name}</p>
                                </div>
                            </div>

                            {/* Technical Specs */}
                            <div className="space-y-3 border-b pb-4">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Especificaciones Principales</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="text-muted-foreground">Año:</span>
                                        <span className="font-medium">{selectedVehicle.year}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="text-muted-foreground">Kilometraje:</span>
                                        <span className="font-medium">{selectedVehicle.mileage !== null ? `${selectedVehicle.mileage.toLocaleString()} km` : 'N/D'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="text-muted-foreground">Combustible:</span>
                                        <span className="font-medium capitalize">{selectedVehicle.fuel_type || 'N/D'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="text-muted-foreground">Motor:</span>
                                        <span className="font-medium">{selectedVehicle.engine || 'N/D'}</span>
                                    </div>
                                </div>
                                {selectedVehicle.description && (
                                    <div className="pt-2">
                                        <span className="text-xs text-muted-foreground block mb-1">Descripción:</span>
                                        <p className="text-xs bg-muted/50 p-2.5 rounded-lg border text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                            {selectedVehicle.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Custom Template fields */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Atributos de Plantilla</h4>
                                {selectedVehicle.details.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">Este vehículo no tiene atributos de plantilla adicionales asignados.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {selectedVehicle.details.map((detail) => (
                                            <div key={detail.id} className="flex justify-between border-b pb-1 col-span-2 sm:col-span-1">
                                                <span className="text-muted-foreground capitalize">{detail.label.replace(/_/g, ' ')}:</span>
                                                <span className="font-medium">{detail.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Images Gallery */}
                            {selectedVehicle.images.length > 1 && (
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Galería de Imágenes</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedVehicle.images.map((img) => (
                                            <a key={img.id} href={img.path} target="_blank" rel="noreferrer" className="block border rounded overflow-hidden aspect-video bg-muted hover:opacity-85 transition-opacity">
                                                <img src={img.path} alt="Detalle" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="bg-background border border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-destructive gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            Confirmar Eliminación
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            ¿Estás seguro de que deseas eliminar permanentemente el vehículo <strong>{selectedVehicle?.mark.name} {selectedVehicle?.model}</strong> (Patente: {selectedVehicle?.plate}) del sistema?
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={submitDelete}>
                            Eliminar Vehículo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
