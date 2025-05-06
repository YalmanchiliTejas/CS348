import React, { useContext, useState } from 'react';
import { UserContext } from '../App';
import HospitalForm from './HospitalForm';
import HospitalList from './HospitalList';
import DoctorForm from './DoctorForm';
import DoctorList from './DoctorList';
import Report from './Report';
import ReviewForm from './ReviewForm'; // Import ReviewForm
import ReviewList from './ReviewList'; // Import ReviewList

function Dashboard() {
  const { user } = useContext(UserContext);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [reviewUpdateCounter, setReviewUpdateCounter] = useState(0);

  const handleSelectHospital = (hospitalId) => {
    setSelectedHospitalId(hospitalId);
    setReviewUpdateCounter(0); 
  };

  const handleReviewAdded = () => {
    console.log("Dashboard: Review added successfully! Triggering list refresh.");
    // Incrementing the counter changes the refreshKey prop for ReviewList
    setReviewUpdateCounter(prevCounter => prevCounter + 1);
  };
  return (
    <div>
      <h2>Dashboard</h2>
      {user && (
        <div>
          <p>
            Welcome, {user.name} (Role: {user.role})
          </p>
          {user.role === 'admin' ? (
            <>
              <h3>Hospital Management</h3>
              <HospitalForm />
              <HospitalList onSelectHospital={handleSelectHospital} />
              <h3>Doctor Management</h3>
              <DoctorForm selectedHospitalId={selectedHospitalId}/>
              
            </>
          ) : user.role === 'user' ? (
            <>
              <h3>Search Hospitals</h3>
              <HospitalList onSelectHospital={handleSelectHospital} />
              {selectedHospitalId && (
                <>
                  <h3>Submit a Review</h3>
                  <ReviewForm hospitalId={selectedHospitalId}  onReviewSuccess={handleReviewAdded} />
                  <h3>Previous Reviews</h3>
                  <ReviewList hospitalId={selectedHospitalId} reviewCounter={reviewUpdateCounter} />
                </>
              )}
              <h3>Review Report</h3>
              <Report />
            </>
          ) : (
            <p>No specific dashboard available for your role.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
