
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Firebase.js";
import Sidebar from "./Sidebar.jsx";

const emptyProfile = {
    fullName: "",
    title: "General Dentist",
    email: "",
    phone: "",
    licenseId: "",
    experience: 0,
    address: "",
    about: ""
};

// Each dentist has a separate localStorage record.
const getStorageKey = (uid) => `dentistProfile_${uid}`;

export default function DentistProfile() {
    const [profile, setProfile] = useState(emptyProfile);
    const [firebaseUid, setFirebaseUid] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Load the logged-in dentist's profile from localStorage.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = "/login";
                return;
            }

            setFirebaseUid(user.uid);
            setLoading(true);
            setError("");
            setMessage("");

            try {
                const savedProfile = localStorage.getItem(
                    getStorageKey(user.uid)
                );

                if (savedProfile) {
                    const parsedProfile = JSON.parse(savedProfile);

                    setProfile({
                        ...emptyProfile,
                        ...parsedProfile
                    });

                    setMessage("Your saved profile has been loaded.");
                } else {
                    const firstName =
                        localStorage.getItem("userFirstName") || "";

                    const lastName =
                        localStorage.getItem("userLastName") || "";

                    const registeredName =
                        `${firstName} ${lastName}`.trim();

                    setProfile({
                        ...emptyProfile,
                        fullName:
                            user.displayName ||
                            registeredName ||
                            "",
                        email: user.email || ""
                    });

                    setMessage(
                        "No saved profile found. Complete your information and click Save Profile."
                    );
                }
            } catch (err) {
                console.error("Load profile error:", err);
                setError("Unable to load your saved profile.");

                setProfile({
                    ...emptyProfile,
                    email: user.email || ""
                });
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Online/offline status.
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch((err) => {
                console.error("Service worker error:", err);
            });
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Update form fields.
    const handleChange = (e) => {
        const { name, value } = e.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Save profile to localStorage.
    const handleSave = (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!firebaseUid) {
            setError("No registered dentist account is logged in.");
            return;
        }

        if (!profile.fullName.trim() || !profile.email.trim()) {
            setError("Full name and email are required.");
            return;
        }

        const experience = Number(profile.experience || 0);

        if (!Number.isInteger(experience) || experience < 0) {
            setError("Years of experience must be a valid non-negative whole number.");
            return;
        }

        setSaving(true);

        try {
            const profileToSave = {
                ...profile,
                experience
            };

            localStorage.setItem(
                getStorageKey(firebaseUid),
                JSON.stringify(profileToSave)
            );

            setProfile(profileToSave);

            setMessage(
                "Your profile has been successfully saved to localStorage."
            );
        } catch (err) {
            console.error("Save profile error:", err);
            setError("Unable to save your profile in this browser.");
        } finally {
            setSaving(false);
        }
    };

    // Restore the last saved profile from localStorage.
    const handleReset = () => {
        if (!window.confirm("Reset the form to its last saved information?")) {
            return;
        }

        if (!firebaseUid) return;

        setMessage("");
        setError("");

        try {
            const savedProfile = localStorage.getItem(
                getStorageKey(firebaseUid)
            );

            if (savedProfile) {
                setProfile({
                    ...emptyProfile,
                    ...JSON.parse(savedProfile)
                });

                setMessage("Your saved profile has been restored.");
            } else {
                setProfile(emptyProfile);
                setMessage("No saved profile was found.");
            }
        } catch (err) {
            console.error("Reset profile error:", err);
            setError("Unable to restore your saved profile.");
        }
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    minHeight: "100vh",
                    background: "#f3efff"
                }}
            >
                <div className="text-center">
                    <div
                        className="spinner-border mb-3"
                        style={{ color: "#80609e" }}
                    />
                    <p className="text-muted">
                        Loading dentist profile...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex">
            <Sidebar role="dentist" active="profile" />

            <main
                className="flex-grow-1 p-3 p-md-4"
                style={{
                    minHeight: "100vh",
                    background: "#f3efff"
                }}
            >
                <div className="container-fluid">

                    {/* PAGE HEADER */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                        <div>
                            <h2
                                className="fw-bold mb-1"
                                style={{ color: "#80609e" }}
                            >
                                My Profile
                            </h2>

                            <p className="text-muted mb-0">
                                Manage your registered dentist information.
                            </p>
                        </div>

                        <span
                            className={`badge rounded-pill px-3 py-2 ${
                                isOnline
                                    ? "bg-success"
                                    : "bg-warning text-dark"
                            }`}
                        >
                            {isOnline ? "Online" : "Offline"}
                        </span>
                    </div>

                    {/* SUCCESS MESSAGE */}
                    {message && (
                        <div className="alert alert-success alert-dismissible fade show">
                            {message}

                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setMessage("")}
                            />
                        </div>
                    )}

                    {/* ERROR MESSAGE */}
                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show">
                            {error}

                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setError("")}
                            />
                        </div>
                    )}

                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-3 p-md-4">

                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "65px",
                                        height: "65px",
                                        background: "#e9def5",
                                        color: "#80609e",
                                        fontSize: "28px"
                                    }}
                                >
                                    <i className="bi bi-person-badge" />
                                </div>

                                <div>
                                    <h5 className="fw-bold mb-1">
                                        Professional Information
                                    </h5>

                                    <p className="text-muted small mb-0">
                                        Your changes will be stored in your browser.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSave}>
                                <div className="row g-3">

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Full Name
                                        </label>

                                        <input
                                            type="text"
                                            name="fullName"
                                            className="form-control"
                                            placeholder="Enter your full name"
                                            value={profile.fullName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Professional Title
                                        </label>

                                        <input
                                            type="text"
                                            name="title"
                                            className="form-control"
                                            placeholder="e.g. General Dentist"
                                            value={profile.title}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Professional Email
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            placeholder="Enter professional email"
                                            value={profile.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Phone Number
                                        </label>

                                        <input
                                            type="text"
                                            name="phone"
                                            className="form-control"
                                            placeholder="Enter phone number"
                                            value={profile.phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            License ID
                                        </label>

                                        <input
                                            type="text"
                                            name="licenseId"
                                            className="form-control"
                                            placeholder="Enter license ID"
                                            value={profile.licenseId}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Years of Experience
                                        </label>

                                        <input
                                            type="number"
                                            name="experience"
                                            className="form-control"
                                            min="0"
                                            step="1"
                                            value={profile.experience}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-semibold">
                                            Clinic Address
                                        </label>

                                        <textarea
                                            name="address"
                                            className="form-control"
                                            rows="2"
                                            placeholder="Enter clinic address"
                                            value={profile.address}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-semibold">
                                            About the Dentist
                                        </label>

                                        <textarea
                                            name="about"
                                            className="form-control"
                                            rows="4"
                                            placeholder="Write a short professional introduction..."
                                            value={profile.about}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <hr className="my-4" />

                                <div className="d-flex flex-wrap justify-content-end gap-2">

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4"
                                        onClick={handleReset}
                                        disabled={saving}
                                    >
                                        <i className="bi bi-arrow-counterclockwise me-2" />
                                        Reset
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn text-white px-4"
                                        disabled={saving}
                                        style={{
                                            background: "#9b7bb8",
                                            borderColor: "#9b7bb8"
                                        }}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-save me-2" />
                                                Save Profile
                                            </>
                                        )}
                                    </button>

                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
