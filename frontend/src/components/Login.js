import React, {useState, useEffect, useContext} from "react";
import {UserContext} from "../App";
import { useNavigate } from 'react-router-dom';
import {loginUser} from  "../services/api";


function Login(){
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const {setUser} = useContext(UserContext);
    const navigate = useNavigate();


    const handleLogin = async (e) => {
        e.preventDefault();
        try{
        const data = {
            email,
            password
        }
        const response = await loginUser(data);
        console.log(response)
        if(response.status === 200){
            setUser(response.data.user);

            console.log(response.data);
            
            navigate("/");
        } else{
            alert("Invalid credentials");
        }
    }
    catch(err){
        console.log(err);
    }
    };

    return(
        <div>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required/>
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required/>
                <button type="submit">Login</button>
            </form>
        </div>
    );

} 
export default Login;