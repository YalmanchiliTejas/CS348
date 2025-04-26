

import React, { useState } from 'react';
import { addHospital } from '../services/api';
import eventBus from '../services/eventBus'; // Import the event bus

// Removed onHospitalAdded prop - no longer needed for this approach
function HospitalForm() {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!name.trim() || !address.trim() || !city.trim() || !state.trim()) {
            setError("Please fill in all fields: Name, Address, City, State.");
            setIsSubmitting(false);
            return;
        }

        try {
            const hospitalData = { name: name.trim(), address: address.trim(), city: city.trim(), state: state.trim() };
            const response = await addHospital(hospitalData);

            if (response && (response.status === 201 || response.id || response.message === "Hospital added successfully!")) {
                alert("Hospital added successfully");
                setName(""); setAddress(""); setCity(""); setState("");

                // **Emit an event instead of calling a prop**
                console.log("HospitalForm: Emitting hospitalAdded event");
                eventBus.emit('hospitalAdded'); // Notify listeners (like HospitalList)

            } else {
                 const errorMessage = response?.message || 'Failed to add hospital.';
                 setError(errorMessage); alert(`Error: ${errorMessage}`);
            }
        } catch (err) {
            console.error("Error adding hospital:", err);
            const errorMessage = err.message || 'An unexpected error occurred.';
            setError(`Submission failed: ${errorMessage}`); alert(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h1>Add Hospital</h1>
            <form onSubmit={handleSubmit}>
                 {/* Input fields with labels... */}
                 <div style={{ marginBottom: '10px' }}><label htmlFor="hospitalNameAdd">Name: </label><input id="hospitalNameAdd" type="text" placeholder="Hospital Name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                 <div style={{ marginBottom: '10px' }}><label htmlFor="hospitalAddressAdd">Address: </label><input id="hospitalAddressAdd" type="text" placeholder="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
                 <div style={{ marginBottom: '10px' }}><label htmlFor="hospitalCityAdd">City: </label><input id="hospitalCityAdd" type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required /></div>
                 <div style={{ marginBottom: '10px' }}><label htmlFor="hospitalStateAdd">State: </label><input id="hospitalStateAdd" type="text" placeholder="State (e.g., CA)" value={state} onChange={(e) => setState(e.target.value)} required /></div>
                 {error && <p style={{ color: 'red' }}>{error}</p>}
                 <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Hospital'}</button>
             </form>
        </div>
    );
}
export default HospitalForm;
