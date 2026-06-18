<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmá tu dirección de correo electrónico — AutoDealer</title>
    <style>
        /* Reset de estilos para clientes de email */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }

        /* Estilos generales */
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }

        /* Estilos responsivos */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; padding: 10px !important; }
            .content-card { padding: 24px !important; }
            .btn { width: 100% !important; text-align: center !important; box-sizing: border-box; }
        }
    </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f8fafc;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="background-color: #f8fafc; padding: 40px 0;">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" class="email-container">
                    
                    <!-- LOGO -->
                    <tr>
                        <td align="center" valign="top" style="padding: 0 0 32px 0;">
                            <a href="{{ $appUrl }}" target="_blank" style="text-decoration: none;">
                                @if(file_exists(public_path('assets/logo-h.png')))
                                    <img src="{{ $message->embed(public_path('assets/logo-h.png')) }}" alt="AutoDealer" width="180" style="display: block; font-family: sans-serif; font-size: 24px; color: #0f172a; font-weight: bold; border: 0; outline: none; max-width: 180px;">
                                @else
                                    <!-- Fallback en caso de que no exista el archivo local -->
                                    <span style="font-size: 24px; font-weight: bold; color: #0f172a; letter-spacing: -0.05em;">Auto<span style="color: #2563eb;">Dealer</span></span>
                                @endif
                            </a>
                        </td>
                    </tr>

                    <!-- CARD DE CONTENIDO -->
                    <tr>
                        <td align="left" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px;" class="content-card">
                            <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; line-height: 30px; color: #0f172a;">
                                ¡Hola, {{ $user->name }}! 👋
                            </h1>
                            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #475569;">
                                Gracias por registrarte en <strong>AutoDealer</strong>. Para poder activar tu cuenta y comenzar a configurar tu concesionario, por favor confirmá tu dirección de correo electrónico haciendo clic en el botón de abajo.
                            </p>

                            <!-- BOTON DE ACCION -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $verificationUrl }}" target="_blank" class="btn" style="background-color: #2563eb; border-radius: 8px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: 600; line-height: 50px; text-align: center; text-decoration: none; padding: 0 24px; -webkit-text-size-adjust: none; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -2px rgba(37, 99, 235, 0.1);">
                                            Verificar dirección de correo
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 20px; color: #64748b;">
                                Este enlace de verificación vencerá en 60 minutos por razones de seguridad.
                            </p>
                            <p style="margin: 0; font-size: 14px; line-height: 20px; color: #64748b;">
                                Si vos no creaste esta cuenta, no te preocupes, podés ignorar este correo de forma segura.
                            </p>

                            <!-- LINEA DIVISORIA -->
                            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0 20px 0;">

                            <!-- ENLACE ALTERNATIVO -->
                            <p style="margin: 0; font-size: 12px; line-height: 18px; color: #94a3b8; word-break: break-all;">
                                Si tenés problemas para hacer clic en el botón de arriba, copiá y pegá la siguiente dirección web en tu navegador: <br>
                                <a href="{{ $verificationUrl }}" target="_blank" style="color: #2563eb; text-decoration: underline;">{{ $verificationUrl }}</a>
                            </p>
                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td align="center" style="padding: 32px 24px 0 24px;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 18px; color: #94a3b8; text-align: center;">
                                Este es un correo automático enviado por {{ $appName }}. Por favor no respondas a este mensaje.
                            </p>
                            <p style="margin: 0; font-size: 12px; line-height: 18px; color: #94a3b8; text-align: center;">
                                &copy; {{ date('Y') }} {{ $appName }}. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>

                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
        </tr>
    </table>
</body>
</html>
