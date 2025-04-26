import React, { useState } from 'react';
import { fetchReport } from '../services/api';

function Report() {
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    hospital_id: '',
    city: '',
    doctor_id: '',
    specialization: '',
  });
  const [reportData, setReportData] = useState([]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await fetchReport(filters);
    setReportData(data.reviews || []);
  };

  return (
    <div>
      <h4>Generate Review Report</h4>
      <form onSubmit={handleSubmit}>
        <label>Hospital ID (to view reviews for a specific hospital):</label>
        <br />
        <input
          type="text"
          name="hospital_id"
          value={filters.hospital_id}
          onChange={handleChange}
          placeholder="Enter hospital ID"
        />
        <br />
        <label>Start Date (YYYY-MM-DD):</label>
        <br />
        <input
          type="text"
          name="start_date"
          value={filters.start_date}
          onChange={handleChange}
          placeholder="2025-01-01"
        />
        <br />
        <label>End Date (YYYY-MM-DD):</label>
        <br />
        <input
          type="text"
          name="end_date"
          value={filters.end_date}
          onChange={handleChange}
          placeholder="2025-12-31"
        />
        <br />
        <label>City:</label>
        <br />
        <input
          type="text"
          name="city"
          value={filters.city}
          onChange={handleChange}
        />
        <br />
        <label>Doctor ID:</label>
        <br />
        <input
          type="text"
          name="doctor_id"
          value={filters.doctor_id}
          onChange={handleChange}
        />
        <br />
        <label>Specialization:</label>
        <br />
        <input
          type="text"
          name="specialization"
          value={filters.specialization}
          onChange={handleChange}
        />
        <br />
        <button type="submit">Generate Report</button>
      </form>
      <hr />
      <h4>Review Report</h4>
      {reportData.length > 0 ? (
        <ul>
          {reportData.map((review) => (
            <li key={review.review_id}>
              <strong>Review ID:</strong> {review.review_id} | <strong>Rating:</strong> {review.rating} | <strong>Date:</strong> {review.review_date} <br />
              <strong>Hospital:</strong> {review.hospital_name} | <strong>City:</strong> {review.city} | <strong>State:</strong> {review.state} <br />
              <strong>Doctor:</strong> {review.doctor_name} | <strong>Specialization:</strong> {review.specialization} <br />
              <strong>Comment:</strong> {review.review ? review.review : 'No comment'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews found.</p>
      )}
    </div>
  );
}

export default Report;
