// netlify/functions/save-to-sheets.js
// Updated to match YOUR exact Google Sheet column names

exports.handler = async (event, context) => {
    // Your Google Apps Script URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz5RYK6nn-pACsuIizdeh5ZvzSZ0JhS-oQUUXxqO4giY-tsuXWeU9pL8VK9aIDDw0sh/exec';
    
    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }
    
    try {
        // Parse form submission from Netlify
        const submission = JSON.parse(event.body);
        const formData = submission.payload.data;
        
        // Create consent record - matching YOUR Google Sheet column names exactly
        const consentRecord = {
            // User info
            email: formData.email || '',
            phone: formData.phone || '',
            first_name: formData.first_name || '',
            last_name: formData.last_name || '',
            
            // IMPORTANT: These names must match your Google Sheet columns EXACTLY
            consent_appts: formData.consent_appointments === 'on' ? 'YES' : 'NO',     // Sheet has "consent appts"
            consent_marketing: formData.consent_promotional === 'on' ? 'YES' : 'NO',   // Sheet has "consent marketing"
            
            // Other tracking data
            timestamp: new Date().toISOString(),
            ip_address: event.headers['x-forwarded-for'] || 'unknown',
            status: 'active'
        };
        
        // Send to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(consentRecord)
        });
        
        // Log for debugging
        console.log('Consent saved:', {
            email: consentRecord.email,
            appointments: consentRecord.consent_appts,
            marketing: consentRecord.consent_marketing
        });
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true,
                message: 'Consent recorded successfully'
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to save consent'
            })
        };
    }
};