import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: config.SMTPHOST?.toString(),
    port: parseInt(config.SMTPPORT as string),
    secure: false,
    auth: {
      user: config.SMTPUSER,
      pass: config.SMTPPASS
    }
  });

  await transporter.sendMail({
    from: `${config.FROMNAME} <${config.FROMEMAIL}>`,
    to,
    subject,
    html
  });
};
