

import React, { useState, useEffect, useCallback } from "react";
import {
  addDoctor,
  fetchDoctors,
  deleteDoctor,
  updateDoctorHospital,
} from "../services/api";

// Accept hospitalId as a prop
function DoctorForm({ selectedHospitalId }) {
  // Remove internal state for hospitalId - it now comes from props

  const [name, setName] = useState(""); // For Add Doctor form
  const [speciality, setSpeciality] = useState(""); // For Add Doctor form
  const [doctors, setDoctors] = useState([]); // List of doctors for the selected hospitalId
  const [newHospitalIdMap, setNewHospitalIdMap] = useState({}); // For reassignment inputs
  const [isLoading, setIsLoading] = useState(false); // Loading state for doctor list
  const [error, setError] = useState(null); // Error state for doctor list fetching

  // Use useCallback to memoize loadDoctors
  // It now takes hospId as an argument, which will be the prop value
  const loadDoctors = useCallback(async (hospId) => {
    // Check if a valid hospital ID is provided via props
    if (hospId && String(hospId).trim() !== "") {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchDoctors(String(hospId).trim());
        setDoctors(data.doctors || []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(`Failed to fetch doctors: ${err.message || 'Server error'}`);
        setDoctors([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // If no valid hospital ID is passed as a prop, clear the list and error
      setDoctors([]);
      setError(null);
      setIsLoading(false); // Ensure loading is set to false
    }
  }, []); // fetchDoctors is assumed stable, so no dependencies needed here

  // Load doctors whenever the selectedHospitalId prop changes.
  useEffect(() => {
    // Load doctors based on the prop value
    loadDoctors(selectedHospitalId);
  }, [selectedHospitalId, loadDoctors]); // Depend on the prop and the memoized function

  // Handle adding a new doctor to the currently selected hospital
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    // Use the selectedHospitalId prop for the API call
    if (!selectedHospitalId || String(selectedHospitalId).trim() === "") {
      alert("No hospital selected. Please select a hospital first.");
      return;
    }
    if (!name.trim() || !speciality.trim()) {
      alert("Please enter both Doctor Name and Speciality.");
      return;
    }

    try {
      const doctorData = {
        name: name.trim(),
        speciality: speciality.trim(),
      };
      // Pass the selectedHospitalId prop to the addDoctor API call
      const response = await addDoctor(String(selectedHospitalId).trim(), doctorData);

      if (response && (response.message === "Doctor added successfully!" || response.id)) {
        alert("Doctor added successfully!");
        setName(""); // Clear form fields
        setSpeciality("");
        // **Reload doctors for the *currently selected* hospital**
        await loadDoctors(selectedHospitalId); // Use the prop here
      } else {
        alert(`Error adding doctor: ${response?.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error adding doctor:", err);
      alert(`Error adding doctor: ${err.message || 'Network or server error'}`);
    }
  };

  // Handle deleting a doctor (remains largely the same, uses doctorId)
  const handleDelete = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await deleteDoctor(doctorId);
        alert('Doctor deleted successfully');
        setDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor.id !== doctorId));
        setNewHospitalIdMap((prevMap) => {
            const newMap = {...prevMap};
            delete newMap[doctorId];
            return newMap;
        });
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert(`Error deleting doctor: ${error.message || 'Failed to delete'}`);
      }
    }
  };

  // Handle updating a doctor's hospital assignment (remains largely the same)
  const handleUpdateAssignment = async (doctorId) => {
    const newHospIdRaw = newHospitalIdMap[doctorId];
    const newHospId = newHospIdRaw ? String(newHospIdRaw).trim() : "";

    if (!newHospId) {
      alert('Please enter a valid target Hospital ID for reassignment.');
      return;
    }

    try {
      await updateDoctorHospital(doctorId, newHospId);
      alert('Doctor assignment updated successfully! The doctor may no longer appear in this list if moved.');
      // **Reload doctors for the *currently selected* hospital**
      await loadDoctors(selectedHospitalId); // Use the prop here
      setNewHospitalIdMap((prevMap) => {
          const newMap = {...prevMap};
          delete newMap[doctorId];
          return newMap;
      });
    } catch (error) {
      console.error('Error updating doctor assignment:', error);
      alert(`Error updating assignment: ${error.message || 'Failed to update'}`);
    }
  };

  // Handle changes in the reassignment input fields (no change needed)
  const handleReassignInputChange = (doctorId, value) => {
    setNewHospitalIdMap((prevMap) => ({
      ...prevMap,
      [doctorId]: value,
    }));
  };

  // Conditionally render the entire component or parts based on selectedHospitalId
  if (!selectedHospitalId) {
    return <p>Please select a hospital from the list above to manage doctors.</p>;
    // Or return null, or a different placeholder
  }

  return (
    <div>
      {/* Section 1: Add Doctor Form - No longer needs the hospital ID input */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #007bff', borderRadius: '5px' }}>
         <h3>Add New Doctor to Hospital ID: {selectedHospitalId}</h3>
         <form onSubmit={handleAddSubmit}>
           {/* Hospital ID Input REMOVED */}
           <div style={{ marginBottom: '10px' }}>
               <label htmlFor="doctorNameInput" style={{ marginRight: '10px' }}>Doctor Name:</label>
               <input
                 id="doctorNameInput"
                 type="text"
                 placeholder="Enter doctor's name"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 required
                 style={{ padding: '8px' }}
               />
           </div>
           <div style={{ marginBottom: '10px' }}>
               <label htmlFor="doctorSpecialityInput" style={{ marginRight: '10px' }}>Speciality:</label>
               <input
                 id="doctorSpecialityInput"
                 type="text"
                 placeholder="Enter speciality"
                 value={speciality}
                 onChange={(e) => setSpeciality(e.target.value)}
                 required
                 style={{ padding: '8px' }}
               />
           </div>
           {/* Button text updated to reflect the selected hospital */}
           <button type="submit" style={{ padding: '10px 15px', cursor: 'pointer' }}>
              Add Doctor to Hospital {selectedHospitalId}
           </button>
         </form>
      </div>

      <hr />

      {/* Section 2: Doctors List for the selected Hospital ID */}
      <h3>Doctors in Hospital ID: {selectedHospitalId}</h3>
      {isLoading ? (
        <p>Loading doctors...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : doctors.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {doctors.map((doctor) => (
            <li key={doctor.id} style={{ border: '1px solid #ccc', marginBottom: '15px', padding: '15px', borderRadius: '5px' }}>
              {/* ... (Doctor details, Delete, and Reassign controls remain the same) ... */}
               <div>
                 <strong>{doctor.name}</strong> ({doctor.specialization || "N/A"})
                 <br />
                 <small>Current Hospital ID: {doctor.hospital_id || 'None'}</small>
                 <small style={{marginLeft: '15px'}}>Doctor ID: {doctor.id}</small>
              </div>
              <div style={{ marginTop: '10px' }}>
                <button
                    onClick={() => handleDelete(doctor.id)}
                    style={{ marginRight: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #eee' }}>
                <label htmlFor={`reassign-${doctor.id}`} style={{ marginRight: '5px' }}>Reassign to Hospital ID:</label>
                <input
                  id={`reassign-${doctor.id}`}
                  type="text"
                  value={newHospitalIdMap[doctor.id] || ''}
                  onChange={(e) => handleReassignInputChange(doctor.id, e.target.value)}
                  placeholder="New Hospital ID"
                  style={{ padding: '5px', marginRight: '5px', width: '120px' }}
                />
                <button
                    onClick={() => handleUpdateAssignment(doctor.id)}
                    disabled={!newHospitalIdMap[doctor.id]?.trim()}
                    style={{ padding: '5px 10px', cursor: 'pointer' }}>
                  Update Assignment
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        // Message updated assuming hospitalId is valid but no doctors found
        <p>No doctors found for Hospital ID: {selectedHospitalId}. You can add one using the form above.</p>
      )}
    </div>
  );
}

export default DoctorForm;

