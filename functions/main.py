import os
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS to handle cross-origin requests
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/send_verification_email', methods=['POST'])
def send_verification_email():
    try:
        data = request.get_json()
        email = data.get('email')
        verification_code = data.get('verificationCode')

        if not email or not verification_code:
            return jsonify({'success': False, 'message': 'Email and verification code are required'}), 400

        # Create the message for SendGrid
        message = Mail(
            from_email='your-email@example.com',  # Use your verified SendGrid email
            to_emails=email,
            subject='Your Verification Code',
            html_content=f'<strong>Your verification code is: {verification_code}</strong>'
        )

        # Get SendGrid API Key from environment variable
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))

        # Send the email
        response = sg.send(message)

        # Check if the response is successful
        if response.status_code == 202:
            return jsonify({'success': True, 'message': 'Verification email sent successfully'}), 200
        else:
            return jsonify({'success': False, 'message': f'Failed to send email. Status code: {response.status_code}'}), 500

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)
