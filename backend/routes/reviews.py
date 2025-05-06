import datetime
import traceback
from flask import Blueprint, jsonify, request
from models import Review, ReviewDoctors, database
from sqlalchemy import text

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/', methods=['PUT'])
def add_review():
    data = request.get_json()
    print(data)
    doctor_ids = data.get('doctor_ids', [])
    hospital_id = data.get('hospital_id')
    user_id = data.get('user_id')
    rating = data.get('rating')
    review = data.get('comment')
    review_date = data.get('review_date')
    if not all([user_id,  hospital_id]):
        return jsonify({'message': 'Please fill all fields!'}), 400
    try:
        doctor_ids = list(map(int, doctor_ids))
        print(doctor_ids)
    except ValueError:
        return jsonify({'message': 'Invalid doctor IDs!'}), 400
    try:
        
        review_date = review_date.strip()
        print(review_date)
        review_date_final = datetime.datetime.strptime(review_date, '%Y-%m-%d')
    except Exception as e:
        print("This is the error: ", e)
        return jsonify({'message': 'Invalid date format!'}), 400


    review = Review(user_id=user_id, rating=rating, review=review, hospital_id=hospital_id, review_date=review_date_final)
    database.session.add(review)
    database.session.commit()
    for doctor_id in doctor_ids:
        database.session.add(ReviewDoctors(review_id=review.id, doctor_id=doctor_id))
    database.session.commit()
    return jsonify({'message': 'Review added successfully!'}), 201


@reviews_bp.route('/getReviews', methods = ['GET'])
def get_reviews():
    reviews = Review.query.all()
    review_list = [{'id': review.id, 'user_id': review.user_id, 'hospital_id': review.hospital_id, 'rating': review.rating, 'review': review.review, 'review_date': review.review_date} for review in reviews]
    return jsonify({'reviews': review_list}), 200





@reviews_bp.route('/filterReviews', methods=['GET'])
def filter_reviews():
    # Get parameters from query string
    hospital_id = request.args.get('hospital_id')
    doctor_id = request.args.get('doctor_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    city = request.args.get('city')
    specialization = request.args.get('specialization')

    # Validate: require at least one of hospital_id or doctor_id to filter (or adjust as needed)
    if not hospital_id and not doctor_id:
        return jsonify({'message': 'Please provide at least one filter parameter (hospital_id or doctor_id)!'}), 400

    # Convert empty strings to None
    hospital_id = hospital_id if hospital_id else None
    doctor_id = doctor_id if doctor_id else None
    start_date = start_date if start_date else None
    end_date = end_date if end_date else None
    city = city if city else None
    specialization = specialization if specialization else None

    try:
        # Log the input parameters for debugging
        print("Hospital ID:", hospital_id)
        print("Doctor ID:", doctor_id)
        print("Start Date:", start_date)
        print("End Date:", end_date)
        print("City:", city)
        print("Specialization:", specialization)

        # Call the stored procedure with all six parameters
        query = text("""
            CALL GetFilteredReviews(
                :in_hospital_id, 
                :in_doctor_id, 
                :in_start_date, 
                :in_end_date, 
                :in_city, 
                :in_specialization
            )
        """)
        result = database.session.execute(query, {
            'in_hospital_id': hospital_id,
            'in_doctor_id': doctor_id,
            'in_start_date': start_date,
            'in_end_date': end_date,
            'in_city': city,
            'in_specialization': specialization
        })

        # Fetch column names and map each row to a dict
        keys = result.keys()
        reviews = [dict(zip(keys, row)) for row in result]
        print("Reviews:", reviews)
        return jsonify({'reviews': reviews}), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching reviews', 'error': str(e)}), 500



   