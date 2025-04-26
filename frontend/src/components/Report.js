// import React, { useState } from 'react';
// import { fetchReport } from '../services/api';

// function Report() {
//   const [filters, setFilters] = useState({
//     start_date: '',
//     end_date: '',
//     hospital_id: '',
//     city: '',
//     doctor_id: '',
//     specialization: '',
//   });
//   const [reportData, setReportData] = useState([]);

//   const handleChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = await fetchReport(filters);
//     setReportData(data.reviews || []);
//   };

//   return (
//     <div>
//       <h4>Generate Review Report</h4>
//       <form onSubmit={handleSubmit}>
//         <label>Hospital ID (to view reviews for a specific hospital):</label>
//         <br />
//         <input
//           type="text"
//           name="hospital_id"
//           value={filters.hospital_id}
//           onChange={handleChange}
//           placeholder="Enter hospital ID"
//         />
//         <br />
//         <label>Start Date (YYYY-MM-DD):</label>
//         <br />
//         <input
//           type="text"
//           name="start_date"
//           value={filters.start_date}
//           onChange={handleChange}
//           placeholder="2025-01-01"
//         />
//         <br />
//         <label>End Date (YYYY-MM-DD):</label>
//         <br />
//         <input
//           type="text"
//           name="end_date"
//           value={filters.end_date}
//           onChange={handleChange}
//           placeholder="2025-12-31"
//         />
//         <br />
//         <label>City:</label>
//         <br />
//         <input
//           type="text"
//           name="city"
//           value={filters.city}
//           onChange={handleChange}
//         />
//         <br />
//         <label>Doctor ID:</label>
//         <br />
//         <input
//           type="text"
//           name="doctor_id"
//           value={filters.doctor_id}
//           onChange={handleChange}
//         />
//         <br />
//         <label>Specialization:</label>
//         <br />
//         <input
//           type="text"
//           name="specialization"
//           value={filters.specialization}
//           onChange={handleChange}
//         />
//         <br />
//         <button type="submit">Generate Report</button>
//       </form>
//       <hr />
//       <h4>Review Report</h4>
//       {reportData.length > 0 ? (
//         <ul>
//           {reportData.map((review) => (
//             <li key={review.review_id}>
//               <strong>Review ID:</strong> {review.review_id} | <strong>Rating:</strong> {review.rating} | <strong>Date:</strong> {review.review_date} <br />
//               <strong>Hospital:</strong> {review.hospital_name} | <strong>City:</strong> {review.city} | <strong>State:</strong> {review.state} <br />
//               <strong>Doctor:</strong> {review.doctor_name} | <strong>Specialization:</strong> {review.specialization} <br />
//               <strong>Comment:</strong> {review.review ? review.review : 'No comment'}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No reviews found.</p>
//       )}
//     </div>
//   );
// }

// export default Report;


import React, { useState, useEffect } from 'react';
// Import the updated API functions
import { fetchReport, getHospitals, getAllDoctors, getSpecializations } from '../services/api';

