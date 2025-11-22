const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  /**
   * Inicializar configuración de nodemailer
   */
  initializeTransporter() {
    try {
      // Configuración desde variables de entorno
      const port = parseInt(process.env.SMTP_PORT) || 587;
      const config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: port,
        secure: port === 465, // true solo para puerto 465 (SSL directo), false para 587 (STARTTLS)
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        // Opciones adicionales para STARTTLS
        tls: {
          rejectUnauthorized: false // Solo en desarrollo, en producción debe ser true
        }
      };

      // Verificar que las credenciales estén configuradas
      if (!config.auth.user || !config.auth.pass) {
        logger.warn('Credenciales SMTP no configuradas. El envío de emails está deshabilitado.');
        this.isConfigured = false;
        return;
      }

      this.transporter = nodemailer.createTransport(config);
      this.isConfigured = true;

      // Verificar conexión (opcional, no bloquea el inicio del servidor)
      if (process.env.NODE_ENV === 'development' && process.env.VERIFY_SMTP === 'true') {
        this.transporter.verify((error, success) => {
          if (error) {
            logger.warn('SMTP no disponible (esto no afecta el funcionamiento del sistema):', error.message);
          } else {
            logger.info('✓ Servidor SMTP listo para enviar emails');
          }
        });
      } else {
        logger.info('Servicio de email configurado (verificación deshabilitada)');
      }

    } catch (error) {
      logger.error('Error inicializando EmailService:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   * @param {string} to - Email destinatario
   * @param {string} userName - Nombre del usuario
   * @param {string} resetToken - Token de recuperación
   * @returns {Promise<boolean>}
   */
  async sendPasswordResetEmail(to, userName, resetToken) {
    if (!this.isConfigured) {
      logger.warn('EmailService no configurado. No se puede enviar email.');
      // En desarrollo, loguear el link para testing
      if (process.env.NODE_ENV === 'development') {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        logger.info('=== EMAIL DE RECUPERACIÓN (MODO DESARROLLO) ===');
        logger.info(`Para: ${to}`);
        logger.info(`Nombre: ${userName}`);
        logger.info(`URL de recuperación: ${resetUrl}`);
        logger.info('===============================================');
      }
      return false;
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      const expirationMinutes = process.env.PASSWORD_RESET_EXPIRATION_MINUTES || 60;

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Archivo Electrónico Municipal - AEM'}" <${process.env.SMTP_USER}>`,
        to: to,
        subject: 'Recuperación de Contraseña - AEM',
        html: this.getPasswordResetTemplate(userName, resetUrl, expirationMinutes)
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email de recuperación enviado a ${to}:`, info.messageId);

      return true;

    } catch (error) {
      logger.error('Error enviando email de recuperación:', error);
      return false;
    }
  }

  /**
   * Template HTML para email de recuperación
   * @param {string} userName 
   * @param {string} resetUrl 
   * @param {number} expirationMinutes 
   * @returns {string}
   */
  getPasswordResetTemplate(userName, resetUrl, expirationMinutes) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de Contraseña</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #3f37c9; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">
                Recuperación de Contraseña
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola <strong>${userName}</strong>,
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el 
                <strong>Archivo Electrónico Municipal - AEM</strong>.
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Para restablecer tu contraseña, haz clic en el siguiente botón:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #3f37c9; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                      Restablecer Contraseña
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
              </p>
              
              <p style="color: #3f37c9; font-size: 14px; word-break: break-all; background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 0 0 30px 0;">
                ${resetUrl}
              </p>
              
              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">
                      ⚠️ <strong>Importante:</strong> Este enlace expirará en <strong>${expirationMinutes} minutos</strong> 
                      y solo puede ser utilizado una vez.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje de forma segura.
                Tu contraseña actual no será modificada.
              </p>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                Por seguridad, te recomendamos no compartir este enlace con nadie.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef;">
              <p style="color: #6c757d; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                Este es un mensaje automático, por favor no respondas a este email.
              </p>
              <p style="color: #6c757d; font-size: 12px; line-height: 1.6; margin: 10px 0 0 0; text-align: center;">
                &copy; ${new Date().getFullYear()} Archivo Electrónico Municipal - AEM. Todos los derechos reservados.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Enviar email de bienvenida a nuevo usuario
   * @param {string} to - Email destinatario
   * @param {string} userName - Nombre del usuario
   * @param {string} fullName - Nombre completo del usuario
   * @param {string} temporaryPassword - Contraseña temporal
   * @param {string} roleName - Nombre del rol asignado
   * @returns {Promise<boolean>}
   */
  async sendWelcomeEmail(to, userName, fullName, temporaryPassword, roleName) {
    if (!this.isConfigured) {
      logger.warn('EmailService no configurado. No se puede enviar email.');
      // En desarrollo, loguear las credenciales para testing
      if (process.env.NODE_ENV === 'development') {
        logger.info('=== EMAIL DE BIENVENIDA (MODO DESARROLLO) ===');
        logger.info(`Para: ${to}`);
        logger.info(`Nombre completo: ${fullName}`);
        logger.info(`Usuario: ${userName}`);
        logger.info(`Contraseña temporal: ${temporaryPassword}`);
        logger.info(`Rol: ${roleName}`);
        logger.info(`URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);
        logger.info('============================================');
      }
      return false;
    }

    try {
      const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Archivo Electrónico Municipal - AEM'}" <${process.env.SMTP_USER}>`,
        to: to,
        subject: 'Bienvenido al Archivo Electrónico Municipal - AEM',
        html: this.getWelcomeTemplate(userName, fullName, temporaryPassword, roleName, loginUrl)
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email de bienvenida enviado a ${to}:`, info.messageId);

      return true;

    } catch (error) {
      logger.error('Error enviando email de bienvenida:', error);
      return false;
    }
  }

  /**
   * Template HTML para email de bienvenida
   * @param {string} userName 
   * @param {string} fullName 
   * @param {string} temporaryPassword 
   * @param {string} roleName 
   * @param {string} loginUrl 
   * @returns {string}
   */
  getWelcomeTemplate(userName, fullName, temporaryPassword, roleName, loginUrl) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido al AEM</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #3f37c9; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">
                ¡Bienvenido al AEM!
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">
                Archivo Electrónico Municipal
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola <strong>${fullName}</strong>,
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Se ha creado una cuenta para ti en el <strong>Archivo Electrónico Municipal - AEM</strong>.
                A continuación encontrarás tus credenciales de acceso:
              </p>
              
              <!-- Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 0 0 30px 0; border: 1px solid #e9ecef;">
                <tr>
                  <td style="padding: 25px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6c757d; font-size: 14px; display: inline-block; width: 140px;">👤 Usuario:</span>
                          <span style="color: #212529; font-size: 15px; font-weight: bold;">${userName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6c757d; font-size: 14px; display: inline-block; width: 140px;">🔑 Contraseña:</span>
                          <span style="color: #212529; font-size: 15px; font-weight: bold; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 4px 8px; border-radius: 4px;">${temporaryPassword}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6c757d; font-size: 14px; display: inline-block; width: 140px;">🛡️ Rol asignado:</span>
                          <span style="color: #212529; font-size: 15px; font-weight: bold;">${roleName}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">
                      ⚠️ <strong>Importante:</strong> Por seguridad, se te solicitará cambiar esta contraseña 
                      en tu primer inicio de sesión.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="${loginUrl}" 
                       style="background-color: #3f37c9; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                      Iniciar Sesión
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
              </p>
              
              <p style="color: #3f37c9; font-size: 14px; word-break: break-all; background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 0 0 30px 0;">
                ${loginUrl}
              </p>
              
              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="color: #0c5460; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                      <strong>📋 Sobre el Sistema:</strong>
                    </p>
                    <p style="color: #0c5460; font-size: 14px; line-height: 1.6; margin: 0;">
                      El Archivo Electrónico Municipal (AEM) es un sistema de gestión documental que te 
                      permitirá organizar, consultar y administrar documentos de manera eficiente y segura.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                Si tienes alguna duda sobre el uso del sistema o necesitas ayuda, no dudes en contactar 
                con el administrador del sistema.
              </p>
              
              <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                Saludos cordiales,<br>
                <strong>Equipo del Archivo Electrónico Municipal</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef;">
              <p style="color: #6c757d; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                Este es un mensaje automático, por favor no respondas a este email.
              </p>
              <p style="color: #6c757d; font-size: 12px; line-height: 1.6; margin: 10px 0 0 0; text-align: center;">
                &copy; ${new Date().getFullYear()} Archivo Electrónico Municipal - AEM. Todos los derechos reservados.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Enviar email genérico
   * @param {Object} options - Opciones del email
   * @returns {Promise<boolean>}
   */
  async sendEmail(options) {
    if (!this.isConfigured) {
      logger.warn('EmailService no configurado. No se puede enviar email.');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Archivo Electrónico Municipal - AEM'}" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html || options.text
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email enviado a ${options.to}:`, info.messageId);

      return true;

    } catch (error) {
      logger.error('Error enviando email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
