import React, {useContext, useState} from "react";
import {UserContext} from "../App";
import {registerUser} from "../services/api";
import { useNavigate } from 'react-router-dom';

function RegisterUser(){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const navigate = useNavigate();
    const {user} = useContext(UserContext);

    const handlSubmit = async (e) => {
        e.preventDefault();
        try{
            const data = {
                email,
                password,
                role
            }
            const response = await registerUser(data);
            if(response.status === 200){
                user(response.data);
                navigate("/login");
            } else{
                alert("Invalid credentials");
            }
        } catch(err){
            console.log(err);
        }
    }
    return(
        <div>
            <h1>Register</h1>
            <form onSubmit={handlSubmit}>
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required/>
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required/>
                <select onChange={(e) => setRole(e.target.value)} required>
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
export default RegisterUser;