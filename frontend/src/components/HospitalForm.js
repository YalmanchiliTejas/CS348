import React, {useState} from 'react';
import {addHospital} from '../services/api';

function HospitalForm(){


    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");


    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const data = {
                name,
                address,
                state,
                city
            }
            const response = await addHospital(data);
            if(response.status === 201){
                alert("Hospital added successfully");
            }
        } catch(err){
            console.log(err);
        }
    }


    return (
        <div>
            <h1>Add Hospital</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} required/>
                <input type="text" placeholder="Address" onChange={(e) => setAddress(e.target.value)} required/>
                <input type="text" placeholder="State" onChange={(e) => setState(e.target.value)} required/>
                <input type="text" placeholder="City" onChange={(e) => setCity(e.target.value)} required/>
                <button type="submit">Add Hospital</button>
            </form>
        </div>
    );


}

export default HospitalForm;
