import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const smtpOptions: SMTPTransport.Options = {
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};

const transporter = nodemailer.createTransport(smtpOptions);

const sendEmail = async (
  to: string,
  subject: string,
  body: any
): Promise<nodemailer.SentMessageInfo> => {
  try {
    // Verifica a conexão SMTP (opcional, mas recomendado)
    await transporter.verify();

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || 'no-reply@lavarauto.com',
      to,
      subject,
      html: body,
    });

    console.log('E-mail enviado:', info);
    return info;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
};

export default sendEmail;
