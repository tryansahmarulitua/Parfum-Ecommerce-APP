<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Email</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #f7f5f0; font-family: Arial, Helvetica, sans-serif; color: #000000;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border: 3px solid #000000; box-shadow: 6px 6px 0px #000000; border-radius: 8px; padding: 32px; box-sizing: border-box;" cellspacing="0" cellpadding="0" border="0">
                    <!-- Header / Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 24px; border-bottom: 3px solid #000000;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">
                                PARFUM<span style="background-color: #FFC700; padding: 2px 6px; border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; margin-left: 4px;">STORE</span>
                            </h1>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding-top: 24px; padding-bottom: 24px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800;">
                                Halo, {{ $user->name }}! 👋
                            </h2>
                            <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; font-weight: 600; color: #222222;">
                                Terima kasih telah mendaftar di <strong>Becca Parfum Store</strong>. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda.
                            </p>

                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="{{ $url }}" style="display: inline-block; background-color: #FFC700; color: #000000; font-weight: 900; font-size: 15px; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border: 3px solid #000000; box-shadow: 4px 4px 0px #000000; border-radius: 6px;">
                                    Verifikasi Email Sekarang
                                </a>
                            </div>

                            <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.5; color: #555555; font-weight: 500;">
                                Jika Anda tidak merasa membuat akun ini, silakan abaikan email ini.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer Link Copy -->
                    <tr>
                        <td style="padding-top: 20px; border-top: 3px solid #000000;">
                            <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #333333;">
                                Tombol bermasalah? Salin link berikut ke browser:
                            </p>
                            <p style="margin: 0; font-size: 11px; word-break: break-all; background-color: #f0f0f0; border: 2px solid #000000; padding: 8px; border-radius: 4px; font-family: monospace;">
                                {{ $url }}
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Bottom Footer -->
                <p style="margin-top: 24px; font-size: 12px; font-weight: 700; color: #666666;">
                    © {{ date('Y') }} Becca Parfum Store. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
