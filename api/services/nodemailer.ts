import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async (
  to: string,
  subject: string,
  body: any
): Promise<SentMessageInfo> => {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || '',
      to,
      subject,
      html: body,
    });
    return info;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

export default sendEmail;
