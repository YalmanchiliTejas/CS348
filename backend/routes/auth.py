from flask import Blueprint, jsonify, request, current_app
from models import database, User
from config import Config
from sqlalchemy import text
from werkzeug.security import generate_password_hash, check_password_hash # type: ignore

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print(data)
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    password = password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)
    if  not email or not password or not role:
        return jsonify({'message': 'Please fill all fields!'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists!'}), 400
    user = User(email=email, password=password, role=role)
    database.session.add(user)
    database.session.commit()
    return jsonify({'message': 'User created successfully!'})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print(data)
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found!'}), 400
    if not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid credentials!'}), 400
    return jsonify({'message': 'Login successful!', 'user':{
        'id': user.id,
        'email': user.email,
        'role': user.role
    }}), 200



