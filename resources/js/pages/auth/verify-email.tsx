import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, RefreshCw, LogOut } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const justSent = status === 'verification-link-sent';

    return (
        <AuthLayout
            title="Verificá tu correo"
            description="Revisá tu bandeja de entrada y hacé clic en el enlace de verificación que te enviamos."
        >
            <Head title="Verificar correo electrónico" />

            <div className="flex flex-col items-center gap-6">
                {/* Email icon visual */}
                <div className="relative flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Mail className="h-9 w-9 text-indigo-500" />
                    </div>
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-black text-amber-900">
                        1
                    </span>
                </div>

                {/* Status message */}
                {justSent ? (
                    <div className="w-full rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900/50 px-4 py-3 text-center">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                            ✓ Nuevo enlace enviado exitosamente
                        </p>
                        <p className="text-xs text-green-600/80 dark:text-green-500 mt-0.5">
                            Revisá tu bandeja de entrada y también la carpeta de spam.
                        </p>
                    </div>
                ) : (
                    <div className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-3 text-center space-y-1">
                        <p className="text-sm text-slate-600 dark:text-zinc-400">
                            Enviamos un enlace de verificación a tu correo electrónico.
                        </p>
                        <p className="text-xs text-slate-400 dark:text-zinc-500">
                            Si no lo ves, revisá la carpeta de correo no deseado (spam).
                        </p>
                    </div>
                )}

                {/* Steps */}
                <div className="w-full space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 text-center">
                        ¿Cómo verificar?
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        {[
                            { step: '1', label: 'Abrí tu email' },
                            { step: '2', label: 'Buscá el mensaje de AutoDealer' },
                            { step: '3', label: 'Hacé clic en el enlace' },
                        ].map(({ step, label }) => (
                            <div
                                key={step}
                                className="flex flex-col items-center gap-1.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-3"
                            >
                                <span className="h-7 w-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-sm">
                                    {step}
                                </span>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full space-y-3">
                    <form onSubmit={submit} className="w-full">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            Reenviar correo de verificación
                        </Button>
                    </form>

                    <form method="POST" action={route('logout')} className="w-full">
                        <input type="hidden" name="_token" value={document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''} />
                        <Button
                            type="submit"
                            variant="ghost"
                            className="w-full text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 flex items-center justify-center gap-2 text-sm"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Cerrar sesión
                        </Button>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
}
