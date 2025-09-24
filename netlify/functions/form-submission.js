// Netlify Function to handle form submissions and send email confirmations
// This function is triggered automatically when a form is submitted

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Parse the form submission
    const data = JSON.parse(event.body);
    const { name, email, phone, company, form_name } = data;

    // Import your email service (using SendGrid as example)
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Determine which email template to use based on form name
    let emailTemplate = getEmailTemplate(form_name, { name, email, phone, company });

    // Send confirmation email to the user
    const userMsg = {
      to: email,
      from: {
        email: process.env.FROM_EMAIL || 'noreply@perfectaimarketing.com',
        name: 'Perfect AIm Marketing'
      },
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html
    };

    // Send notification email to your team
    const adminMsg = {
      to: process.env.ADMIN_EMAIL || 'team@perfectaimarketing.com',
      from: {
        email: process.env.FROM_EMAIL || 'noreply@perfectaimarketing.com',
        name: 'Perfect AIm Forms'
      },
      subject: `New ${form_name} submission from ${name}`,
      text: `New form submission:\n\nForm: ${form_name}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nCompany: ${company || 'N/A'}`,
      html: `
        <h2>New Form Submission</h2>
        <table style="width: 100%; max-width: 600px;">
          <tr><td><strong>Form:</strong></td><td>${form_name}</td></tr>
          <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
          <tr><td><strong>Phone:</strong></td><td>${phone || 'N/A'}</td></tr>
          <tr><td><strong>Company:</strong></td><td>${company || 'N/A'}</td></tr>
        </table>
      `
    };

    // Send both emails
    await Promise.all([
      sgMail.send(userMsg),
      sgMail.send(adminMsg)
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Emails sent successfully' })
    };

  } catch (error) {
    console.error('Error sending email:', error);

    // Still return 200 to not break the form submission
    // Log error for debugging
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Form received but email failed',
        error: error.toString()
      })
    };
  }
};

// Email template function
function getEmailTemplate(formName, data) {
  const templates = {
    'medcor-contact': {
      subject: 'Thank You for Contacting MedCor AI',
      text: `Dear ${data.name},\n\nThank you for your interest in MedCor AI. We've received your request and our team will contact you within 24 hours to discuss how we can help transform your practice.\n\nBest regards,\nThe MedCor AI Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Contacting MedCor AI</h1>
            </div>
            <div class="content">
              <p>Dear ${data.name},</p>
              <p>Thank you for your interest in MedCor AI. We've received your request and are excited to help you transform your practice with our HIPAA-compliant AI solutions.</p>
              <h3>What Happens Next:</h3>
              <ul>
                <li>Our specialist will review your requirements</li>
                <li>We'll contact you within 24 hours</li>
                <li>Schedule a personalized consultation</li>
                <li>Begin your AI transformation journey</li>
              </ul>
              <p>In the meantime, you can schedule a call directly:</p>
              <a href="https://calendar.app.google/QDanmN7CQLEnZZ7WA" class="button">Schedule Consultation</a>
            </div>
            <div class="footer">
              <p>© 2024 Perfect AIm Marketing. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    'aireceptionist-contact': {
      subject: 'Your 24/7 AI Receptionist is Almost Ready!',
      text: `Hi ${data.name},\n\nThank you for choosing our 24/7 AI Receptionist service. We'll have your virtual receptionist ready within 48 hours!\n\nOur team will call you within 24 hours to finalize the setup.\n\nBest regards,\nThe AI Receptionist Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .checklist { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your AI Receptionist is Almost Ready!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Thank you for choosing our 24/7 AI Receptionist service. We're excited to help you never miss another call!</p>
              <div class="checklist">
                <h3>✓ What's Included:</h3>
                <ul>
                  <li>24/7 call answering in your business voice</li>
                  <li>Intelligent appointment scheduling</li>
                  <li>Custom greetings and responses</li>
                  <li>Real-time call transcripts</li>
                  <li>Integration with your calendar</li>
                </ul>
              </div>
              <p><strong>Next Steps:</strong> Our specialist will call you within 24 hours to complete your setup.</p>
            </div>
            <div class="footer">
              <p>© 2024 Perfect AIm Marketing. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    // Default template for other forms
    'default': {
      subject: 'Thank You for Contacting Perfect AIm Marketing',
      text: `Hi ${data.name},\n\nThank you for reaching out to Perfect AIm Marketing. We've received your message and will get back to you within 24 hours.\n\nBest regards,\nThe Perfect AIm Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Contacting Us</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Thank you for reaching out to Perfect AIm Marketing. We've received your message and appreciate your interest in our AI-powered marketing solutions.</p>
              <p>Our team will review your request and get back to you within 24 hours.</p>
              <p>We look forward to helping you transform your marketing with AI!</p>
            </div>
            <div class="footer">
              <p>© 2024 Perfect AIm Marketing. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  };

  return templates[formName] || templates['default'];
}