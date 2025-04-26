import React, { useState, useEffect } from 'react';
import { getHospitals } from '../services/api';

function HospitalList({ onSelectHospital }) {
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await getHospitals();
        setHospitals(response.hospitals || []); // Ensure hospitals is an array
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    };
    fetchHospitals();
  }, []);

  return (
    <div>
      <h3>Hospitals</h3>
      <ul>
        {hospitals.map((hospital) => (
          <li key={hospital.id}>
            {hospital.name} - {hospital.city}, {hospital.state}
            <button onClick={() => onSelectHospital(hospital.id)}>Select</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HospitalList;