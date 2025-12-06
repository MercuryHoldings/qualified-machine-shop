const express = require('express');
const nodemailer = require('nodemailer');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// hCaptcha configuration
const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET || '0x0000000000000000000000000000000000000000';
const HCAPTCHA_SITEKEY = process.env.HCAPTCHA_SITEKEY || '10000000-ffff-ffff-ffff-000000000001';

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER || 'info@qualifiedmachine.com';
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO || 'info@qualifiedmachine.com';

// Contact information (protected)
const CONTACT_INFO = {
    phone: '(858) 259-9286',
    email: 'info@qualifiedmachine.com'
};

// Create email transporter
let transporter;
if (EMAIL_PASS) {
    transporter = nodemailer.createTransporter({
        host: 'mail.privateemail.com',
        port: 465,
        secure: true,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
} else {
    console.warn('Email credentials not configured. Email sending will be simulated.');
}

// Verify hCaptcha token
async function verifyHCaptcha(token) {
    try {
        const response = await axios.post('https://hcaptcha.com/siteverify', null, {
            params: {
                secret: HCAPTCHA_SECRET,
                response: token
            }
        });
        return response.data.success;
    } catch (error) {
        console.error('hCaptcha verification error:', error);
        return false;
    }
}

// API endpoint to get hCaptcha site key
app.get('/api/hcaptcha-sitekey', (req, res) => {
    res.json({ sitekey: HCAPTCHA_SITEKEY });
});

// API endpoint to verify CAPTCHA and reveal contact info
app.post('/api/verify-captcha', async (req, res) => {
    const { token, type } = req.body;
    
    if (!token) {
        return res.status(400).json({ success: false, message: 'No token provided' });
    }
    
    const isValid = await verifyHCaptcha(token);
    
    if (isValid) {
        const data = type === 'email' ? CONTACT_INFO.email : CONTACT_INFO.phone;
        res.json({ success: true, data });
    } else {
        res.status(400).json({ success: false, message: 'Invalid CAPTCHA' });
    }
});

// API endpoint to verify form CAPTCHA
app.post('/api/verify-form-captcha', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ success: false, message: 'No token provided' });
    }
    
    const isValid = await verifyHCaptcha(token);
    res.json({ success: isValid });
});

// API endpoint to handle contact form submission
app.post('/api/contact', async (req, res) => {
    const { firstName, lastName, email, subject, message, 'h-captcha-response': captchaToken } = req.body;
    
    // Verify CAPTCHA
    const isValid = await verifyHCaptcha(captchaToken);
    if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid CAPTCHA' });
    }
    
    // Prepare email content
    const emailContent = `
New Contact Form Submission

Name: ${firstName} ${lastName}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from qualifiedmachine.com contact form
    `.trim();
    
    const confirmationContent = `
Dear ${firstName},

Thank you for contacting Qualified Machine Shop. We have received your message and will get back to you shortly.

Your message:
Subject: ${subject}
${message}

Best regards,
Qualified Machine Shop
San Diego's Precision Machining Experts
(858) 259-9286
info@qualifiedmachine.com
    `.trim();
    
    try {
        if (transporter) {
            // Send email to business
            await transporter.sendMail({
                from: EMAIL_USER,
                to: EMAIL_TO,
                subject: `Contact Form: ${subject}`,
                text: emailContent,
                replyTo: email
            });
            
            // Send confirmation to user
            await transporter.sendMail({
                from: EMAIL_USER,
                to: email,
                subject: 'Thank you for contacting Qualified Machine Shop',
                text: confirmationContent
            });
            
            res.json({ success: true, message: 'Message sent successfully!' });
        } else {
            // Simulate email sending for testing
            console.log('Contact form submission (email not configured):');
            console.log(emailContent);
            res.json({ success: true, message: 'Message received (test mode)' });
        }
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// API endpoint to handle quote form submission
app.post('/api/quote', async (req, res) => {
    const { 
        firstName, 
        lastName, 
        email, 
        phone,
        company,
        material,
        quantity,
        description,
        'h-captcha-response': captchaToken 
    } = req.body;
    
    // Verify CAPTCHA
    const isValid = await verifyHCaptcha(captchaToken);
    if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid CAPTCHA' });
    }
    
    // Prepare email content
    const emailContent = `
New Quote Request

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company || 'Not provided'}

Project Details:
Material: ${material || 'Not specified'}
Quantity: ${quantity || 'Not specified'}

Description:
${description}

---
Sent from qualifiedmachine.com quote request form
    `.trim();
    
    const confirmationContent = `
Dear ${firstName},

Thank you for requesting a quote from Qualified Machine Shop. We have received your request and will review it shortly.

Your quote request details:
Material: ${material || 'Not specified'}
Quantity: ${quantity || 'Not specified'}

We will contact you at ${email} or ${phone || 'your provided email'} with a comprehensive quote.

Best regards,
Qualified Machine Shop
San Diego's Precision Machining Experts
(858) 259-9286
info@qualifiedmachine.com
    `.trim();
    
    try {
        if (transporter) {
            // Send email to business
            await transporter.sendMail({
                from: EMAIL_USER,
                to: EMAIL_TO,
                subject: `Quote Request from ${firstName} ${lastName}`,
                text: emailContent,
                replyTo: email
            });
            
            // Send confirmation to user
            await transporter.sendMail({
                from: EMAIL_USER,
                to: email,
                subject: 'Quote Request Received - Qualified Machine Shop',
                text: confirmationContent
            });
            
            res.json({ success: true, message: 'Quote request sent successfully!' });
        } else {
            // Simulate email sending for testing
            console.log('Quote form submission (email not configured):');
            console.log(emailContent);
            res.json({ success: true, message: 'Quote request received (test mode)' });
        }
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send quote request' });
    }
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*.html', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Email configured: ${!!transporter}`);
});
