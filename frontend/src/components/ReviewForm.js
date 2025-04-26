import React, { useState, useEffect, useContext } from 'react';
import { addReview, fetchDoctors } from '../services/api';
import { UserContext } from '../App';

function ReviewForm({ hospitalId: initialHospitalId = '' }) {
  const { user } = useContext(UserContext);
  const [hospitalId, setHospitalId] = useState(initialHospitalId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState([]); // Array of selected doctor IDs.
  const [reviewDate, setReviewDate] = useState('');
  const [doctors, setDoctors] = useState([]);

  // Fetch doctors for the given hospital when hospitalId changes.
  useEffect(() => {
    if (hospitalId) {
      async function loadDoctors() {
        const data = await fetchDoctors(hospitalId);
        console.log(data);
        if (data && data.doctors) {
          setDoctors(data.doctors);
        } else {
          setDoctors([]);
        }
      }
      loadDoctors();
    } else {
      setDoctors([]);
    }
  }, [hospitalId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("user_id: ", user.id);
      console.log("hospital_id: ", hospitalId);
      console.log("rating: ", rating);
      console.log("comment: ", comment);
      console.log("review_date: ", reviewDate);
      console.log("doctor_ids: ", selectedDoctors);
      const res = await addReview({
        user_id: user.id,
        hospital_id: hospitalId,
        rating,
        comment,
        review_date: reviewDate,
        doctor_ids: selectedDoctors,
      });
      alert('Review added successfully, ID: ' + res.review_id);
      if (!initialHospitalId) {
         setHospitalId('');
      }
      setRating(5);
      setComment('');
      setSelectedDoctors([]);
      setReviewDate('');
    } catch (error) {
      alert('Error adding review');
    }
  };

  // Handle selection changes in the multi-select dropdown.
  const handleDoctorSelection = (e) => {
    
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedDoctors(selectedOptions);
  };

  return (
    <div>
      <h4>Submit Review</h4>
      <form onSubmit={handleSubmit}>
        {/* If no initial hospitalId is provided, let the user enter one manually */}
        {!initialHospitalId && (
          <>
            <label>Hospital ID (optional):</label>
            <br />
            <input
              type="text"
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
            />
            <br />
          </>
        )}
        <label>Rating (1-5):</label>
        <br />
        <input
          type="number"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          min="1"
          max="5"
        />
        <br />
        <label>Comment:</label>
        <br />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <br />
        {/* Render the dropdown if a hospitalId is present and doctors are available */}
        {hospitalId && doctors.length > 0 && (
          <>
            <label>Select Doctor(s):</label>
            <br />
            <select multiple value={selectedDoctors} onChange={handleDoctorSelection}>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} ({doctor.specialization})
                </option>
              ))}
            </select>
            <br />
          </>
        )}
        <label>Review Date (YYYY-MM-DD):</label>
        <br />
        <input
          type="text"
          value={reviewDate}
          onChange={(e) => setReviewDate(e.target.value)}
          placeholder="2025-03-30"
        />
        <br />
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}

export default ReviewForm;
