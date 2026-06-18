import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Building2, User, Briefcase, MapPin, Phone, Mail, CheckCircle, Sparkles } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Link } from '@inertiajs/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OnboardingForm {
    name: string;
    province: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    role: 'owner' | 'manager';
    [key: string]: any;
}

const TRIAL_DAYS = 90;

export default function OnboardingStore() {
    const { data, setData, post, processing, errors } = useForm<OnboardingForm>({
        name: '',
        province: '',
        city: '',
        address: '',
        phone: '',
        email: '',
        role: 'owner',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('onboarding.store.submit'));
    };

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
    const trialEndFormatted = trialEnd.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="min-h-svh bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-6">
            <Head title="Configurar tu concesionario — AutoDealer" />

            <div className="w-full max-w-2xl">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href={route('home')}>
                        <img
                            src="/assets/logo-h-dark.png"
                            alt="AutoDealer"
                            className="h-9 object-contain"
                        />
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
                    {/* Header gradient bar */}
                    <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

                    <div className="p-8 md:p-10">
                        {/* Title */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center h-14 w-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-4">
                                <Building2 className="h-7 w-7 text-indigo-500" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
                                ¡Bienvenido a AutoDealer!
                            </h1>
                            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-2 max-w-md mx-auto">
                                Para comenzar a operar, configurá tu concesionario. Podés completar el resto de los datos desde la configuración una vez dentro del sistema.
                            </p>
                        </div>

                        {/* Trial banner */}
                        <div className="flex items-start gap-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-4 mb-8">
                            <div className="mt-0.5">
                                <Sparkles className="h-5 w-5 text-indigo-500 shrink-0" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-indigo-800 dark:text-indigo-300">
                                    Plan Premium — Período de prueba de {TRIAL_DAYS} días activado automáticamente
                                </p>
                                <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-0.5">
                                    Tu período de prueba vence el <strong>{trialEndFormatted}</strong>. Sin costo ni tarjeta de crédito requerida hasta esa fecha.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Datos del concesionario */}
                            <div className="space-y-4">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                                    <Building2 className="h-3.5 w-3.5" />
                                    Datos del concesionario
                                </h2>

                                <div className="grid gap-2">
                                    <Label htmlFor="store-name" className="font-semibold text-slate-700 dark:text-zinc-300">
                                        Nombre del concesionario <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="store-name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        placeholder="Ej: Automotores Del Sur"
                                        className="h-11"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="store-province" className="font-semibold text-slate-700 dark:text-zinc-300">
                                            Provincia <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="store-province"
                                            type="text"
                                            required
                                            tabIndex={2}
                                            value={data.province}
                                            onChange={(e) => setData('province', e.target.value)}
                                            disabled={processing}
                                            placeholder="Ej: Buenos Aires"
                                            className="h-11"
                                        />
                                        <InputError message={errors.province} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="store-city" className="font-semibold text-slate-700 dark:text-zinc-300">
                                            Localidad <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="store-city"
                                            type="text"
                                            required
                                            tabIndex={3}
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            disabled={processing}
                                            placeholder="Ej: Mar del Plata"
                                            className="h-11"
                                        />
                                        <InputError message={errors.city} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="store-address" className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                        Dirección <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="store-address"
                                        type="text"
                                        required
                                        tabIndex={4}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        disabled={processing}
                                        placeholder="Ej: Av. Rivadavia 1234"
                                        className="h-11"
                                    />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="store-phone" className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                                            Teléfono del local
                                        </Label>
                                        <Input
                                            id="store-phone"
                                            type="tel"
                                            tabIndex={5}
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            disabled={processing}
                                            placeholder="+54 11 1234-5678"
                                            className="h-11"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="store-email" className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                                            Email del local
                                        </Label>
                                        <Input
                                            id="store-email"
                                            type="email"
                                            tabIndex={6}
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            disabled={processing}
                                            placeholder="contacto@miconcesionario.com"
                                            className="h-11"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                </div>

                            </div>

                            {/* Rol en el concesionario */}
                            <div className="space-y-3">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                                    <User className="h-3.5 w-3.5" />
                                    Tu rol en el concesionario
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Owner option */}
                                    <label
                                        htmlFor="role-owner"
                                        className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${data.role === 'owner'
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                                                : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            id="role-owner"
                                            name="role"
                                            value="owner"
                                            checked={data.role === 'owner'}
                                            onChange={() => setData('role', 'owner')}
                                            className="sr-only"
                                            tabIndex={7}
                                        />
                                        <div className={`mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${data.role === 'owner'
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                                            }`}>
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-sm ${data.role === 'owner'
                                                    ? 'text-indigo-700 dark:text-indigo-300'
                                                    : 'text-slate-800 dark:text-zinc-200'
                                                }`}>
                                                Soy el Dueño
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-tight">
                                                Tengo control total sobre el concesionario y sus configuraciones.
                                            </p>
                                        </div>
                                        {data.role === 'owner' && (
                                            <CheckCircle className="h-5 w-5 text-indigo-500 shrink-0 absolute top-4 right-4" />
                                        )}
                                    </label>

                                    {/* Manager option */}
                                    <label
                                        htmlFor="role-manager"
                                        className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${data.role === 'manager'
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                                                : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            id="role-manager"
                                            name="role"
                                            value="manager"
                                            checked={data.role === 'manager'}
                                            onChange={() => setData('role', 'manager')}
                                            className="sr-only"
                                            tabIndex={8}
                                        />
                                        <div className={`mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${data.role === 'manager'
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                                            }`}>
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-sm ${data.role === 'manager'
                                                    ? 'text-indigo-700 dark:text-indigo-300'
                                                    : 'text-slate-800 dark:text-zinc-200'
                                                }`}>
                                                Soy el Gerente
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-tight">
                                                Administro las operaciones del día a día del concesionario.
                                            </p>
                                        </div>
                                        {data.role === 'manager' && (
                                            <CheckCircle className="h-5 w-5 text-indigo-500 shrink-0 absolute top-4 right-4" />
                                        )}
                                    </label>
                                </div>
                                <InputError message={errors.role} />
                            </div>

                            {/* Info note */}
                            <p className="text-xs text-slate-400 dark:text-zinc-500 text-center leading-relaxed">
                                El logo, banner, redes sociales, horarios y demás datos de tu concesionario
                                los podrás completar desde la sección de <strong className="text-slate-500 dark:text-zinc-400">Configuración</strong> una vez dentro del sistema.
                            </p>

                            {/* Submit */}
                            <Button
                                type="submit"
                                tabIndex={9}
                                disabled={processing}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-base rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="h-5 w-5 animate-spin" />
                                        Creando tu concesionario...
                                    </>
                                ) : (
                                    <>
                                        <Building2 className="h-5 w-5" />
                                        Crear concesionario y comenzar
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-500 mt-6">
                    AutoDealer © {new Date().getFullYear()} — Plataforma de gestión de concesionarios
                </p>
            </div>
        </div>
    );
}
