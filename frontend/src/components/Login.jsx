import React, { useState, useEffect } from 'react'
import Input from './Input';
import {useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';


function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [pass, setPassword] = useState('');

    const register = async () => {
        try {
            const res = await axios.post('http://localhost:5000/register', { 
                username: username,
                pass: pass 
            });            
            alert('Successfully Registered. Press Login to Continue')
            console.log(res.data);
            navigate('/')

        } catch (err) {
            console.error(err);
        }
    };

    const login = async () => {
        try {
            const res = await axios.post('http://localhost:5000/login', { 
                username,
                pass,
            });
            localStorage.setItem('token', res.data.token);
            console.log(res.data);
            navigate('/main');
        } catch (err) {
            console.error(err);
            alert("fail")
        }
    };

    return(
        <div class = "body-div">
            <div className = "container">
                <div className = "left">
                    <div class = "main-label">Sign In</div>
    
                    <Input inputLabel = "USERNAME" type = "text" place = "Username" functionValue = {(e) => setUsername(e.target.value)} />
                    <Input inputLabel = "PASSWORD" type = "password" place = "Password" functionValue = {(e) => setPassword(e.target.value)} />

                    <div className = "submit-div">
                        <input type = "submit" className = "submit-button" value = "Sign In" onClick={login}/>
                    </div>
                    <div className = "extras">
                        <div className = "extras-left">
                            <input type = "checkbox" className = "check"></input>
                            Remember Me
                        </div>
                        
                        <div className = "extras-right">
                            Forgot Password?
                        </div>
                    </div>
                </div>

                <div className = "right">
                    <div className = "right-content">
                        <div className = "welcome">Welcome to Login</div>
                        <div className = "mid-text">Don't Have an Account?</div>
                        <div className = "sign-in-div">
                            <input type = "submit" className = "sign-in-button" value = "Sign Up" onClick = {register}/>
                            {/* <button onClick={() => navigate('/main')}>Main</button> */}
                            {/* <Link to = "/main">Main</Link> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;