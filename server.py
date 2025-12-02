#!/usr/bin/env python3
from flask import Flask, send_from_directory, jsonify, request
import os
import requests

app = Flask(__name__, static_folder='.')
PORT = int(os.environ.get('PORT', 10000))

# Get hCaptcha keys from environment variables
HCAPTCHA_SITE_KEY = os.environ.get('HCAPTCHA_SITE_KEY', '')
HCAPTCHA_SECRET_KEY = os.environ.get('HCAPTCHA_SECRET_KEY', '')

# Contact information (hidden until CAPTCHA is verified)
CONTACT_INFO = {
    'phone': '(619) 123-4567',
    'email': 'info@qualifiedmachine.com'
}

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

@app.route('/api/hcaptcha-sitekey', methods=['GET'])
def get_sitekey():
    """Return the hCaptcha site key for frontend use"""
    return jsonify({'sitekey': HCAPTCHA_SITE_KEY})

@app.route('/api/verify-captcha', methods=['POST'])
def verify_captcha():
    """Verify hCaptcha token and return contact information"""
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'success': False, 'error': 'No token provided'}), 400
    
    # Verify the hCaptcha token with hCaptcha servers
    verify_url = 'https://hcaptcha.com/siteverify'
    verify_data = {
        'secret': HCAPTCHA_SECRET_KEY,
        'response': token
    }
    
    try:
        response = requests.post(verify_url, data=verify_data)
        result = response.json()
        
        if result.get('success'):
            # CAPTCHA verified successfully
            info_type = data.get('type', 'email')  # 'email' or 'phone'
            
            if info_type == 'phone':
                return jsonify({
                    'success': True,
                    'data': CONTACT_INFO['phone']
                })
            else:
                return jsonify({
                    'success': True,
                    'data': CONTACT_INFO['email']
                })
        else:
            return jsonify({
                'success': False,
                'error': 'CAPTCHA verification failed'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/submit-contact', methods=['POST'])
def submit_contact():
    """Handle contact form submission with CAPTCHA verification"""
    data = request.get_json()
    token = data.get('h-captcha-response')
    
    if not token:
        return jsonify({'success': False, 'error': 'No CAPTCHA token provided'}), 400
    
    # Verify the hCaptcha token
    verify_url = 'https://hcaptcha.com/siteverify'
    verify_data = {
        'secret': HCAPTCHA_SECRET_KEY,
        'response': token
    }
    
    try:
        response = requests.post(verify_url, data=verify_data)
        result = response.json()
        
        if result.get('success'):
            # CAPTCHA verified - process the form
            # Here you would normally send an email or save to database
            return jsonify({
                'success': True,
                'message': 'Thank you for your message. We will get back to you soon!'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'CAPTCHA verification failed'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
