from flask import Flask, request, jsonify
import firebase_admin
import sendgrid
from sendgrid.helpers.mail import Mail, To
import os

# Initialize Flask app
app = Flask(__name__)

# Initialize Firebase Admin SDK
firebase_admin.initialize_app()

# Get SendGrid API key from environment variables
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')

# Initialize SendGrid client
sg = sendgrid.SendGridAPIClient(SENDGRID_API_KEY)

# Cloud Function to send an email with the verification code
@app.route('/send_verification_email', methods=['POST'])
def send_verification_email():
    data = request.get_json()
    email = data.get('email')
    verification_code = data.get('verificationCode')

    if not email or not verification_code:
        return jsonify({'success': False, 'message': 'Email and verification code are required'}), 400

    try:
        message = Mail(
            from_email='your-email@example.com',  # Replace with your verified SendGrid email
            to_emails=To(email),
            subject='Your Verification Code',
            html_content=f'<strong>Your verification code is: {verification_code}</strong>'
        )
        response = sg.send(message)
        return jsonify({'success': True, 'status_code': response.status_code}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# This ensures the app is recognized as the main entry point by Firebase
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)
