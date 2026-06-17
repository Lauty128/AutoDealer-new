import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, ShieldAlert } from 'lucide-react';
import { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    [key: string]: any;
}

export default function AdminLogin({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="bg-zinc-950 text-zinc-100 flex min-h-svh flex-col items-center justify-center p-6 md:p-10 relative overflow-hidden">
            <Head title="Acceso de Administrador" />
            
            {/* Ambient gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                <div className="flex flex-col gap-6 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl">
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div className="space-y-1 text-center">
                            <h1 className="text-2xl font-bold tracking-tight">AutoDealer Admin</h1>
                            <p className="text-zinc-400 text-sm">
                                Panel de Administración Global
                            </p>
                        </div>
                    </div>

                    {status && (
                        <div className="p-3 text-center text-sm font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                            {status}
                        </div>
                    )}

                    <form className="flex flex-col gap-5" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-zinc-300">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="admin@autodealer.com"
                                className="bg-zinc-900 border-zinc-850 text-zinc-100 focus:border-red-500 focus:ring-red-500/20"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-zinc-300">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                className="bg-zinc-900 border-zinc-850 text-zinc-100 focus:border-red-500 focus:ring-red-500/20"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center space-x-3">
                            <Checkbox 
                                id="remember" 
                                name="remember" 
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', !!checked)}
                                className="border-zinc-700 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 text-zinc-100"
                            />
                            <Label htmlFor="remember" className="text-zinc-300 text-sm cursor-pointer select-none">
                                Recordarme en este dispositivo
                            </Label>
                        </div>

                        <Button type="submit" className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors border-0" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            Iniciar Sesión como Administrador
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
