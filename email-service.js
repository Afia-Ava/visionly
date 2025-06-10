// Minimal Email Service for Visionly Email Test

const emailService = {
    emailjsServiceId: 'service_gg1zgp9',
    emailjsTemplateId: 'template_daily_reminder',
    emailjsPublicKey: 'oesbudg4uybAuA3Ux',
    init() {
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS library not loaded.');
            return false;
        }
        try {
            emailjs.init(this.emailjsPublicKey);
            console.log('EmailJS initialized with public key:', this.emailjsPublicKey);
            return true;
        } catch (e) {
            console.error('Failed to initialize EmailJS:', e);
            return false;
        }
    },
    async testEmail(email) {
        console.log('testEmail called with:', {
            serviceId: this.emailjsServiceId,
            templateId: this.emailjsTemplateId,
            email
        });
        try {
            const result = await emailjs.send(
                this.emailjsServiceId,
                this.emailjsTemplateId,
                {
                    to_email: email,
                    to_name: 'Visionly User',
                    message: 'This is a test email from Visionly!'
                }
            );
            console.log('Email sent successfully:', result);
            return { success: true, result };
        } catch (error) {
            console.error('Failed to send test email:', error);
            return { success: false, error: error.text || error.message };
        }
    },
    async testWeeklyEmail(email) {
        console.log('testWeeklyEmail called with:', {
            serviceId: this.emailjsServiceId,
            templateId: 'template_weekly_reminder',
            email
        });
        try {
            const result = await emailjs.send(
                this.emailjsServiceId,
                'template_weekly_reminder',
                {
                    to_email: email,
                    to_name: 'Visionly User',
                    message: 'This is a test weekly reminder email from Visionly!'
                }
            );
            console.log('Weekly email sent successfully:', result);
            return { success: true, result };
        } catch (error) {
            console.error('Failed to send weekly email:', error);
            return { success: false, error: error.text || error.message };
        }
    }
};

window.emailService = emailService;
