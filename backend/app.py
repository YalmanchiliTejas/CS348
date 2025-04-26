from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from routes.hopsitals import hospitals_bp
from routes.doctors import doctors_bp
from routes.auth import auth_bp
from routes.reviews import reviews_bp
from models import database

# Initialize the Flask app
app = Flask(__name__)

# Load configuration from the Config class
app.config.from_object(Config)

# Enable CORS for the app
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


# Initialize the database with the app
database.init_app(app)

# Register blueprints for different routes
app.register_blueprint(hospitals_bp, url_prefix='/hospitals')
app.register_blueprint(doctors_bp, url_prefix='/doctors')
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(reviews_bp, url_prefix='/reviews')
initialized = False

# Create tables before the first request
@app.before_request
def create_tables():
    global initialized
    if not initialized:
        database.create_all()
        initialized = True
# @app.route('/example', methods=['OPTIONS'])
# def handle_options():
#     response = jsonify({'message': 'CORS preflight handled'})
#     response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
#     response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
#     return response


if __name__ == '__main__':
    # Run the app in debug mode
    app.run(debug=True)
