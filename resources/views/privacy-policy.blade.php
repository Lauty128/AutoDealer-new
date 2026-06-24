<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Políticas de Privacidad y Condiciones de Uso - AutoDealer</title>
    <meta name="description"
        content="Políticas de privacidad y condiciones de uso oficiales de la plataforma AutoDealer. Información detallada sobre el tratamiento de datos y eliminación de cuentas.">
    <meta name="robots" content="index, follow">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800" rel="stylesheet" />

    <!-- Inline Dark Mode Initialization Script -->
    <script>
        (function () {
            const appearance = localStorage.getItem('appearance') || 'system';
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark);
            document.documentElement.classList.toggle('dark', isDark);
        })();
    </script>

    <!-- Tailwind Play CDN for absolute production reliability in environments without Node.js -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        brand: {
                            DEFAULT: '#d8af0d',
                            hover: '#bfa10b',
                        }
                    },
                    fontFamily: {
                        sans: ['Instrument Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                    }
                }
            }
        }
    </script>
</head>

<body
    class="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-800 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-200 font-sans antialiased">

    <!-- Decorative Blurry Background Blobs -->
    <div
        class="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand/5 blur-[100px] pointer-events-none dark:bg-brand/5">
    </div>
    <div
        class="absolute top-[30%] right-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[90px] pointer-events-none dark:bg-indigo-500/5">
    </div>

    <!-- Header Navigation -->
    <header
        class="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md transition-colors duration-300 dark:border-zinc-800/80 dark:bg-zinc-950/95">
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div class="flex items-center">
                <a href="/" class="flex items-center py-1">
                    <img src="/assets/logo-h.png" alt="AutoDealer Logo" class="h-10 object-contain dark:hidden"
                        style="height: 2.5rem;" id="logo-light"
                        onerror="this.style.display='none'; document.getElementById('logo-text').style.display='block';" />
                    <img src="/assets/logo-h-dark.png" alt="AutoDealer Logo Dark"
                        class="h-10 object-contain hidden dark:block" style="height: 2.5rem;" id="logo-dark"
                        onerror="this.style.display='none';" />
                </a>
            </div>
            <div>
                <a href="/"
                    class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand dark:text-zinc-400 dark:hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver al Inicio
                </a>
            </div>
        </div>
    </header>

    <!-- Main Container -->
    <main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <!-- Header Text -->
        <div class="text-center mb-12">
            <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Políticas de Privacidad y Condiciones de Uso
            </h1>
            <p class="mt-3 text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">
                Última actualización: 24 de junio de 2026. Conocé cómo tratamos tus datos y las condiciones para
                utilizar nuestra plataforma SaaS.
            </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">

            <!-- Desktop Sidebar Navigation -->
            <aside class="hidden lg:block lg:col-span-1">
                <div class="sticky top-24 space-y-2">
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-3 mb-4">
                        Secciones</p>
                    <a href="#introduccion"
                        class="block py-2 px-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors">1.
                        Introducción</a>
                    <a href="#datos"
                        class="block py-2 px-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors">2.
                        Datos recopilados</a>
                    <a href="#uso"
                        class="block py-2 px-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors">3.
                        Uso de información</a>
                    <a href="#terceros"
                        class="block py-2 px-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors">4.
                        Terceros e Integraciones</a>
                    <a href="#derechos"
                        class="block py-2 px-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors">5.
                        Tus Derechos</a>
                    <a href="#meta-eliminacion"
                        class="block py-2 px-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors bg-brand/5 dark:bg-brand/10 border-l-2 border-brand font-semibold text-slate-900 dark:text-white">6.
                        Eliminación de datos Meta</a>
                    <a href="#contacto"
                        class="block py-2 px-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors">7.
                        Contacto</a>
                </div>
            </aside>

            <!-- Content Area -->
            <div
                class="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm leading-relaxed">

                <!-- Section 1 -->
                <section id="introduccion" class="mb-10 scroll-mt-20">
                    <h2
                        class="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
                        1. Introducción y Aceptación de Términos
                    </h2>
                    <p class="mb-4">
                        Bienvenido a <strong>AutoDealer</strong>, una plataforma de software como servicio (SaaS)
                        diseñada para la gestión integral de stock y catálogos de concesionarias de vehículos.
                    </p>
                    <p class="mb-4">
                        Al registrarte y hacer uso de nuestra plataforma o al acceder a los catálogos digitales
                        proporcionados por nuestros clientes, aceptas las presentes políticas de uso y privacidad en su
                        totalidad. Si no estás de acuerdo con alguno de los términos, te solicitamos que te abstengas de
                        utilizar el sistema.
                    </p>
                </section>

                <!-- Section 2 -->
                <section id="datos" class="mb-10 scroll-mt-20">
                    <h2
                        class="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
                        2. Datos que Recopilamos
                    </h2>
                    <p class="mb-4">
                        Para proveer la funcionalidad básica de AutoDealer, recopilamos información dividida en las
                        siguientes categorías:
                    </p>
                    <ul class="list-disc pl-6 mb-4 space-y-2">
                        <li>
                            <strong>Información de la Cuenta:</strong> Nombre completo, correo electrónico, número de
                            teléfono y credenciales encriptadas para el inicio de sesión.
                        </li>
                        <li>
                            <strong>Información de la Concesionaria (Store):</strong> Nombre comercial, slug único,
                            dirección física, colores de marca, logo corporativo, enlaces a redes sociales y datos de
                            contacto de WhatsApp.
                        </li>
                        <li>
                            <strong>Inventario de Vehículos:</strong> Datos técnicos de los vehículos (modelo, marca,
                            kilometraje, año, precio en pesos/dólares, descripción de estado, imágenes del rodado).
                        </li>
                        <li>
                            <strong>Datos del Navegador y Cookies:</strong> Dirección IP, tipo de navegador y cookies de
                            sesión temporales para mantener la seguridad técnica de la plataforma.
                        </li>
                    </ul>
                </section>

                <!-- Section 3 -->
                <section id="uso" class="mb-10 scroll-mt-20">
                    <h2
                        class="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
                        3. Uso de la Información
                    </h2>
                    <p class="mb-4">
                        La información recopilada se utiliza exclusivamente para los siguientes fines legítimos:
                    </p>
                    <ul class="list-disc pl-6 mb-4 space-y-2">
                        <li>Habilitar el funcionamiento técnico del catálogo digital y permitir a potenciales clientes
                            visualizar el stock disponible.</li>
                        <li>Facilitar el contacto directo entre clientes interesados y las concesionarias a través de
                            mensajes de WhatsApp preconfigurados.</li>
                        <li>Permitir la publicación de vehículos en plataformas de terceros (como Mercado Libre) a
                            través de nuestras integraciones en segundo plano.</li>
                        <li>Procesar cobros de planes de suscripción de manera segura mediante proveedores autorizados
                            (MercadoPago).</li>
                        <li>Mejorar continuamente la plataforma, detectar vulnerabilidades y solucionar fallas de
                            software.</li>
                    </ul>
                </section>

                <!-- Section 4 -->
                <section id="terceros" class="mb-10 scroll-mt-20">
                    <h2
                        class="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
                        4. Terceros y Compartición de Datos
                    </h2>
                    <p class="mb-4">
                        AutoDealer no vende, alquila ni comercializa datos personales con terceros. Sin embargo, para
                        proveer integraciones avanzadas, nos conectamos con las siguientes plataformas bajo estricta
                        autorización del usuario:
                    </p>
                    <ul class="list-disc pl-6 mb-4 space-y-2">
                        <li>
                            <strong>Mercado Libre:</strong> Transmitimos los detalles del inventario autorizados por el
                            usuario para publicar de forma automatizada los anuncios correspondientes.
                        </li>
                        <li>
                            <strong>MercadoPago:</strong> La gestión de facturación y cobros es procesada íntegramente
                            por MercadoPago, de forma que AutoDealer nunca almacena datos de tarjetas de crédito o
                            débito en sus servidores.
                        </li>
                        <li>
                            <strong>Meta / WhatsApp Business Cloud API:</strong> Sincronizamos los datos de stock
                            autorizados para crear ítems en el catálogo de WhatsApp y permitir la interacción directa.
                        </li>
                    </ul>
                </section>

                <!-- Section 5 -->
                <section id="derechos" class="mb-10 scroll-mt-20">
                    <h2
                        class="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
                        5. Tus Derechos sobre los Datos
                    </h2>
                    <p class="mb-4">
                        Como usuario titular de los datos, tenés derecho a:
                    </p>
                    <ul class="list-disc pl-6 mb-4 space-y-2">
                        <li><strong>Acceso:</strong> Solicitar conocer qué datos personales mantenemos sobre vos.</li>
                        <li><strong>Rectificación:</strong> Corregir información desactualizada o incorrecta en tu
                            perfil o concesionaria.</li>
                        <li><strong>Supresión:</strong> Solicitar la eliminación total de tu cuenta y los datos de tu
                            concesionaria de nuestros registros.</li>
                    </ul>
                </section>

                <!-- Section 6 (CRITICAL FOR META REVIEW) -->
                <section id="meta-eliminacion"
                    class="mb-10 scroll-mt-20 border-2 border-brand/20 dark:border-brand/35 bg-brand/[0.02] dark:bg-brand/[0.03] p-6 rounded-2xl">
                    <h2
                        class="text-xl font-bold text-slate-900 dark:text-white border-b border-brand/20 pb-3 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-brand" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        6. Instrucciones de Eliminación de Datos de Meta y Facebook
                    </h2>
                    <p class="mb-4">
                        De acuerdo con las normativas de la plataforma de desarrolladores de Meta (Facebook), los
                        usuarios que hayan iniciado sesión en AutoDealer a través de Facebook o conectado sus cuentas
                        con integraciones de Meta tienen derecho a solicitar la eliminación de las actividades de su
                        aplicación.
                    </p>
                    <p class="mb-4">
                        Si deseas eliminar tus datos y desconectar tu cuenta de Meta asociada a AutoDealer, sigue estos
                        pasos:
                    </p>
                    <ol class="list-decimal pl-6 mb-4 space-y-2">
                        <li>Ingresa a tu cuenta de Facebook.</li>
                        <li>Ve a <strong>Configuración y Privacidad</strong> &gt; <strong>Configuración</strong>.</li>
                        <li>En el menú lateral izquierdo, haz clic en <strong>Apps y sitios web</strong>.</li>
                        <li>Busca la aplicación <strong>AutoDealer</strong> en la lista y selecciónala.</li>
                        <li>Haz clic en el botón <strong>Eliminar</strong>.</li>
                        <li>Confirma la eliminación. Facebook nos enviará una solicitud técnica de desvinculación.</li>
                    </ol>
                    <p class="mb-4 font-semibold text-slate-900 dark:text-white">
                        Alternativa directa de borrado en AutoDealer:
                    </p>
                    <p class="mb-4">
                        También podés solicitar la eliminación directa e inmediata de todos los datos recuperados a
                        través de la integración de Meta enviando un correo electrónico a <a
                            href="mailto:administracion@autodealer.com.ar"
                            class="text-brand font-bold hover:underline">administracion@autodealer.com.ar</a> detallando
                        tu correo electrónico de usuario y solicitando explícitamente el borrado de tus datos de Meta.
                        Procesaremos tu solicitud en un plazo máximo de 48 horas hábiles.
                    </p>
                </section>

                <!-- Section 7 -->
                <section id="contacto" class="mb-2 scroll-mt-20">
                    <h2
                        class="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
                        7. Contacto y Soporte
                    </h2>
                    <p class="mb-4">
                        Si tenés dudas, reclamos o sugerencias sobre el tratamiento de tus datos o estas políticas,
                        ponete en contacto con nuestro equipo legal y de seguridad informática a través de:
                    </p>
                    <p class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-brand" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        administracion@autodealer.com.ar
                    </p>
                </section>

            </div>
        </div>
    </main>

    <!-- Public Footer -->
    <footer
        class="border-t border-slate-200 bg-white py-8 transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950 mt-16 text-center text-xs text-slate-400">
        <div class="max-w-7xl mx-auto px-4">
            <p>&copy; 2026 AutoDealer. Todos los derechos reservados.</p>
        </div>
    </footer>

</body>

</html>