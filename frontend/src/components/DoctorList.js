import React, { useState, useEffect } from 'react';
import { fetchDoctors, deleteDoctor, updateDoctorHospital } from '../services/api';

function DoctorList({ hospitalId }) {
  const [doctors, setDoctors] = useState([]);
  const [newHospitalId, setNewHospitalId] = useState({});

  // Function to load doctors for the given hospitalId.
  const loadDoctors = async () => {
    if (!hospitalId) {
      console.warn('No hospital ID provided. Skipping fetch.');
      return;
    }
    try {
      const data = await fetchDoctors(hospitalId);
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  // Use polling to auto-refresh the doctors list every 3 seconds.
  useEffect(() => {
    if (!hospitalId) return;
    loadDoctors();
    const intervalId = setInterval(() => {
      loadDoctors();
    }, 3000); // Poll every 3 seconds (adjust as needed)
    return () => clearInterval(intervalId);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteDoctor(id);
        // Immediately update the list by removing the deleted doctor.
        setDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor.id !== id));
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const handleUpdateAssignment = async (id) => {
    const hospitalIdToAssign = newHospitalId[id];
    if (!hospitalIdToAssign) {
      alert('Please enter a valid hospital ID.');
      return;
    }
    try {
      await updateDoctorHospital(id, hospitalIdToAssign);
      // Immediately update the doctor in our list.
      setDoctors((prevDoctors) =>
        prevDoctors.map((doctor) =>
          doctor.id === id ? { ...doctor, hospital_id: hospitalIdToAssign } : doctor
        )
      );
    } catch (error) {
      console.error('Error updating doctor assignment:', error);
    }
  };

  const handleInputChange = (id, value) => {
    setNewHospitalId((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div>
      <h4>Doctor List</h4>
      {hospitalId ? (
        <ul>
          {doctors.map((d) => (
            <li key={d.id}>
              {d.name} ({d.specialization}) - Hospital: {d.hospital_id || 'None'}
              <button onClick={() => handleDelete(d.id)}>Delete</button>
              <br />
              <label>Assign to Hospital ID:</label>
              <input
                type="text"
                value={newHospitalId[d.id] || ''}
                onChange={(e) => handleInputChange(d.id, e.target.value)}
                placeholder="Enter hospital ID"
              />
              <button onClick={() => handleUpdateAssignment(d.id)}>Update Assignment</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Please select a hospital to view its doctors.</p>
      )}
    </div>
  );
}

export default DoctorList;