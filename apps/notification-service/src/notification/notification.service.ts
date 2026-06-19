import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class NotificationService {
    private readonly isMock: boolean;

    constructor(private configService: ConfigService) {
        this.isMock = this.configService.get<string>('EMAIL_MODE') === 'mock';

        if (!this.isMock) {
            const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
            if (!apiKey) {
                throw new Error('SENDGRID_API_KEY is missing from environment variables');
            }
            sgMail.setApiKey(apiKey);
        }
    }

    async sendEmail(
        to: string,
        subject: string,
        templateId: string,
        dynamicData: Record<string, any>,) {

        if (this.isMock) {
            console.log('mock email');
            console.log({ to, subject, templateId, dynamicData });
            return;
        }

        const from = this.configService.get<string>('SENDGRID_SENDER_EMAIL');
        if (!from) {
            throw new BadRequestException(
                'SENDGRID_SENDER_EMAIL is not defined in the configuration',
            );
        }
        const msg: any = {
            to,
            from,
            subject,
            templateId,
            dynamicTemplateData: dynamicData,
        };
        try {
            await sgMail.send(msg);
        } catch (error: any) {
            console.log('SendGrid Error:', error.response?.body || error.message);
            throw error;
        }
    }

}
