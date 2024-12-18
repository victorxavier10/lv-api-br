import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

const transporter = nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN || '',
  })
);

const sendEmail = async (
  to: string | string[],
  subject: string,
  body: string,
  text: string,
  messageId: string
): Promise<nodemailer.SentMessageInfo> => {
  try {
    const from = {
      address: process.env.MAIL_FROM || 'no-reply@lavarcarro.com',
      name: 'Lavar Carro',
    };

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html: body,
      text,
      messageId
    });

    console.log('E-mail enviado:', info);
    return info;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
};

export default sendEmail;
