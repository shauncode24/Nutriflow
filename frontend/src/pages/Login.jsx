import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";
import Input from "../components/Input";
import { motion } from "framer-motion";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [pass, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const register = async () => {
    try {
      if (pass !== confirmPass) {
        alert("Passwords do not match!");
        return;
      }

      const res = await axios.post("http://localhost:5000/register", {
        username: username,
        pass: pass,
      });

      alert("Successfully Registered. Press Login to Continue");
      console.log(res.data);

      setIsSignup(false);
      setConfirmPass("");
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        username,
        pass,
      });
      localStorage.setItem("token", res.data.token);
      console.log(res.data);
      navigate("/main");
    } catch (err) {
      console.error(err);
      alert("fail");
    }
  };

  return (
    <div className="default-login body-div">
      <motion.div
        className="default-login container"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* <div className="default-login top"> */}
        <div className="default-login main-label">
          <div className="default-login login-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-person"
              viewBox="0 0 16 16"
            >
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
            </svg>
          </div>
          <span>{isSignup ? "Create Account" : "Welcome Back"}</span>
          <p>
            {isSignup ? "Sign up to get started" : "Sign in to your account"}
          </p>
        </div>

        <Input
          inputLabel="USERNAME"
          type="text"
          place="Username"
          functionValue={(e) => setUsername(e.target.value)}
        />
        <Input
          inputLabel="PASSWORD"
          type="password"
          place="Password"
          functionValue={(e) => setPassword(e.target.value)}
        />

        {isSignup && (
          <Input
            inputLabel="CONFIRM PASSWORD"
            type="password"
            place="Re-enter Password"
            functionValue={(e) => setConfirmPass(e.target.value)}
          />
        )}

        <input
          type="submit"
          className="default-login submit-button"
          value={isSignup ? "Sign Up" : "Sign In"}
          onClick={isSignup ? register : login}
        />

        <div className="default-login divider">
          <span>Or</span>
        </div>

        <button
          type="submit"
          className="default-login submit-button"
          onClick={login}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            class="bi bi-browser-chrome"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M16 8a8 8 0 0 1-7.022 7.94l1.902-7.098a3 3 0 0 0 .05-1.492A3 3 0 0 0 10.237 6h5.511A8 8 0 0 1 16 8M0 8a8 8 0 0 0 7.927 8l1.426-5.321a3 3 0 0 1-.723.255 3 3 0 0 1-1.743-.147 3 3 0 0 1-1.043-.7L.633 4.876A8 8 0 0 0 0 8m5.004-.167L1.108 3.936A8.003 8.003 0 0 1 15.418 5H8.066a3 3 0 0 0-1.252.243 2.99 2.99 0 0 0-1.81 2.59M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4"
            />
          </svg>
          Continue With Google
        </button>

        <div className="default-login sign-in-div">
          {isSignup ? (
            <>
              Already have an account? &nbsp;
              <button
                className="default-login sign-in-button"
                onClick={() => setIsSignup(false)}
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account? &nbsp;
              <button
                className="default-login sign-in-button"
                onClick={() => setIsSignup(true)}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
        {/* </div> */}
      </motion.div>
    </div>
  );
}

export default Login;
