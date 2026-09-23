import { useState } from "react";
import {
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult
} from "firebase/auth";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";

import {
    auth,
    googleProvider,
    db
} from "../Firebase";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("danger");

    const goToDashboard = async (currentUser) => {
        console.log("Google user:", currentUser.email);
        console.log("UID:", currentUser.uid);

        const userRef = doc(
            db,
            "users",
            currentUser.uid
        );

        let userRole = "patient";

        try {
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                console.log(
                    "Firestore user data:",
                    userData
                );

                if (
                    userData.role === "patient" ||
                    userData.role === "dentist"
                ) {
                    userRole = userData.role;
                }
            } else {
                const displayName =
                    currentUser.displayName || "";

                const nameParts =
                    displayName
                        .trim()
                        .split(/\s+/);

                const firstName =
                    nameParts[0] || "";

                const lastName =
                    nameParts
                        .slice(1)
                        .join(" ");

                await setDoc(
                    userRef,
                    {
                        uid: currentUser.uid,
                        email:
                            currentUser.email || "",
                        displayName:
                            currentUser.displayName || "",
                        firstName,
                        lastName,
                        photoURL:
                            currentUser.photoURL || "",
                        role: "patient",
                        createdAt:
                            serverTimestamp(),
                        updatedAt:
                            serverTimestamp()
                    }
                );

                userRole = "patient";
            }

            localStorage.setItem(
                "userEmail",
                currentUser.email || ""
            );

            localStorage.setItem(
                "userFirstName",
                currentUser.displayName
                    ? currentUser.displayName
                          .split(" ")[0]
                    : ""
            );

            localStorage.setItem(
                "userLastName",
                currentUser.displayName
                    ? currentUser.displayName
                          .split(" ")
                          .slice(1)
                          .join(" ")
                    : ""
            );

            localStorage.setItem(
                "userPhoto",
                currentUser.photoURL || ""
            );

            localStorage.setItem(
                "userRole",
                userRole
            );

            localStorage.setItem(
                "isLoggedIn",
                "true"
            );

            console.log(
                "User role:",
                userRole
            );

            if (userRole === "dentist") {
                window.location.href =
                    "/dentist/dashboard";
            } else {
                window.location.href =
                    "/patient/dashboard";
            }

        } catch (error) {
            console.error(
                "Failed to load Firebase user:",
                error
            );

            setMessage(
                "Login succeeded, but your account information could not be loaded. Please check your internet connection and Firestore."
            );

            setMessageType("danger");
        }
    };

    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', 'patient');

    fetch('http://localhost:8080/api/localstorage', {
    method: 'POST',
     headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({
    userEmail: localStorage.getItem('userEmail'),
    userRole: localStorage.getItem('userRole')
    })
    });

    const handlePatientLogin = (event) => {
        event.preventDefault();

        setMessage("");

        const cleanEmail =
            email.trim();

        if (!cleanEmail) {
            setMessage(
                "Please enter your email."
            );

            setMessageType("danger");
            return;
        }

        if (!password) {
            setMessage(
                "Please enter your password."
            );

            setMessageType("danger");
            return;
        }

        localStorage.setItem(
            "userEmail",
            cleanEmail
        );

        localStorage.setItem(
            "userRole",
            "patient"
        );

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );

        window.location.href =
            "/patient/dashboard";
    };

    const handleCancel = () => {
        setEmail("");
        setPassword("");
        setMessage("");
    };

    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            setMessage("");

            console.log(
                "Starting Google login..."
            );

            const result =
                await signInWithPopup(
                    auth,
                    googleProvider
                );

            console.log(
                "Google login successful."
            );

            const currentUser =
                result.user;

            await goToDashboard(
                currentUser
            );

        } catch (error) {
            console.error(
                "Google login failed:",
                error
            );

            let errorMessage =
                "Google login failed. Please try again.";

            if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {
                errorMessage =
                    "Google login was cancelled.";
            }

            else if (
                error.code ===
                "auth/popup-blocked"
            ) {
                errorMessage =
                    "Google login popup was blocked. Please allow popups for this site.";
            }

            else if (
                error.code ===
                "auth/unauthorized-domain"
            ) {
                errorMessage =
                    "This website is not authorized in Firebase. Add localhost to Firebase Authorized Domains.";
            }

            else if (
                error.code ===
                "auth/operation-not-allowed"
            ) {
                errorMessage =
                    "Google Sign-In is not enabled in Firebase Authentication.";
            }

            else if (
                error.code ===
                "auth/network-request-failed"
            ) {
                errorMessage =
                    "Network error. Firebase could not connect. Check your internet connection.";
            }

            else if (
                error.code ===
                "permission-denied"
            ) {
                errorMessage =
                    "Firestore permission denied. Check your Firestore security rules.";
            }

            else if (error.message) {
                errorMessage =
                    error.message;
            }

            setMessage(
                errorMessage
            );

            setMessageType(
                "danger"
            );

        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <>
            <style>{`

                body {
                    min-height: 100vh;
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    background:
                        linear-gradient(
                            135deg,
                            #f3efff,
                            #eee7ff,
                            #f8f5ff
                        );

                    font-family: Arial, sans-serif;
                }

                .login-card {
                    width: 100%;
                    max-width: 380px;

                    background:
                        linear-gradient(
                            145deg,
                            #ffffff,
                            #faf8ff,
                            #f1eaff
                        );

                    border: none;
                    border-radius: 20px;

                    position: relative;
                    overflow: hidden;

                    box-shadow:
                        0 10px 30px
                        rgba(
                            123,
                            97,
                            168,
                            0.18
                        );
                }

                .login-card::before {
                    content: "";

                    position: absolute;

                    width: 140px;
                    height: 140px;

                    border-radius: 50%;

                    background:
                        rgba(
                            155,
                            123,
                            184,
                            0.12
                        );

                    top: -70px;
                    right: -45px;
                }

                .login-card::after {
                    content: "";

                    position: absolute;

                    width: 110px;
                    height: 110px;

                    border-radius: 50%;

                    background:
                        rgba(
                            169,
                            139,
                            196,
                            0.10
                        );

                    bottom: -55px;
                    left: -40px;
                }

                .login-card > * {
                    position: relative;
                    z-index: 2;
                }

                .logo {
                    width: 65px;
                    height: 65px;

                    object-fit: cover;

                    border-radius: 50%;

                    margin-bottom: 8px;

                    box-shadow:
                        0 4px 12px
                        rgba(
                            123,
                            97,
                            168,
                            0.15
                        );
                }

                .title {
                    color: #7b61a8;
                    font-weight: bold;
                }

                .subtitle {
                    color: #8c8499;
                    font-size: 14px;
                }

                .form-label {
                    color: #655a70;
                    font-size: 14px;
                    margin-bottom: 5px;
                }

                .form-control {
                    height: 42px;

                    border:
                        1px solid
                        #d8ccec;

                    border-radius: 10px;

                    background-color:
                        rgba(
                            255,
                            255,
                            255,
                            0.90
                        );

                    font-size: 14px;
                }

                .form-control:focus {
                    border-color: #a98bc4;

                    box-shadow:
                        0 0 0 0.15rem
                        rgba(
                            169,
                            139,
                            196,
                            0.20
                        );
                }

                .password-box {
                    position: relative;
                }

                .password-box input {
                    padding-right: 42px;
                }

                .password-icon {
                    position: absolute;

                    right: 14px;
                    top: 50%;

                    transform:
                        translateY(20%);

                    color: #9b7bb8;

                    cursor: pointer;

                    font-size: 17px;
                }

                .password-icon:hover {
                    color: #80609e;
                }

                .btn-login {
                    background-color: #9b7bb8;

                    color: white;

                    border: none;

                    border-radius: 50px;

                    font-weight: 600;

                    height: 40px;

                    font-size: 14px;

                    transition: 0.2s;
                }

                .btn-login:hover {
                    background-color: #80609e;
                    color: white;
                }

                .btn-cancel {
                    background-color: transparent;

                    color: #9b7bb8;

                    border:
                        1px solid
                        #9b7bb8;

                    border-radius: 50px;

                    height: 40px;

                    font-size: 14px;
                }

                .btn-cancel:hover {
                    background-color: #9b7bb8;
                    color: white;
                }

                .btn-google {
                    background-color: white;

                    color: #4a4452;

                    border:
                        1px solid
                        #d8ccec;

                    border-radius: 50px;

                    height: 40px;

                    font-size: 14px;

                    font-weight: 600;

                    transition: 0.2s;
                }

                .btn-google:hover {
                    background-color: #f8f5ff;

                    border-color: #9b7bb8;

                    color: #80609e;
                }

                .btn-google:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .register-link {
                    color: #80609e;

                    font-weight: bold;

                    text-decoration: none;
                }

                .register-link:hover {
                    color: #6d4f8e;

                    text-decoration: underline;
                }

                .login-message {
                    font-size: 13px;

                    padding: 8px;

                    border-radius: 8px;

                    margin-bottom: 10px;
                }

                @media (max-width: 576px) {

                    body {
                        padding: 5px;
                    }

                    .login-card {
                        max-width: 350px;

                        padding:
                            25px 20px !important;
                    }

                    .logo {
                        width: 60px;
                        height: 60px;
                    }

                }

            `}</style>

            <div className="card login-card p-4">

                <div className="text-center">

                    <img
                        src="/images.jfif"
                        alt="DentalCare Logo"
                        className="logo"
                    />

                </div>

                <div>

                    <div className="text-center mb-3">

                        <h1 className="title fs-5 mb-1">
                            Patient Login
                        </h1>

                        <p className="subtitle mb-0">
                            Login to book and manage your
                            dental appointments.
                        </p>

                    </div>

                    {message && (
                        <div
                            className={
                                `login-message alert alert-${messageType}`
                            }
                            role="alert"
                        >
                            {message}
                        </div>
                    )}

                    <form
                        onSubmit={
                            handlePatientLogin
                        }
                    >

                        <div className="mb-2">

                            <label
                                htmlFor="patientEmail"
                                className="form-label fw-semibold"
                            >
                                Email
                            </label>

                            <input
                                type="email"
                                id="patientEmail"
                                className="form-control"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                required
                            />

                        </div>

                        <div className="mb-3 password-box">

                            <label
                                htmlFor="patientPassword"
                                className="form-label fw-semibold"
                            >
                                Password
                            </label>

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                id="patientPassword"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                required
                            />

                            <i
                                className={
                                    showPassword
                                        ? "bi bi-eye password-icon"
                                        : "bi bi-eye-slash password-icon"
                                }
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            ></i>

                        </div>

                        <div className="d-flex justify-content-center gap-2">

                            <button
                                type="submit"
                                className="btn btn-login px-4"
                            >
                                <i className="bi bi-box-arrow-in-right me-1"></i>
                                Login
                            </button>

                            <button
                                type="button"
                                className="btn btn-cancel px-4"
                                onClick={
                                    handleCancel
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                    <div className="text-center my-3">

                        <div className="text-secondary small mb-2">
                            or
                        </div>

                        <button
                            type="button"
                            className="btn btn-google w-100"
                            onClick={
                                handleGoogleLogin
                            }
                            disabled={
                                googleLoading
                            }
                        >

                            <i className="bi bi-google me-2"></i>

                            {googleLoading
                                ? "Signing in..."
                                : "Continue with Google"
                            }

                        </button>

                    </div>

                    <div className="text-center mt-3">

                        <p className="text-secondary mb-0 small">

                            New patient?{" "}

                            <a
                                href="/register"
                                className="register-link"
                            >
                                Register
                            </a>

                        </p>

                    </div>

                </div>

            </div>
        </>
    );
}