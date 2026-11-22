
import React, { useState } from "react";

import {
    createUserWithEmailAndPassword
} from "firebase/auth";

import {
    doc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";

import {
    auth,
    db
} from "../Firebase";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

export default function Register() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        licenseId: "",
        password: "",
        confirmPassword: "",
        terms: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("danger");
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        const { name, value, checked, type } = event.target;

        setForm(previous => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));
    }

    function showMessage(text, type = "danger") {
        setMessage(text);
        setMessageType(type);
    }

    // ==========================================
    // REGISTER ACCOUNT
    // FIREBASE AUTHENTICATION + FIRESTORE
    // ==========================================

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) return;

        const firstName = form.firstName.trim();
        const lastName = form.lastName.trim();
        const email = form.email.trim().toLowerCase();
        const role = form.role;
        const licenseId = form.licenseId.trim();
        const password = form.password;
        const confirmPassword = form.confirmPassword;

        if (!firstName || !lastName || !email) {
            showMessage("Please complete all required fields.");
            return;
        }

        if (!role) {
            showMessage("Please select your account type.");
            return;
        }

        if (role === "dentist" && !licenseId) {
            showMessage("Please enter your Professional License ID.");
            return;
        }

        if (password.length < 6) {
            showMessage("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");
            return;
        }

        if (!form.terms) {
            showMessage("Please agree to the terms and conditions.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            // ==================================
            // STEP 1: CREATE FIREBASE ACCOUNT
            // ==================================

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const currentUser = userCredential.user;

            console.log(
                "Firebase account created:",
                currentUser.uid
            );

            // ==================================
            // STEP 2: SAVE USER DETAILS TO FIRESTORE
            // ==================================

            const userData = {
                uid: currentUser.uid,
                firstName: firstName,
                lastName: lastName,
                displayName: `${firstName} ${lastName}`,
                email: email,
                role: role,
                photoURL: "",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Save license ID only for dentists.
            if (role === "dentist") {
                userData.licenseId = licenseId;
            }

            await setDoc(
                doc(db, "users", currentUser.uid),
                userData
            );

            console.log(
                "User information saved to Firestore."
            );

            // ==================================
            // STEP 3: REGISTER PATIENT IN MYSQL
            // ==================================

            let patientId = "";

            if (role === "patient") {
                const response = await fetch(
                    `${API_URL}/api/patients`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            firstName,
                            lastName,
                            email,
                            phone: ""
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "Patient information could not be saved to MySQL."
                    );
                }

                patientId =
                    result.patient?.patientCode ||
                    result.patient?.id ||
                    "";

                if (!patientId) {
                    throw new Error(
                        "Patient was registered, but the Patient ID was not returned by the backend."
                    );
                }

                console.log(
                    "Patient saved to MySQL:",
                    patientId
                );
            }

            // ==================================
            // STEP 4: SHOW SUCCESS MESSAGE
            // ==================================

            showMessage(
                role === "dentist"
                    ? "Dentist account created successfully! Redirecting to login..."
                    : "Patient account created successfully! Redirecting to login...",
                "success"
            );

            // Do not save the user as logged in here.
            // The user must log in first.

            setTimeout(() => {
                if (role === "dentist") {
                    window.location.href = "/dentist-login.html";
                } else {
                    window.location.href = "/login";
                }
            }, 1500);

        } catch (error) {
            console.error("Registration error:", error);

            let errorMessage =
                "Registration failed. Please try again.";

            if (error.code === "auth/email-already-in-use") {
                errorMessage =
                    "This email is already registered. Please use another email or log in.";

            } else if (error.code === "auth/invalid-email") {
                errorMessage =
                    "Please enter a valid email address.";

            } else if (error.code === "auth/weak-password") {
                errorMessage =
                    "Your password is too weak. Please use at least 6 characters.";

            } else if (error.code === "auth/network-request-failed") {
                errorMessage =
                    "Network error. Please check your internet connection.";

            } else if (error.code === "permission-denied") {
                errorMessage =
                    "Firestore permission denied. Please check your Firebase security rules.";

            } else if (error.message) {
                errorMessage = error.message;
            }

            showMessage(errorMessage);

        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <style>{`
                body {
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(
                        135deg,
                        #eee8ff,
                        #f8f5ff,
                        #e9ddf7
                    );
                    font-family: Arial, sans-serif;
                }

                .register-card {
                    width: 100%;
                    max-width: 480px;
                    background: linear-gradient(
                        145deg,
                        #ffffff 0%,
                        #faf8ff 55%,
                        #f1eaff 100%
                    );
                    border-radius: 25px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 15px 40px
                        rgba(123, 97, 168, 0.20);
                }

                .register-card::before {
                    content: "";
                    position: absolute;
                    width: 180px;
                    height: 180px;
                    background: rgba(155, 123, 184, 0.12);
                    border-radius: 50%;
                    top: -90px;
                    right: -60px;
                }

                .register-card::after {
                    content: "";
                    position: absolute;
                    width: 140px;
                    height: 140px;
                    background: rgba(169, 139, 196, 0.10);
                    border-radius: 50%;
                    bottom: -70px;
                    left: -50px;
                }

                .register-card > * {
                    position: relative;
                    z-index: 2;
                }

                .logo-container {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 15px;
                    border-radius: 50%;
                    background-color: #eee7ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    box-shadow: 0 5px 15px
                        rgba(123, 97, 168, 0.12);
                }

                .logo-container img {
                    width: 80px;
                    height: 80px;
                    object-fit: cover;
                }

                .register-title {
                    color: #7b61a8;
                    font-weight: bold;
                }

                .register-subtitle {
                    color: #8c8499;
                }

                .form-label {
                    color: #655a70;
                    font-weight: 600;
                }

                .form-control,
                .form-select {
                    height: 45px;
                    border-radius: 10px;
                    border: 1px solid #d8ccec;
                    background-color: rgba(255,255,255,0.90);
                }

                .form-control:focus,
                .form-select:focus {
                    border-color: #a98bc4;
                    box-shadow: 0 0 0 0.2rem
                        rgba(169,139,196,0.20);
                }

                .password-box {
                    position: relative;
                }

                .password-box .form-control {
                    padding-right: 45px;
                }

                .password-icon {
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(15%);
                    color: #9b7bb8;
                    cursor: pointer;
                    font-size: 18px;
                }

                .password-icon:hover {
                    color: #80609e;
                }

                .btn-register {
                    height: 45px;
                    border: none;
                    border-radius: 12px;
                    background-color: #9b7bb8;
                    color: white;
                    font-weight: 600;
                    transition: 0.3s;
                }

                .btn-register:hover {
                    background-color: #80609e;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px
                        rgba(128,96,158,0.25);
                }

                .btn-register:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .signin-link {
                    color: #80609e;
                    font-weight: 600;
                }

                .signin-link:hover {
                    color: #6d4f8e;
                    text-decoration: underline !important;
                }

                .form-check-label {
                    color: #716a78;
                }

                .form-check-input:checked {
                    background-color: #9b7bb8;
                    border-color: #9b7bb8;
                }

                .license-note {
                    font-size: 12px;
                    color: #8c8499;
                    margin-top: 5px;
                }

                @media (max-width: 576px) {
                    .register-card {
                        max-width: 100%;
                        border-radius: 20px;
                        padding: 30px 25px !important;
                    }
                }
            `}</style>

            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6">

                        <div className="register-card p-4 p-md-5">

                            <div className="logo-container">
                                <img
                                    src="/images.jfif"
                                    alt="DentalCare Logo"
                                />
                            </div>

                            <div className="text-center mb-4">
                                <h2 className="register-title">
                                    Create Account
                                </h2>

                                <p className="register-subtitle mb-0">
                                    Register for your DentalCare account.
                                </p>
                            </div>

                            {message && (
                                <div
                                    className={`alert alert-${messageType} text-center`}
                                    role="alert"
                                >
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <label className="form-label">
                                            First Name
                                        </label>

                                        <input
                                            type="text"
                                            name="firstName"
                                            className="form-control"
                                            placeholder="First name"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-6">
                                        <label className="form-label">
                                            Last Name
                                        </label>

                                        <input
                                            type="text"
                                            name="lastName"
                                            className="form-control"
                                            placeholder="Last name"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="Enter your email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Account Type
                                    </label>

                                    <select
                                        name="role"
                                        className="form-select"
                                        value={form.role}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select account type
                                        </option>

                                        <option value="patient">
                                            Patient
                                        </option>

                                        <option value="dentist">
                                            Dentist
                                        </option>
                                    </select>
                                </div>

                                {form.role === "dentist" && (
                                    <div className="mb-3">
                                        <label className="form-label">
                                            <i className="bi bi-card-text me-1"></i>
                                            Professional License ID
                                        </label>

                                        <input
                                            type="text"
                                            name="licenseId"
                                            className="form-control"
                                            placeholder="Enter your professional license ID"
                                            value={form.licenseId}
                                            onChange={handleChange}
                                            required
                                        />

                                        <div className="license-note">
                                            Required for dentist registration.
                                        </div>
                                    </div>
                                )}

                                <div className="mb-3 password-box">
                                    <label className="form-label">
                                        Password
                                    </label>

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="form-control"
                                        placeholder="Create a password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />

                                    <i
                                        className={`bi ${
                                            showPassword
                                                ? "bi-eye"
                                                : "bi-eye-slash"
                                        } password-icon`}
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    ></i>
                                </div>

                                <div className="mb-3 password-box">
                                    <label className="form-label">
                                        Confirm Password
                                    </label>

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmPassword"
                                        className="form-control"
                                        placeholder="Confirm your password"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />

                                    <i
                                        className={`bi ${
                                            showConfirmPassword
                                                ? "bi-eye"
                                                : "bi-eye-slash"
                                        } password-icon`}
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                    ></i>
                                </div>

                                <div className="form-check mb-4">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="terms"
                                        id="terms"
                                        checked={form.terms}
                                        onChange={handleChange}
                                        required
                                    />

                                    <label
                                        className="form-check-label small"
                                        htmlFor="terms"
                                    >
                                        I agree to the terms and conditions.
                                    </label>
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-register"
                                        disabled={loading}
                                    >
                                        <i className="bi bi-person-plus me-1"></i>

                                        {loading
                                            ? "Registering..."
                                            : "Create Account"}
                                    </button>
                                </div>

                                <div className="text-center mt-4">
                                    <small className="text-secondary">
                                        Already have an account?{" "}

                                        <a
                                            href="/login"
                                            className="signin-link text-decoration-none"
                                        >
                                            Login
                                        </a>
                                    </small>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
