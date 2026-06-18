import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
    Copy, Check, ExternalLink, FileText, Send, 
    Facebook, Twitter, Calendar, Gauge, Fuel 
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface VehicleDetail {
    id: number;
    label: string;
    value: string;
}

interface VehicleImage {
    id: number;
    path: string;
    sort_order: number;
}

interface Vehicle {
    id: number;
    store_id: number;
    model: string;
    slug: string;
    year: number;
    price: number;
    currency: string;
    cover_image: string;
    plate: string;
    engine: string;
    suspension: string;
    fuel_type: string;
    mileage: number;
    description: string;
    status: string;
    cost_price: number | null;
    type: { id: number; name: string };
    mark: { id: number; name: string };
    details: VehicleDetail[];
    images: VehicleImage[];
}

interface Store {
    id: number;
    name: string;
    slug: string;
    phone?: string;
    email?: string;
    logo?: string;
}

interface SharePreviewDialogProps {
    vehicle: Vehicle | null;
    store: Store | null;
    isOpen: boolean;
    onClose: () => void;
}

export function SharePreviewDialog({ vehicle, store, isOpen, onClose }: SharePreviewDialogProps) {
    const [copied, setCopied] = useState(false);
    
    useEffect(() => {
        if (!isOpen) {
            setCopied(false);
        }
    }, [isOpen]);

    if (!vehicle || !store) return null;

    const publicUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/concesionario/${store.slug || store.id}/${vehicle.slug || vehicle.id}`
        : `/concesionario/${store.slug || store.id}/${vehicle.slug || vehicle.id}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Error al copiar el enlace', err);
        }
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency === 'USD' ? 'USD' : 'ARS',
            maximumFractionDigits: 0
        }).format(price);
    };

    const formatMileage = (mileage: number | null) => {
        if (mileage === null) return 'N/A';
        return new Intl.NumberFormat('es-AR').format(mileage) + ' km';
    };

    // Social share links
    const shareMessage = `Mira este ${vehicle.mark.name} ${vehicle.model} (${vehicle.year}) en venta:`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareMessage} ${publicUrl}`)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl)}&text=${encodeURIComponent(shareMessage)}`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-1.5 text-slate-900 dark:text-zinc-100">
                        Ficha y Compartir
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-zinc-400 text-xs">
                        Vista previa rápida y herramientas de difusión para tu catálogo público.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 mt-2">
                    {/* Mini Card Preview */}
                    <div className="flex gap-4 p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200/80 dark:border-zinc-800/80">
                        <div className="h-20 w-28 rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 border border-slate-200 dark:border-zinc-800">
                            {vehicle.cover_image ? (
                                <img src={vehicle.cover_image} alt={vehicle.model} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">Sin foto</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                    {vehicle.mark.name}
                                </span>
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 truncate mt-0.5 leading-tight">
                                    {vehicle.model}
                                </h4>
                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                                    <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3 shrink-0" />{vehicle.year}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5"><Gauge className="h-3 w-3 shrink-0" />{formatMileage(vehicle.mileage)}</span>
                                </div>
                            </div>
                            <div className="font-black text-sm text-slate-900 dark:text-zinc-100 mt-1.5">
                                {formatPrice(vehicle.price, vehicle.currency)}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons list */}
                    <div className="space-y-2.5">
                        <Button 
                            onClick={handleCopyLink}
                            variant="outline"
                            className="w-full justify-between h-10 text-xs border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-semibold"
                        >
                            <span className="flex items-center gap-2">
                                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                                {copied ? '¡Copiado con éxito!' : 'Copiar URL Pública'}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[150px] font-mono select-all">
                                {store.slug}
                            </span>
                        </Button>

                        <div className="grid grid-cols-2 gap-2">
                            <a 
                                href={publicUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold h-10 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <ExternalLink className="h-4 w-4 text-slate-400" />
                                Ir al Catálogo
                            </a>
                            <a 
                                href={`/dashboard/vehicles/${vehicle.id}/print`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold h-10 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                            >
                                <FileText className="h-4 w-4" />
                                Ficha Imprimible
                            </a>
                        </div>
                    </div>

                    {/* Social networks section */}
                    <div className="border-t border-slate-100 dark:border-zinc-800 pt-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">Compartir en Redes</span>
                        <div className="grid grid-cols-3 gap-2">
                            <a 
                                href={whatsappUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            >
                                <Send className="h-3.5 w-3.5 rotate-90" />
                                WhatsApp
                            </a>
                            <a 
                                href={facebookUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold h-9 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                <Facebook className="h-3.5 w-3.5" />
                                Facebook
                            </a>
                            <a 
                                href={twitterUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold h-9 rounded-lg bg-slate-900 text-white hover:bg-black transition-colors"
                            >
                                <Twitter className="h-3.5 w-3.5" />
                                Twitter / X
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                    <Button 
                        onClick={onClose} 
                        variant="ghost" 
                        className="text-xs h-8 text-slate-500 dark:text-zinc-400 font-semibold"
                    >
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
