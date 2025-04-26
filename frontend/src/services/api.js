import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Adjust the base URL as needed

// Reviews
export const addReview = async (reviewData) => {
  const response = await axios.put(`${API_BASE_URL}/reviews/`, reviewData);
  return response.data;
};

export const fetchReviews = async (filters) => {
  const response = await axios.get(`${API_BASE_URL}/reviews/filterReviews`, { params: filters });
  return response.data;
};

// Doctors
export const fetchDoctors = async (hospitalId) => {
  const response = await axios.get(`${API_BASE_URL}/doctors/${hospitalId}`);
  return response.data;
};

export const addDoctor = async (hospitalId, doctorData) => {
  console.log("This is the doctor data", doctorData);
  console.log("This is the hospital id", hospitalId);
  const response = await axios.post(`${API_BASE_URL}/doctors/${hospitalId}`, doctorData);
  return response.data;
};

// Hospitals
export const getHospitals = async () => {
  const response = await axios.get(`${API_BASE_URL}/hospitals/`);
  return response.data;
};

export const getHospital = async (name) => {
    const response = await axios.get(`${API_BASE_URL}/hospitals/search?name=${encodeURIComponent(name)}`);
    return response.data;
  };
export const addHospital = async (hospitalData) => {
  const response = await axios.post(`${API_BASE_URL}/hospitals/`, hospitalData);
  return response.data;
};

// Authentication
export const registerUser = async (userData) => {
    console.log(userData);
    
  const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
  console.log("This is the response", response);
  return response;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
  console.log("This is the response", response);
  return response;
};

export async function fetchReport(filters) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_BASE_URL}/reviews/filterReviews?${queryParams}`);
    return response.data; // Expecting an object like { reviews: [...] }
  }

  export async function deleteDoctor(doctorId) {
    console.log(doctorId)
    const response = await axios.delete(`${API_BASE_URL}/doctors/${doctorId}`);
    return response.data;
  }
  
  // Call to update a doctor's details using the PUT endpoint
  // Pass an object containing the updated fields, e.g., { name: "New Name", specialization: "New Specialization" }
  export async function updateDoctor(doctorId, data) {
    const response = await axios.put(`${API_BASE_URL}/doctors/${doctorId}`, data);
    return response.data;
  }
  
  // Optionally, if you want to update just the hospital assignment, use PATCH:
  // Pass the new hospital_id as an object, e.g., { hospital_id: 5 }
  export async function updateDoctorHospital(doctorId, hospital_id) {
    const response = await axios.patch(`${API_BASE_URL}/doctors/${doctorId}`, { hospital_id });
    return response.data;
  }


  export const getAllDoctors = async () => {
    const response = await axios.get(`${API_BASE_URL}/doctors/all`);
    console.log("Get All Doctors response", response); // Logging for debugging
    return response; // Return the full Axios response object
  };
  
  // --- NEW: Fetch all distinct specializations for reporting filter ---
  export const getSpecializations = async () => {
    const response = await axios.get(`${API_BASE_URL}/doctors/specializations`);
    console.log("Get Specializations response", response); // Logging for debugging
    return response; // Return the full Axios response object
  };