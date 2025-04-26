from flask import Blueprint, jsonify, request
from models import database, Doctor
from config import Config
from sqlalchemy import text

doctors_bp = Blueprint('doctors', __name__)

@doctors_bp.route('/<int:id>', methods=['GET'])
def get_doctors(id):
    doctors = Doctor.query.filter_by(hospital_id=id).all()
    doctor_list = [{'id': doctor.id, 'name': doctor.name, 'specialization': doctor.specialization, 'hospital_id': doctor.hospital_id} for doctor in doctors]
    return jsonify({"doctors": doctor_list}), 200
@doctors_bp.route('/<int:id>', methods=['POST'])
def add_doctor(id):
    data = request.get_json()
    print(data)
    name = data.get('name')
    specialization = data.get('speciality')
    print(name)
    print(specialization)
    if not name or not specialization:
        return jsonify({'message': 'Please fill all fields!'}), 400
    doctor = Doctor(name=name, specialization=specialization, hospital_id=id)
    database.session.add(doctor)
    database.session.commit()
    return jsonify({'message': 'Doctor added successfully!'}), 201

@doctors_bp.route('/<int:id>', methods=['PUT'])
def update_doctor(id):
    data = request.get_json()
    doctor = Doctor.query.get(id)
    if not doctor:
        return jsonify({'message': 'Doctor not found!'}), 404
    doctor.name = data.get('name')
    doctor.specialization = data.get('speciality')
    database.session.commit()
    return jsonify({'message': 'Doctor updated successfully!'}), 200

@doctors_bp.route('/<int:id>', methods=['DELETE'])
def delete_doctor(id):
    doctor = Doctor.query.get(id)
    if not doctor:
        return jsonify({'message': 'Doctor not found!'}), 404
    
    try:
        database.session.execute(text('CALL DELETEDOC(:in_id)'), {'in_id': id})
        database.session.commit()
        return jsonify({'message': 'Doctor deleted successfully!'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@doctors_bp.route('/<int:id>', methods=['PATCH'])
def update_doctor_hospital(id):
    data = request.get_json()
    doctor = Doctor.query.get(id)
    if not doctor:
        return jsonify({'message': 'Doctor not found!'}), 404
    doctor.hospital_id = data.get('hospital_id')
    database.session.commit()
    return jsonify({'message': 'Doctor updated successfully!'}), 200