function Report() {
  // State for filter values
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    hospital_id: '', // Use '' for 'All'
    city: '',
    doctor_id: '', // Use '' for 'All'
    specialization: '', // Use '' for 'All'
  });

  // State for filter options fetched from the backend
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [specializationOptions, setSpecializationOptions] = useState([]);

  // State for the fetched report data (reviews)
  const [reportData, setReportData] = useState([]);
  // State for calculated statistics
  const [reportStats, setReportStats] = useState({
    averageRating: null,
    reviewCount: 0,
    // You could add more here if your stored procedure returns relevant data
    // e.g., averageDuration: null, avgInvited: null, avgAccepted: null, avgAttendanceRate: null
  });

  // State for loading and errors
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [error, setError] = useState(null); // Single error state for simplicity

  // Fetch options for filters on component mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      setIsLoadingOptions(true);
      setError(null); // Clear previous errors
      try {
        // Fetch all necessary options concurrently
        const [hospitalsRes, doctorsRes, specsRes] = await Promise.all([
          getHospitals().catch(e => { console.error("Failed hospital fetch:", e); return { hospitals: [] }; }), // Add individual catch blocks
          getAllDoctors().catch(e => { console.error("Failed doctor fetch:", e); return { doctors: [] }; }),
          getSpecializations().catch(e => { console.error("Failed specs fetch:", e); return { specializations: [] }; })
        ]);

        setHospitalOptions(hospitalsRes?.hospitals || []);
        setDoctorOptions(doctorsRes?.doctors || []);
        setSpecializationOptions(specsRes?.specializations || []);

      } catch (err) { // Catch errors from Promise.all if any promises reject without individual catch
        console.error("Error loading filter options:", err);
        setError("Failed to load filter options. Please try again.");
      } finally {
        setIsLoadingOptions(false);
      }
    };
    loadFilterOptions();
  }, []); // Empty dependency array means run once on mount

  // Handle changes in filter inputs/selects
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Calculate statistics whenever reportData changes
  useEffect(() => {
    if (reportData && reportData.length > 0) {
      const totalRating = reportData.reduce((sum, review) => {
        // Ensure rating is treated as a number, default to 0 if invalid
        const rating = Number(review.rating);
        return sum + (isNaN(rating) ? 0 : rating);
      }, 0);
      const avgRating = reportData.length > 0 ? totalRating / reportData.length : 0;

      // --- Placeholder for other stats (Adapt if your SP returns necessary data) ---
      // Example: if your SP returns 'duration', 'invited_count', 'accepted_count', 'attended_count'
      /*
      const totalDuration = reportData.reduce((sum, review) => sum + (Number(review.duration) || 0), 0);
      const avgDuration = reportData.length > 0 ? totalDuration / reportData.length : 0;

      const totalInvited = reportData.reduce((sum, review) => sum + (Number(review.invited_count) || 0), 0);
      const avgInvited = reportData.length > 0 ? totalInvited / reportData.length : 0;

      const totalAccepted = reportData.reduce((sum, review) => sum + (Number(review.accepted_count) || 0), 0);
      const avgAccepted = reportData.length > 0 ? totalAccepted / reportData.length : 0;

      // Calculate attendance rate per review, then average the rates
      let totalAttendanceRate = 0;
      let validReviewsForRate = 0;
      reportData.forEach(review => {
          const invited = Number(review.invited_count) || 0;
          const attended = Number(review.attended_count) || 0;
          if (invited > 0) {
              totalAttendanceRate += (attended / invited);
              validReviewsForRate++;
          }
      });
      const avgAttendanceRate = validReviewsForRate > 0 ? (totalAttendanceRate / validReviewsForRate) * 100 : 0; // As percentage
      */
      // --- End Placeholder ---

      setReportStats({
        averageRating: avgRating.toFixed(2), // Format to 2 decimal places
        reviewCount: reportData.length,
        // avgDuration: avgDuration.toFixed(1),
        // avgInvited: avgInvited.toFixed(1),
        // avgAccepted: avgAccepted.toFixed(1),
        // avgAttendanceRate: avgAttendanceRate.toFixed(1) + '%',
      });
    } else {
      // Reset stats if no data
      setReportStats({ averageRating: null, reviewCount: 0 /*, other stats: null */ });
    }
  }, [reportData]);


  // Handle form submission to generate the report
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingReport(true);
    setError(null);
    setReportData([]); // Clear previous results

    // Use the filters state directly, the backend handles None/empty values
    try {
      console.log("Fetching report with filters:", filters);
      const data = await fetchReport(filters); // Pass filters object directly
      setReportData(data.reviews || []); // Update report data
      if (!data.reviews || data.reviews.length === 0) {
         // Set an informational message if no results, not necessarily an error
         // setError("No reviews found matching the criteria."); // Optional: could display in results area instead
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      setError(`Failed to generate report: ${err.message || 'Server error'}`);
      setReportData([]); // Ensure data is empty on error
    } finally {
      setIsLoadingReport(false);
    }
  };

  return (
    <div>
      <h4>Generate Review Report</h4>
      <form onSubmit={handleSubmit}>
        {/* --- Filter UI Elements --- */}
        {/* Date Range Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '10px' }}>
          <div>
            <label htmlFor="start_date">Start Date:</label><br />
            <input id="start_date" type="date" name="start_date" value={filters.start_date} onChange={handleChange} style={{ padding: '5px' }} />
          </div>
          <div>
            <label htmlFor="end_date">End Date:</label><br />
            <input id="end_date" type="date" name="end_date" value={filters.end_date} onChange={handleChange} style={{ padding: '5px' }} />
          </div>
        </div>

        {/* Hospital Filter Dropdown */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="hospital_id">Hospital:</label><br />
          <select id="hospital_id" name="hospital_id" value={filters.hospital_id} onChange={handleChange} disabled={isLoadingOptions} style={{ padding: '5px', minWidth: '200px', maxWidth: '100%' }}>
            <option value="">-- All Hospitals --</option>
            {hospitalOptions.map((h) => <option key={h.id} value={h.id}>{h.name} ({h.city})</option>)}
          </select>
        </div>

        {/* City Filter */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="city">City:</label><br />
          <input id="city" type="text" name="city" value={filters.city} onChange={handleChange} placeholder="Filter by city" style={{ padding: '5px', boxSizing: 'border-box' }} />
        </div>

        {/* Doctor Filter Dropdown */}
         <div style={{ marginBottom: '10px' }}>
          <label htmlFor="doctor_id">Doctor:</label><br />
          <select id="doctor_id" name="doctor_id" value={filters.doctor_id} onChange={handleChange} disabled={isLoadingOptions} style={{ padding: '5px', minWidth: '200px', maxWidth: '100%' }}>
            <option value="">-- All Doctors --</option>
            {doctorOptions.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.specialization || 'N/A'})</option>)}
          </select>
        </div>

        {/* Specialization Filter Dropdown */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="specialization">Specialization:</label><br />
          <select id="specialization" name="specialization" value={filters.specialization} onChange={handleChange} disabled={isLoadingOptions} style={{ padding: '5px', minWidth: '200px', maxWidth: '100%' }}>
            <option value="">-- All Specializations --</option>
            {specializationOptions.map((spec) => <option key={spec} value={spec}>{spec}</option>)}
          </select>
        </div>

        <button type="submit" disabled={isLoadingOptions || isLoadingReport} style={{ padding: '8px 15px', cursor: 'pointer' }}>
          {isLoadingReport ? 'Generating...' : 'Generate Report'}
        </button>
      </form>

      {/* Display Loading/Error Messages */}
       {isLoadingOptions && <p>Loading filter options...</p>}
       {/* Report-specific loading/error shown near results */}

      <hr />

      {/* --- Report Results Section --- */}
      <h4>Review Report Results</h4>
      {isLoadingReport && <p>Generating report...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Display Statistics (only if data exists and no error) */}
      {!isLoadingReport && !error && reportData.length > 0 && (
         <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
           <strong>Statistics:</strong><br />
           <span>Total Reviews Found: {reportStats.reviewCount}</span><br />
           <span>Average Rating: {reportStats.averageRating ?? 'N/A'}</span><br />
           {/* Uncomment if you implement other stats */}
           {/* <span>Average Duration: {reportStats.avgDuration ?? 'N/A'}</span><br />
           <span>Avg. Invited Students: {reportStats.avgInvited ?? 'N/A'}</span><br />
           <span>Avg. Accepted Invitations: {reportStats.avgAccepted ?? 'N/A'}</span><br />
           <span>Avg. Attendance Rate: {reportStats.avgAttendanceRate ?? 'N/A'}</span> */}
         </div>
      )}

      {/* Display Report Data (Reviews List) (only if data exists and no error) */}
      {!isLoadingReport && !error && reportData.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {reportData.map((review) => (
            // Ensure keys used here match EXACTLY what your stored procedure returns
            <li key={review.review_id || review.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '10px', paddingBottom: '10px' }}>
              <strong>Review ID:</strong> {review.review_id || review.id} | <strong>Rating:</strong> {review.rating} | <strong>Date:</strong> {review.review_date ? new Date(review.review_date).toLocaleDateString() : 'N/A'} <br />
              <strong>Hospital:</strong> {review.hospital_name || 'N/A'} | <strong>City:</strong> {review.city || 'N/A'} | <strong>State:</strong> {review.state || 'N/A'} <br />
              {/* Conditionally display doctor info if available in results */}
              {review.doctor_name && <><strong>Doctor:</strong> {review.doctor_name} | <strong>Specialization:</strong> {review.specialization || 'N/A'} <br /></>}
              <strong>Comment:</strong> {review.review || 'No comment'}
            </li>
          ))}
        </ul>
      // Display message if not loading, no error, but no data found
      ) : !isLoadingReport && !error && (
        <p>No reviews found matching the criteria, or report not yet generated.</p>
      )}
    </div>
  );
}

export default Report;

