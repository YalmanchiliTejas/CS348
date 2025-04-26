from flask import Blueprint, jsonify, request
from models import Hospital, database

hospitals_bp = Blueprint('hospitals', __name__)

@hospitals_bp.route('/', methods=['GET'])
def get_hospitals():
    hospitals = Hospital.query.all()
    hopsital_list = [{'id': hospital.id, 'name': hospital.name, 'city': hospital.city, 'state': hospital.state, 'address': hospital.address} for hospital in hospitals]
    return jsonify({"hospitals": hopsital_list}), 200

@hospitals_bp.route('/<int:name>', methods=['GET'])
def get_hospital(name):
    # hospital = Hospital.query.get(id)
   

    name = request.args.get('name')
    if not name:
        return jsonify({"message": "Hospital name is required for search!"}), 400
    
    # Perform a case-insensitive search using ilike
    hospital = Hospital.query.filter(Hospital.name.ilike(f'%{name}%')).first()
    if not hospital:
        return jsonify({"message": "Hospital not found!"}), 404
    return jsonify({"hospital": {
        'id': hospital.id,
        'name': hospital.name,
        'city': hospital.city,
        'state': hospital.state,
        'address': hospital.address
    }}), 200
   
@hospitals_bp.route('/', methods=['POST'])
def add_hospital():
    data = request.get_json()
    name = data.get('name')
    city = data.get('city')
    state = data.get('state')
    address = data.get('address')
    if not name or not city or not state or not address:
        return jsonify({'message': 'Please fill all fields!'}), 400
    hospital = Hospital(name=name, city=city, state=state, address=address)
    database.session.add(hospital)
    database.session.commit()
    return jsonify({'message': 'Hospital added successfully!'}), 201

