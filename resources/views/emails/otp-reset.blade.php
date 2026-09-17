<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode OTP Lupa Password</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #f7f5f0; font-family: Arial, Helvetica, sans-serif; color: #000000;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border: 3px solid #000000; box-shadow: 6px 6px 0px #000000; border-radius: 8px; padding: 32px; box-sizing: border-box;" cellspacing="0" cellpadding="0" border="0">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding-bottom: 24px; border-bottom: 3px solid #000000;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">
                                PARFUM<span style="background-color: #FFC700; padding: 2px 6px; border: 2px solid #000000; box-shadow: 2px 2px 0px #000000; margin-left: 4px;">STORE</span>
                            </h1>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding-top: 24px; padding-bottom: 24px; text-align: center;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800;">
                                Kode OTP Reset Password 🔐
                            </h2>
                            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; font-weight: 600; color: #222222;">
                                Gunakan kode OTP di bawah ini untuk mereset password akun Anda. Kode ini berlaku selama <strong>15 menit</strong>.
                            </p>

                            <!-- OTP Box -->
                            <div style="display: inline-block; background-color: #FFC700; color: #000000; font-weight: 900; font-size: 32px; letter-spacing: 10px; padding: 16px 32px; border: 3px solid #000000; box-shadow: 5px 5px 0px #000000; border-radius: 8px; margin: 10px 0 24px 0; font-family: monospace;">
                                {{ $otp }}
                            </div>

                            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #555555; font-weight: 500;">
                                Jangan berikan kode OTP ini kepada siapapun. Jika Anda tidak meminta reset password, abaikan email ini.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding-top: 20px; border-top: 3px solid #000000; text-align: center;">
                            <p style="margin: 0; font-size: 12px; font-weight: 700; color: #666666;">
                                © {{ date('Y') }} Becca Parfum Store. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
