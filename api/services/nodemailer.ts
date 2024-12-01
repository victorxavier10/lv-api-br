import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Boolean(process.env.MAIL_SECURE),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Função para verificar a conexão SMTP
const verifyTransporter = async () => {
  await new Promise<void>((resolve, reject) => {
    transporter.verify(function (error, success) {
      if (error) {
        console.error('Erro na verificação do transporte:', error);
        reject(error);
      } else {
        console.log('Servidor SMTP está pronto para enviar mensagens');
        resolve();
      }
    });
  });
};

const sendEmail = async (
  to: string,
  subject: string,
  body: any
): Promise<SentMessageInfo> => {
  try {
    // Verifica a conexão antes de enviar o e-mail
    await verifyTransporter();

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || '',
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
