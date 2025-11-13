import nodemailer from 'nodemailer';
import { WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE } from './templates';


export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const baseAppUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://your-nexus-trade-domain.com').replace(/\/+$/, '');
    const logoUrl = process.env.NEXT_PUBLIC_WELCOME_EMAIL_LOGO_URL || `${baseAppUrl}/images/nexus-trade-logo.png`;
    const previewUrl = process.env.NEXT_PUBLIC_WELCOME_EMAIL_PREVIEW_URL || `${baseAppUrl}/images/nexus-trade-dashboard.png`;
    const dashboardUrl = `${baseAppUrl}/dashboard`;
    const unsubscribeUrl = `${baseAppUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
    const siteUrl = baseAppUrl;

    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro)
        .replace('{{logoUrl}}', logoUrl)
        .replace('{{previewUrl}}', previewUrl)
        .replace('{{dashboardUrl}}', dashboardUrl)
        .replace('{{unsubscribeUrl}}', unsubscribeUrl)
        .replace('{{siteUrl}}', siteUrl);

    const mailOptions = {
        from: `"Nexus Trade" <nexustrade@gmail.com>`,
        to: email,
        subject: `Welcome to Nexus Trade – your market edge starts now`,
        text: 'Thanks for joining Nexus Trade',
        html: htmlTemplate,
    }

    await transporter.sendMail(mailOptions);
}

export const sendNewsSummaryEmail = async (
    { email, date, newsContent }: { email: string; date: string; newsContent: string }
): Promise<void> => {
const escapedNewsContent = newsContent.replace(/\$/g, '$$$$');
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', escapedNewsContent);
        
    const mailOptions = {
        from: `"NexusTrade News" <nexustrade@gmail.com>`,
        to: email,
        subject: `📈 Market News Summary Today - ${date}`,
        text: `Today's market news summary from NexusTrade`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};


