import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resendApiKey = process.env.RESEND_API_KEY;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const fallbackTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

export type MailTemplateType =
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'payment_rejected'
  | 'booking_cancelled';

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailParams) {
  if (resend) {
    try {
      await resend.emails.send({
        from: process.env.MAIL_FROM || 'Agendamentos <no-reply@example.com>',
        to,
        subject,
        html,
      });
      return;
    } catch (e) {
      console.error('Error sending email with Resend, falling back to nodemailer', e);
    }
  }

  await fallbackTransport.sendMail({
    from: process.env.MAIL_FROM || 'Agendamentos <no-reply@example.com>',
    to,
    subject,
    html,
  });
}
