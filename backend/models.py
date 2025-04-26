from flask_sqlalchemy import SQLAlchemy

database = SQLAlchemy()

class Doctor(database.Model):
    __tablename__ = 'doctors'
    id = database.Column(database.Integer, primary_key=True)
    name = database.Column(database.String(100), nullable=False)
    hospital_id = database.Column(database.Integer, database.ForeignKey('hospitals.id'))
    specialization = database.Column(database.String(100))
    reviews = database.relationship('ReviewDoctors', backref='doctor', lazy=True)

class Hospital(database.Model):
    __tablename__ = 'hospitals'
    id = database.Column(database.Integer, primary_key=True)
    name = database.Column(database.String(100))
    city = database.Column(database.String(100))
    state = database.Column(database.String(100))
    address = database.Column(database.String(250))
    doctors = database.relationship('Doctor', backref='hospital', lazy=True)
    reviews = database.relationship('Review', backref='hospital', lazy=True)


class User(database.Model):
    __tablename__ = 'users'
    id = database.Column(database.Integer, primary_key=True)
    email = database.Column(database.String(100), nullable=False)
    password = database.Column(database.String(100), nullable=False)
    role = database.Column(database.String(100) ,nullable=False)
    reviews = database.relationship('Review', backref='user', lazy=True)

class Review(database.Model):
    __tablename__ = 'reviews'
    id = database.Column(database.Integer, primary_key=True)
    user_id = database.Column(database.Integer, database.ForeignKey('users.id'))
    hospital_id = database.Column(database.Integer, database.ForeignKey('hospitals.id'))
    rating = database.Column(database.Integer)
    review = database.Column(database.Text)
    review_date = database.Column(database.DateTime)
    doctors = database.relationship('ReviewDoctors', backref='review', lazy=True)
class ReviewDoctors(database.Model):
    __tablename__ = 'review_doctors'
    record_id = database.Column(database.Integer, primary_key=True)
    review_id = database.Column(database.Integer, database.ForeignKey('reviews.id'))
    doctor_id = database.Column(database.Integer, database.ForeignKey('doctors.id'))