// import React, { useState, useEffect } from 'react';
// import { getHospitals } from '../services/api';

// function HospitalList({ onSelectHospital }) {
//   const [hospitals, setHospitals] = useState([]);

//   useEffect(() => {
//     const fetchHospitals = async () => {
//       try {
//         const response = await getHospitals();
//         setHospitals(response.hospitals || []); // Ensure hospitals is an array
//       } catch (error) {
//         console.error('Error fetching hospitals:', error);
//       }
//     };
//     fetchHospitals();
//   }, []);

//   return (
//     <div>
//       <h3>Hospitals</h3>
//       <ul>
//         {hospitals.map((hospital) => (
//           <li key={hospital.id}>
//             {hospital.name} - {hospital.city}, {hospital.state}
//             <button onClick={() => onSelectHospital(hospital.id)}>Select</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default HospitalList;

// import React, { useState, useEffect, useCallback } from 'react';
// import { getHospitals } from '../services/api'; // Ensure API function is imported

// // Accepts onSelectHospital and a refreshTrigger prop
// function HospitalList({ onSelectHospital, refreshTrigger }) {
//   const [hospitals, setHospitals] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Use useCallback to memoize the fetch function for stability
//   const fetchHospitals = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
//     console.log("HospitalList: Fetching hospitals..."); // Log for debugging
//     try {
//       const response = await getHospitals();
//       setHospitals(response?.hospitals || []); // Ensure it's always an array
//     } catch (err) {
//       console.error('Error fetching hospitals:', err);
//       setError(`Failed to fetch hospitals: ${err.message || 'Server error'}`);
//       setHospitals([]); // Clear hospitals on error
//     } finally {
//       setIsLoading(false);
//     }
//   }, []); // Empty dependency array as getHospitals is assumed stable

//   // useEffect to fetch data on mount AND when refreshTrigger changes [2][4]
//   useEffect(() => {
//     fetchHospitals();
//     // The effect depends on fetchHospitals (which is stable due to useCallback)
//     // and refreshTrigger (which signals when to re-run)
//   }, [fetchHospitals, refreshTrigger]);

//   // Handle Loading State
//   if (isLoading) {
//     return <p>Loading hospitals...</p>;
//   }

//   // Handle Error State
//   if (error) {
//     return <p style={{ color: 'red' }}>Error loading hospitals: {error}</p>;
//   }

//   // Handle No Hospitals Found
//   if (!hospitals || hospitals.length === 0) {
//     return <p>No hospitals found.</p>;
//   }

//   // Render the list
//   return (
//     <div>
//       <h3>Hospitals</h3>
//       <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
//         {hospitals.map((hospital) => (
//           <li key={hospital.id} style={{ marginBottom: '10px' }}>
//             {hospital.name} - {hospital.city}, {hospital.state}
//             <button
//               onClick={() => onSelectHospital(hospital.id)}
//               style={{ marginLeft: '15px', padding: '3px 8px', cursor: 'pointer' }}
//             >
//               Select
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default HospitalList;



import React, { useState, useEffect, useCallback } from 'react';
import { getHospitals } from '../services/api'; // Import the API function
import eventBus from '../services/eventBus'; // Import the event bus

// Removed isLoading, error, hospitals props - manages its own state
// Keep onSelectHospital prop
function HospitalList({ onSelectHospital }) {
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // useCallback for the fetch function
  const fetchHospitals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log("HospitalList: Fetching hospitals..."); // Debug log
    try {
      const response = await getHospitals();
      setHospitals(response?.hospitals || []);
    } catch (err) {
      console.error('HospitalList: Error fetching hospitals:', err);
      setError(`Failed to fetch hospitals: ${err.message || 'Server error'}`);
      setHospitals([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array

  // useEffect for initial fetch AND listening to events
  useEffect(() => {
    // Fetch data when the component mounts
    fetchHospitals();

    // Define the handler for the event
    const handleHospitalAdded = () => {
      console.log("HospitalList: Received hospitalAdded event. Refreshing list...");
      fetchHospitals(); // Re-fetch data when the event occurs
    };

    // Subscribe to the event
    eventBus.on('hospitalAdded', handleHospitalAdded);

    // Cleanup function: Unsubscribe when the component unmounts
    return () => {
      console.log("HospitalList: Cleaning up event listener for hospitalAdded"); // Debug log
      eventBus.off('hospitalAdded', handleHospitalAdded);
    };
  }, [fetchHospitals]); // Depend on fetchHospitals (stable due to useCallback)

  // Render logic remains the same, using internal state
  if (isLoading) {
    return <p>Loading hospitals...</p>;
  }
  if (error) {
    return <p style={{ color: 'red' }}>Error loading hospitals: {error}</p>;
  }
  if (!hospitals || hospitals.length === 0) {
    return <p>No hospitals found.</p>;
  }

  return (
    <div>
      <h3>Hospitals</h3>
      <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
        {hospitals.map((hospital) => (
          <li key={hospital.id} style={{ marginBottom: '10px' }}>
            {hospital.name} - {hospital.city}, {hospital.state}
            <button
              onClick={() => onSelectHospital(hospital.id)}
              style={{ marginLeft: '15px', padding: '3px 8px', cursor: 'pointer' }}
            >
              Select
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HospitalList;
