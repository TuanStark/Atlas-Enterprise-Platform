import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as Handlebars from 'handlebars';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly isDevFallback: boolean = false;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('mail.host');
    const port = this.configService.get<number>('mail.port') || 587;
    const user = this.configService.get<string>('mail.user');
    const pass = this.configService.get<string>('mail.pass');
    const secure = this.configService.get<boolean>('mail.secure') || false;
    this.fromAddress =
      this.configService.get<string>('mail.from') || 'Atlas Platform <noreply@atlas.com>';

    if (!host || !user || !pass) {
      this.logger.warn(
        'SMTP configurations are incomplete. MailService will run in DEV FALLBACK mode (logging emails to the console).',
      );
      this.isDevFallback = true;
    } else {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (this.isDevFallback || !this.transporter) {
      this.logger.log(
        `\n======================================================\n[Dev Mail Service - Output]\nTo: ${to}\nSubject: ${subject}\nBody (HTML):\n${html}\n======================================================\n`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html,
      });
      this.logger.log(`Email successfully sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  async sendMailWithTemplate(
    to: string,
    subject: string,
    templateName: string,
    context: Record<string, any>,
  ): Promise<void> {
    try {
      let templatePath = path.resolve(
        __dirname,
        '../../../common/templates',
        `${templateName}.hbs`,
      );

      try {
        await fs.access(templatePath);
      } catch {
        templatePath = path.resolve(
          __dirname,
          '../../../../common/templates',
          `${templateName}.hbs`,
        );
      }

      const templateSource = await fs.readFile(templatePath, 'utf8');
      const compiledTemplate = Handlebars.compile(templateSource);
      const html = compiledTemplate(context);

      await this.sendMail(to, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send template email to ${to}:`, error);
      throw error;
    }
  }
}
