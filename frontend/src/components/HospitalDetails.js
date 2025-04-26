// import React, { useState, useEffect, useContext } from 'react';
// import { useParams } from 'react-router-dom';
// import { getHospitals } from '../services/api';
// import ReviewForm from './ReviewForm';
// import ReviewList from './ReviewList';
// import { UserContext } from '../App';

// function HospitalDetails() {
//   const { id } = useParams();
//   const [hospital, setHospital] = useState(null);
//   const { user } = useContext(UserContext);

//   useEffect(() => {
//     const loadHospital = async () => {
//       const data = await getHospitals();
//       const found = data.hospitals.find(h => h.hospital_id === parseInt(id, 10));
//       setHospital(found);
//     };
//     loadHospital();
//   }, [id]);

//   if (!hospital) return <p>Loading hospital details...</p>;

//   return (
//     <div>
//       <h3>{hospital.name}</h3>
//       <p>{hospital.city}, {hospital.state}</p>
//       <p>{hospital.address}</p>
//       <hr />
//       {user && user.role === 'patient' ? (
//         <>
//           <h4>Add a Review for {hospital.name}</h4>
//           <ReviewForm hospitalId={hospital.hospital_id} />
//           <hr />
//           <ReviewList hospitalId={hospital.hospital_id} />
//         </>
//       ) : (
//         <p>You must be logged in as a patient to view and add reviews.</p>
//       )}
//     </div>
//   );
// }

// export default HospitalDetails;

import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getHospital } from '../services/api';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { UserContext } from '../App';

function HospitalDetails() {
  // Now using "name" from the URL instead of an ID
  const { name } = useParams();
  const [hospital, setHospital] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const loadHospital = async () => {
      const data = await getHospital(name);
      if (data.hospitals && data.hospitals.length > 0) {
        // If multiple hospitals are returned, take the first match
        setHospital(data.hospitals[0]);
      } else {
        setHospital(null);
      }
    };
    loadHospital();
  }, [name]);

  if (!hospital) return <p>Loading hospital details...</p>;

  return (
    <div>
      <h3>{hospital.name}</h3>
      <p>{hospital.city}, {hospital.state}</p>
      <p>{hospital.address}</p>
      <hr />
      {user && user.role === 'usert' ? (
        <>
          <h4>Add a Review for {hospital.name}</h4>
          <ReviewForm hospitalId={hospital.hospital_id} />
          <hr />
          <ReviewList hospitalId={hospital.hospital_id} />
        </>
      ) : (
        <p>You must be logged in as a patient to view and add reviews.</p>
      )}
    </div>
  );
}

export default HospitalDetails;

