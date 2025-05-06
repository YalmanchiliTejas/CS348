
import React, { useState, useEffect } from 'react';
// Import API functions - Assume these exist and are correctly implemented
// to handle network requests and return promises.
import { fetchReport, getHospitals, fetchDoctors, getSpecializations } from '../services/api';

function Report() {
  // State for filter values
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    hospital_id: '',
    city: '',
    doctor_id: '',
    specialization: '',
  });

  // State for filter dropdown options
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [specializationOptions, setSpecializationOptions] = useState([]);

  // State for report data & stats
  const [reportData, setReportData] = useState([]);
  const [reportStats, setReportStats] = useState({ averageRating: null, reviewCount: 0 });

  // Loading / error states
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [error, setError] = useState(null);

  // --- Effects ---

  // 1. Fetch all hospitals once on component mount
  useEffect(() => {
    let isMounted = true;
    const loadHospitals = async () => {
      setIsLoadingOptions(true);
      setError(null);
      try {
        const res = await getHospitals();
        // **Enhanced Logging**: Log the raw response to debug structure issues
        console.log('getHospitals response:', res);

        // **Safe Access**: Handle potential variations in API response structure
        // Accommodates data nested under 'data' or directly in the response object.
        const hospitals = res?.hospitals ?? [];; // Added res ?? []

        if (isMounted) {
           setHospitalOptions(hospitals);
        }
      } catch (err) {
        console.error('Failed hospital fetch:', err);
        // **Enhanced Error Logging**: Log the error object and potential response data
        console.error('Error details (getHospitals):', err.response?.data);
        if (isMounted) {
           setError(err.message || 'Failed to load hospitals');
        }
      } finally {
        if (isMounted) {
           setIsLoadingOptions(false);
        }
      }
    };
    loadHospitals();
    // Cleanup function to prevent state updates on unmounted component
    return () => { isMounted = false; };
  }, []); // Empty dependency array ensures this runs only once on mount

  // 2. Fetch doctors and specializations when hospital_id filter changes
  useEffect(() => {
    const { hospital_id } = filters;

    // Reset dependent dropdown options and selected values
    setDoctorOptions([]);
    setSpecializationOptions([]);
    // Only reset doctor/spec *values* if a hospital was previously selected
    // Avoids resetting if the initial state is empty hospital_id
    if (filters.doctor_id || filters.specialization) {
        setFilters(f => ({ ...f, doctor_id: '', specialization: '' }));
    }


    // Only proceed if a hospital is actually selected
    if (!hospital_id) return;

    let isMounted = true;
    const loadDependentOptions = async () => {
      setIsLoadingOptions(true);
      setError(null); // Clear previous errors related to options loading
      try {
        // Fetch doctors and specializations concurrently for the selected hospital
        // Added basic catch blocks to prevent Promise.all failing if one request fails
        const [docsRes, specsRes] = await Promise.all([
          fetchDoctors(hospital_id).catch(e => { console.error("Fetch doctors error:", e); return null; }), // Return null on error
          getSpecializations(hospital_id).catch(e => { console.error("Fetch specializations error:", e); return null; }), // Return null on error
        ]);

        // **Enhanced Logging**: Log raw responses
        console.log('fetchDoctors response:', docsRes);
        console.log('getSpecializations response:', specsRes);

        // **Safe Access**: Handle variations and potential null responses from failed fetches
        const doctors = docsRes?.data?.doctors ?? docsRes?.doctors ?? docsRes ?? []; // Added docsRes ?? []
        const specs = specsRes?.data?.specializations ?? specsRes?.specializations ?? specsRes ?? []; // Added specsRes ?? []

        if (isMounted) {
          setDoctorOptions(doctors);
          setSpecializationOptions(specs);
        }
      } catch (err) {
        // Catch any unexpected errors during the Promise.all or state updates
        console.error('Error loading dependent doctors/specializations:', err);
         // **Enhanced Error Logging**
        console.error('Error details (loadDependentOptions):', err.response?.data);
        if (isMounted) {
           setError(err.message || 'Failed to load doctors or specializations');
        }
      } finally {
        if (isMounted) {
           setIsLoadingOptions(false);
        }
      }
    };

    loadDependentOptions();
    // Cleanup function
    return () => { isMounted = false; };
  }, [filters.hospital_id]); // Dependency array ensures this runs when hospital_id changes

  // 3. Recalculate statistics when report data changes
  useEffect(() => {
    if (reportData && reportData.length > 0) {
      const totalRating = reportData.reduce((sum, review) => sum + Number(review.rating || 0), 0);
      const average = totalRating / reportData.length;
      setReportStats({
        averageRating: average.toFixed(2), // Format to 2 decimal places
        reviewCount: reportData.length,
      });
    } else {
      // Reset stats if there's no data
      setReportStats({ averageRating: null, reviewCount: 0 });
    }
  }, [reportData]); // Dependency array ensures this runs when reportData updates

  // --- Handlers ---

  // Handle changes in any filter input/select
  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  // Handle form submission to fetch the report
  const handleSubmit = async e => {
    e.preventDefault(); // Prevent default form submission
    setIsLoadingReport(true);
    setError(null); // Clear previous report errors
    setReportData([]); // Clear previous report data
    try {
      // Pass all current filters to the API
      const res = await fetchReport(filters);
      // **Enhanced Logging**: Log the raw response
      console.log('fetchReport response:', res);

      // **Safe Access**: Handle variations in API response structure
      const reviews = res?.data?.reviews ?? res?.reviews ?? res ?? []; // Added res ?? []
      setReportData(reviews);

    } catch (err) {
        // **Enhanced Error Logging**: Try to get a meaningful error message
        console.error('Failed to fetch report:', err);
        console.error('Error details (fetchReport):', err.response?.data);
        const errorMessage = err.response?.data?.message ?? err.message ?? 'An unknown server error occurred while fetching the report.';
        setError(errorMessage);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // --- Render JSX ---
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h4 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Generate Review Report</h4>
      <form onSubmit={handleSubmit}>
        {/* Filter Controls Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            {/* Date Range Pickers */}
            <div>
                <label htmlFor="start_date" style={{ display: 'block', marginBottom: '5px' }}>Start Date:</label>
                <input
                id="start_date"
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleChange}
                style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
                />
            </div>
            <div>
                <label htmlFor="end_date" style={{ display: 'block', marginBottom: '5px' }}>End Date:</label>
                <input
                id="end_date"
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleChange}
                style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
                />
            </div>

            {/* Hospital Select */}
            <div>
                <label htmlFor="hospital_id" style={{ display: 'block', marginBottom: '5px' }}>Hospital:</label>
                <select
                id="hospital_id"
                name="hospital_id"
                value={filters.hospital_id}
                onChange={handleChange}
                disabled={isLoadingOptions} // Disable while loading any options
                style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
                >
                <option value="">-- All Hospitals --</option>
                {hospitalOptions.map(hospital => (
                    <option key={hospital.id} value={hospital.id}>
                    {hospital.name} ({hospital.city})
                    </option>
                ))}
                </select>
            </div>

            {/* City Input Filter (Independent) */}
             <div>
                <label htmlFor="city" style={{ display: 'block', marginBottom: '5px' }}>City:</label>
                <input
                    id="city"
                    type="text"
                    name="city"
                    value={filters.city}
                    onChange={handleChange}
                    placeholder="Filter by city (optional)"
                    style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
                />
            </div>

            {/* Doctor Select (Dependent on Hospital) */}
            <div>
                <label htmlFor="doctor_id" style={{ display: 'block', marginBottom: '5px' }}>Doctor:</label>
                <select
                id="doctor_id"
                name="doctor_id"
                value={filters.doctor_id}
                onChange={handleChange}
                // Disable if options loading OR if no hospital is selected (preventing selection)
                disabled={isLoadingOptions || !filters.hospital_id}
                style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
                >
                <option value="">-- All Doctors --</option>
                {doctorOptions?.map(doctor => (  // Optional chaining
                    <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialization || 'N/A'})
                    </option>
                ))}
                </select>
                {/* Informative message when options are filtered but empty */}
                {filters.hospital_id && !isLoadingOptions && doctorOptions?.length === 0 && ( // Optional chaining
                    <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>No doctors found for this hospital.</small>
                )}
            </div>

            {/* Specialization Select (Dependent on Hospital) */}
            <div>
                <label htmlFor="specialization" style={{ display: 'block', marginBottom: '5px' }}>Specialization:</label>
                <select
                id="specialization"
                name="specialization"
                value={filters.specialization}
                onChange={handleChange}
                // Disable if options loading OR if no hospital is selected
                disabled={isLoadingOptions || !filters.hospital_id}
                style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
                >
                <option value="">-- All Specializations --</option>
                {specializationOptions?.map(spec => ( // Optional chaining
                    // Assuming specialization is just a string array; adjust if it's objects
                    <option key={spec} value={spec}>
                    {spec}
                    </option>
                ))}
                </select>
                {/* Informative message when options are filtered but empty */}
                {filters.hospital_id && !isLoadingOptions && specializationOptions?.length === 0 && ( // Optional chaining
                    <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>No specializations found for this hospital.</small>
                )}
            </div>
        </div> {/* End of filter grid */}

        {/* Loading Indicator for Options */}
        {isLoadingOptions && <p style={{ fontStyle: 'italic', color: '#555' }}>Loading filter options...</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoadingOptions || isLoadingReport} // Disable during any loading state
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            backgroundColor: (isLoadingOptions || isLoadingReport) ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1em'
          }}
        >
          {isLoadingReport ? 'Generating Report...' : 'Generate Report'}
        </button>
      </form>

      {/* Report Results Section */}
      <hr style={{ margin: '30px 0' }} />
      <h4 style={{ marginBottom: '15px' }}>Review Report Results</h4>

      {/* Error Display */}
      {error && <p style={{ color: 'red', fontWeight: 'bold', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>Error: {error}</p>}

      {/* Loading Indicator for Report */}
      {isLoadingReport && <p style={{ fontStyle: 'italic', color: '#555' }}>Generating report, please wait...</p>}

      {/* Statistics Display - Only show if not loading, no error, and data exists */}
      {!isLoadingReport && !error && reportData?.length > 0 && (  // Optional chaining
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <strong>Report Statistics:</strong><br />
          <span style={{ display: 'inline-block', marginRight: '15px' }}>Total Reviews Found: {reportStats?.reviewCount}</span>  {/* Optional chaining */}
          <span>Average Rating: {reportStats?.averageRating ?? 'N/A'}</span>  {/* Optional chaining */}
        </div>
      )}

      {/* Report Data List or No Results Message */}
      {!isLoadingReport && !error ? (
        reportData?.length > 0 ? (  // Optional chaining
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {reportData?.map(review => (  // Optional chaining
              <li
                key={review.review_id || review.id} // Use a unique identifier for the key
                style={{ borderBottom: '1px solid #eee', marginBottom: '15px', paddingBottom: '15px' }}
              >
                <p><strong>Review ID:</strong> {review.review_id || review.id} | <strong>Rating:</strong> {review.rating || 'N/A'} |{' '}
                   <strong>Date:</strong> {review.review_date ? new Date(review.review_date).toLocaleDateString() : 'N/A'}
                </p>
                <p><strong>Hospital:</strong> {review.hospital_name || 'N/A'} ({review.city || 'N/A'}, {review.state || 'N/A'})</p>
                {/* Conditionally display doctor info if available */}
                {review.doctor_name && (
                   <p><strong>Doctor:</strong> {review.doctor_name} | <strong>Specialization:</strong> {review.specialization || 'N/A'}</p>
                )}
                <p style={{ marginTop: '5px' }}><strong>Comment:</strong><br />
                  <span style={{ display: 'inline-block', marginTop: '3px', color: '#333' }}>
                    {review.review || '(No comment provided)'}
                   </span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          (filters.start_date || filters.end_date || filters.hospital_id || filters.city || filters.doctor_id || filters.specialization ) && 
             <p>No reviews found matching the specified criteria.</p>

        )
      ) : null /* Render nothing related to results if loading or error occurred (handled above) */}
    </div>
  );
}

export default Report; // Ensure the export is present
