import React, { useState, useEffect } from 'react';
import { fetchReport } from '../services/api';

function ReviewList({ hospitalId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadReviews = async () => {
      // Fetch reviews filtered by the given hospitalId.
      const data = await fetchReport({ hospital_id: hospitalId });


      console.log(data);
      setReviews(data.reviews || []);
    };
    if (hospitalId) {
      loadReviews();
    }
  }, [hospitalId]);

  return (
    <div>
      <h4>Previous Reviews for Hospital {hospitalId}</h4>
      {reviews.length > 0 ? (
        <ul>
          {reviews.map((review) => (
            <li key={review.review_id}>
              <strong>Review ID:</strong> {review.review_id} | <strong>Rating:</strong> {review.rating} | <strong>Date:</strong> {review.review_date} <br />
              <strong>Comment:</strong> {review.review ? review.review : 'No comment'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No previous reviews found for this hospital.</p>
      )}
    </div>
  );
}

export default ReviewList;
