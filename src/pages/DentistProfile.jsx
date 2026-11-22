
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

const getStorageKey = (uid) => `dentistProfile_${uid}`;

export default function DentistProfile() {
    const [profile, setProfile] = useState(emptyProfile);
    const [firebaseUid, setFirebaseUid] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = "/login";
                return;
            }

            setFirebaseUid(user.uid);
            setLoading(true);

            try {
                const saved = localStorage.getItem(
                    getStorageKey(user.uid)
                );

                if (saved) {
                    setProfile({
                        ...emptyProfile,
                        ...JSON.parse(saved)
                    });
                    setMessage("Your profile has been loaded.");
                } else {
                    const firstName =
                        localStorage.getItem("userFirstName") || "";
                    const lastName =
                        localStorage.getItem("userLastName") || "";

                    setProfile({
                        ...emptyProfile,
                        fullName:
                            user.displayName ||
                            `${firstName} ${lastName}`.trim(),
                        email: user.email || ""
                    });
                }
            } catch (err) {
                console.error(err);
                setError("Unable to load your profile.");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const online = () => setIsOnline(true);
        const offline = () => setIsOnline(false);

        window.addEventListener("online", online);
        window.addEventListener("offline", offline);

        return () => {
            window.removeEventListener("online", online);
            window.removeEventListener("offline", offline);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!firebaseUid) {
            setError("No dentist account is logged in.");
            return;
        }

        if (!profile.fullName.trim() || !profile.email.trim()) {
            setError("Full name and email are required.");
            return;
        }

        const experience = Number(profile.experience || 0);

        if (!Number.isInteger(experience) || experience < 0) {
            setError("Enter a valid number of years of experience.");
            return;
        }

        setSaving(true);

        try {
            const updatedProfile = {
                ...profile,
                experience
            };

            localStorage.setItem(
                getStorageKey(firebaseUid),
                JSON.stringify(updatedProfile)
            );

            setProfile(updatedProfile);
            setMessage("Profile successfully saved!");
        } catch (err) {
            console.error(err);
            setError("Unable to save your profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (!window.confirm("Restore your last saved profile?")) return;
        if (!firebaseUid) return;

        try {
            const saved = localStorage.getItem(
                getStorageKey(firebaseUid)
            );

            setProfile(
                saved
                    ? { ...emptyProfile, ...JSON.parse(saved) }
                    : emptyProfile
            );

            setMessage("Profile information restored.");
            setError("");
        } catch (err) {
            setError("Unable to restore your profile.");
        }
    };

    const initials = profile.fullName
        ? profile.fullName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(word => word[0].toUpperCase())
            .join("")
        : "DR";

    if (loading) {
        return (
            <div className="dentist-loading">
                <div className="spinner-border text-primary" />
                <p>Loading dentist profile...</p>
            </div>
        );
    }

    return (
        <div className="dentist-profile-layout">
            <Sidebar role="dentist" active="profile" />

            <main className="dentist-main">

                {/* HEADER */}
                <header className="profile-header">
                    <div>
                        <span className="header-label">
                            DENTALCARE / DENTIST
                        </span>
                        <h2>My Profile</h2>
                        <p>
                            Manage your professional information
                            and account details.
                        </p>
                    </div>

                    <span className={`connection-status ${isOnline ? "online" : "offline"}`}>
                        <span className="status-dot"></span>
                        {isOnline ? "Online" : "Offline"}
                    </span>
                </header>

                {/* ALERTS */}
                {message && (
                    <div className="profile-alert success-alert">
                        <i className="bi bi-check-circle-fill"></i>
                        {message}
                        <button onClick={() => setMessage("")}>×</button>
                    </div>
                )}

                {error && (
                    <div className="profile-alert error-alert">
                        <i className="bi bi-exclamation-circle-fill"></i>
                        {error}
                        <button onClick={() => setError("")}>×</button>
                    </div>
                )}

                {/* PROFILE OVERVIEW */}
                <section className="profile-overview">
                    <div className="profile-avatar">
                        {initials}
                    </div>

                    <div className="profile-identity">
                        <span className="identity-label">
                            DENTIST ACCOUNT
                        </span>
                        <h3>{profile.fullName || "Your Name"}</h3>
                        <p>{profile.title || "General Dentist"}</p>
                        <span className="verified-label">
                            <i className="bi bi-person-check-fill"></i>
                            Professional Profile
                        </span>
                    </div>

                    <div className="overview-stats">
                        <div className="stat-item">
                            <i className="bi bi-award"></i>
                            <div>
                                <strong>{profile.experience || 0}</strong>
                                <span>Years Experience</span>
                            </div>
                        </div>

                        <div className="stat-item">
                            <i className="bi bi-telephone"></i>
                            <div>
                                <strong>{profile.phone ? "Added" : "Not set"}</strong>
                                <span>Phone Number</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FORM */}
                <form onSubmit={handleSave}>

                    {/* PERSONAL INFORMATION */}
                    <section className="profile-card">
                        <div className="section-heading">
                            <div className="section-icon">
                                <i className="bi bi-person-vcard"></i>
                            </div>
                            <div>
                                <h4>Personal Information</h4>
                                <p>Your basic professional details.</p>
                            </div>
                        </div>

                        <div className="profile-form-grid">

                            <div className="form-field">
                                <label>Full Name <span>*</span></label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={profile.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Professional Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={profile.title}
                                    onChange={handleChange}
                                    placeholder="e.g. General Dentist"
                                />
                            </div>

                            <div className="form-field">
                                <label>Professional Email <span>*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profile.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                />
                            </div>

                        </div>
                    </section>

                    {/* PROFESSIONAL INFORMATION */}
                    <section className="profile-card">
                        <div className="section-heading">
                            <div className="section-icon">
                                <i className="bi bi-mortarboard"></i>
                            </div>
                            <div>
                                <h4>Professional Information</h4>
                                <p>Your dental credentials and experience.</p>
                            </div>
                        </div>

                        <div className="profile-form-grid">

                            <div className="form-field">
                                <label>License ID</label>
                                <input
                                    type="text"
                                    name="licenseId"
                                    value={profile.licenseId}
                                    onChange={handleChange}
                                    placeholder="Enter your license ID"
                                />
                            </div>

                            <div className="form-field">
                                <label>Years of Experience</label>
                                <input
                                    type="number"
                                    name="experience"
                                    min="0"
                                    step="1"
                                    value={profile.experience}
                                    onChange={handleChange}
                                    placeholder="Enter years of experience"
                                />
                            </div>

                            <div className="form-field full-width">
                                <label>Clinic Address</label>
                                <textarea
                                    name="address"
                                    value={profile.address}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Enter your clinic address"
                                />
                            </div>

                            <div className="form-field full-width">
                                <label>About the Dentist</label>
                                <textarea
                                    name="about"
                                    value={profile.about}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Write a short professional introduction..."
                                />
                            </div>

                        </div>
                    </section>

                    {/* ACTION BUTTONS */}
                    <div className="profile-actions">
                        <button
                            type="button"
                            className="reset-button"
                            onClick={handleReset}
                            disabled={saving}
                        >
                            <i className="bi bi-arrow-counterclockwise"></i>
                            Restore
                        </button>

                        <button
                            type="submit"
                            className="save-button"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check2-circle"></i>
                                    Save Profile
                                </>
                            )}
                        </button>
                    </div>

                </form>

                <footer className="profile-footer">
                    <i className="bi bi-shield-check"></i>
                    DentalCare Dentist Portal
                </footer>

            </main>

            {/* PAGE DESIGN */}
            <style>{`
                .dentist-profile-layout {
                    min-height: 100vh;
                    background: #f5f3fa;
                    font-family: 'Segoe UI', sans-serif;
                }

                .dentist-main {
                    margin-left: 250px;
                    width: calc(100% - 250px);
                    min-height: 100vh;
                    padding: 35px 45px;
                    box-sizing: border-box;
                }

                .dentist-loading {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 15px;
                    background: #f5f3fa;
                }

                .profile-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 28px;
                }

                .header-label {
                    color: #9273ae;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1.5px;
                }

                .profile-header h2 {
                    font-size: 29px;
                    font-weight: 750;
                    color: #352a43;
                    margin: 7px 0;
                }

                .profile-header p {
                    color: #898293;
                    margin: 0;
                    font-size: 14px;
                }

                .connection-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 9px 16px;
                    border-radius: 30px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .connection-status.online {
                    background: #e1f6eb;
                    color: #168653;
                }

                .connection-status.offline {
                    background: #fff0d7;
                    color: #a36a16;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: currentColor;
                    border-radius: 50%;
                }

                .profile-alert {
                    padding: 14px 18px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 14px;
                }

                .profile-alert button {
                    margin-left: auto;
                    border: none;
                    background: transparent;
                    font-size: 22px;
                    cursor: pointer;
                }

                .success-alert {
                    background: #e4f6ed;
                    color: #187b4b;
                }

                .error-alert {
                    background: #ffe8e8;
                    color: #b83232;
                }

                .profile-overview {
                    display: flex;
                    align-items: center;
                    gap: 23px;
                    background: linear-gradient(115deg, #8765a7, #a58ac0);
                    color: white;
                    border-radius: 20px;
                    padding: 28px 32px;
                    margin-bottom: 25px;
                    box-shadow: 0 8px 25px rgba(92, 64, 121, 0.12);
                }

                .profile-avatar {
                    width: 82px;
                    height: 82px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: white;
                    color: #8765a7;
                    font-size: 27px;
                    font-weight: 800;
                    border: 4px solid rgba(255,255,255,.4);
                }

                .profile-identity {
                    flex: 1;
                    min-width: 0;
                }

                .identity-label {
                    font-size: 10px;
                    letter-spacing: 1.5px;
                    opacity: .8;
                    font-weight: 700;
                }

                .profile-identity h3 {
                    font-size: 23px;
                    font-weight: 700;
                    margin: 5px 0;
                    overflow-wrap: anywhere;
                }

                .profile-identity p {
                    margin: 0 0 9px;
                    font-size: 14px;
                    opacity: .9;
                }

                .verified-label {
                    font-size: 11px;
                    background: rgba(255,255,255,.17);
                    padding: 5px 10px;
                    border-radius: 20px;
                }

                .verified-label i {
                    margin-right: 5px;
                }

                .overview-stats {
                    display: flex;
                    gap: 25px;
                    padding-left: 25px;
                    border-left: 1px solid rgba(255,255,255,.25);
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                }

                .stat-item > i {
                    font-size: 23px;
                    opacity: .9;
                }

                .stat-item strong,
                .stat-item span {
                    display: block;
                }

                .stat-item strong {
                    font-size: 16px;
                }

                .stat-item span {
                    font-size: 10px;
                    opacity: .8;
                    margin-top: 3px;
                }

                .profile-card {
                    background: white;
                    padding: 27px 30px;
                    border-radius: 17px;
                    margin-bottom: 22px;
                    box-shadow: 0 3px 18px rgba(55, 39, 76, .045);
                    border: 1px solid #eee9f4;
                }

                .section-heading {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 27px;
                }

                .section-icon {
                    width: 45px;
                    height: 45px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #f0e9f7;
                    color: #8765a7;
                    border-radius: 12px;
                    font-size: 20px;
                }

                .section-heading h4 {
                    color: #382e45;
                    font-size: 17px;
                    font-weight: 750;
                    margin: 0 0 5px;
                }

                .section-heading p {
                    color: #96909f;
                    font-size: 12px;
                    margin: 0;
                }

                .profile-form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 23px 25px;
                }

                .form-field {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }

                .form-field.full-width {
                    grid-column: 1 / -1;
                }

                .form-field label {
                    color: #494052;
                    font-size: 13px;
                    font-weight: 650;
                    margin-bottom: 9px;
                }

                .form-field label span {
                    color: #db6060;
                }

                .form-field input,
                .form-field textarea {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 12px 15px;
                    border: 1px solid #e5ddec;
                    border-radius: 10px;
                    background: #fdfcff;
                    color: #393044;
                    font-size: 13px;
                    outline: none;
                    transition: .2s ease;
                    font-family: inherit;
                }

                .form-field input {
                    height: 46px;
                }

                .form-field textarea {
                    resize: vertical;
                }

                .form-field input:focus,
                .form-field textarea:focus {
                    border-color: #9875b5;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(152,117,181,.12);
                }

                .form-field input::placeholder,
                .form-field textarea::placeholder {
                    color: #aaa2b3;
                }

                .profile-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin: 25px 0 35px;
                }

                .profile-actions button {
                    padding: 12px 22px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 650;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    transition: .2s;
                }

                .profile-actions button:disabled {
                    opacity: .6;
                    cursor: not-allowed;
                }

                .reset-button {
                    border: 1px solid #ddd4e6;
                    background: white;
                    color: #766584;
                }

                .reset-button:hover {
                    background: #f3eef8;
                }

                .save-button {
                    border: 1px solid #8967a8;
                    background: #8967a8;
                    color: white;
                    box-shadow: 0 4px 12px rgba(137,103,168,.2);
                }

                .save-button:hover {
                    background: #765491;
                    transform: translateY(-1px);
                }

                .profile-footer {
                    border-top: 1px solid #e9e3ef;
                    padding-top: 18px;
                    text-align: center;
                    color: #a29aaa;
                    font-size: 12px;
                }

                .profile-footer i {
                    color: #9474b0;
                    margin-right: 6px;
                }

                @media (max-width: 1100px) {
                    .dentist-main {
                        padding: 28px 25px;
                    }

                    .overview-stats {
                        gap: 15px;
                    }
                }

                @media (max-width: 768px) {
                    .dentist-main {
                        margin-left: 0;
                        width: 100%;
                        padding: 22px 15px;
                    }

                    .profile-overview {
                        flex-wrap: wrap;
                        padding: 23px;
                    }

                    .overview-stats {
                        flex-basis: 100%;
                        border-left: none;
                        border-top: 1px solid rgba(255,255,255,.25);
                        padding: 18px 0 0;
                    }

                    .profile-card {
                        padding: 22px 18px;
                    }

                    .profile-form-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-field.full-width {
                        grid-column: auto;
                    }

                    .profile-header h2 {
                        font-size: 24px;
                    }
                }

                @media (max-width: 480px) {
                    .profile-header {
                        align-items: flex-start;
                    }

                    .connection-status {
                        padding: 7px 10px;
                        font-size: 10px;
                    }

                    .profile-identity h3 {
                        font-size: 19px;
                    }

                    .profile-actions {
                        flex-direction: column-reverse;
                    }

                    .profile-actions button {
                        justify-content: center;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
