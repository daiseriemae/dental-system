
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../Firebase.js";

export default function Sidebar({ role = "patient", active = "dashboard" }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const patientLinks = [
        {
            key: "dashboard",
            label: "Dashboard",
            icon: "🏠",
            href: "/patient/dashboard"
        },
        {
            key: "appointments",
            label: "Appointments",
            icon: "📅",
            href: "/patient/appointment"
        },
        {
            key: "records",
            label: "Dental Records",
            icon: "📋",
            href: "/patient/record"
        },
        {
            key: "services",
            label: "Dental Services",
            icon: "🦷",
            href: "/patient/services"
        },
        {
            key: "profile",
            label: "My Profile",
            icon: "👤",
            href: "/patient/profile"
        }
    ];

    const dentistLinks = [
        {
            key: "dashboard",
            label: "Dashboard",
            icon: "🏠",
            href: "/dentist/dashboard"
        },
        {
            key: "appointments",
            label: "Appointments",
            icon: "📅",
            href: "/dentist/appointments"
        },
        {
            key: "records",
            label: "Patient Records",
            icon: "📋",
            href: "/dentist/patient-record"
        },
        {
            key: "services",
            label: "Services",
            icon: "🦷",
            href: "/dentist/services"
        },
        {
            key: "profile",
            label: "My Profile",
            icon: "👤",
            href: "/dentist/profile"
        }
    ];

    const links = role === "dentist"
        ? dentistLinks
        : patientLinks;

    function closeSidebar() {
        const sidebar = document.getElementById("sidebar");

        if (sidebar) {
            sidebar.classList.remove("show");
            sidebar.classList.remove("open");
        }
    }

    function logout() {
        setShowLogoutModal(true);
    }

    async function confirmLogout() {
        try {
            setIsLoggingOut(true);

            await signOut(auth);

            localStorage.removeItem("userEmail");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userFirstName");
            localStorage.removeItem("userLastName");
            localStorage.removeItem("userPhoto");
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("dentistName");
            localStorage.removeItem("dentalCareUser");

            window.location.href = "/login";
        } catch (error) {
            console.error("Logout error:", error);

            alert("Unable to logout. Please try again.");

            setIsLoggingOut(false);
        }
    }

    return (
        <>
            <style>{`
                .dc-sidebar {
                    position: fixed;
                    left: 0;
                    top: 0;
                    width: 250px;
                    height: 100vh;
                    background: #9b7bb8;
                    color: white;
                    padding: 25px 18px;
                    z-index: 2000;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 3px 0 18px rgba(79, 61, 99, 0.12);
                    transition: left 0.25s ease;
                }

                .dc-sidebar *,
                .dc-sidebar *::before,
                .dc-sidebar *::after {
                    box-sizing: border-box;
                }

                .dc-sidebar-logo {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .dc-sidebar-logo-circle {
                    width: 58px;
                    height: 58px;
                    margin: 0 auto 10px;
                    background: white;
                    color: #9b7bb8;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 27px;
                }

                .dc-sidebar-logo h2 {
                    margin: 0 0 4px;
                    color: white;
                    font-size: 21px;
                    font-weight: 600;
                }

                .dc-sidebar-logo p {
                    margin: 0;
                    color: white;
                    font-size: 12px;
                    opacity: 0.88;
                }

                .dc-sidebar-nav {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .dc-sidebar-nav li {
                    margin-bottom: 8px;
                }

                .dc-sidebar-nav a {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    width: 100%;
                    padding: 12px 14px;
                    border-radius: 10px;
                    color: white;
                    text-decoration: none;
                    font-size: 14px;
                    transition: 0.2s;
                }

                .dc-sidebar-nav a:hover,
                .dc-sidebar-nav a.active {
                    background: rgba(255, 255, 255, 0.20);
                    color: white;
                }

                .dc-sidebar-icon {
                    width: 22px;
                    text-align: center;
                    font-size: 17px;
                    flex-shrink: 0;
                }

                .dc-sidebar-logout {
                    margin-top: auto;
                }

                .dc-sidebar-logout button {
                    width: 100%;
                    border: 1px solid rgba(255, 255, 255, 0.45);
                    background: rgba(255, 255, 255, 0.10);
                    color: white;
                    padding: 12px 14px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: 0.2s;
                }

                .dc-sidebar-logout button:hover {
                    background: rgba(255, 255, 255, 0.22);
                }

                .dc-sidebar-close {
                    display: none;
                    position: absolute;
                    top: 13px;
                    right: 13px;
                    border: none;
                    background: transparent;
                    color: white;
                    font-size: 27px;
                    line-height: 1;
                    cursor: pointer;
                }

                /* LOGOUT CONFIRMATION MODAL */

                .dc-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(35, 25, 45, 0.55);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    z-index: 9999;
                    backdrop-filter: blur(3px);
                }

                .dc-logout-modal {
                    background: white;
                    width: 100%;
                    max-width: 390px;
                    padding: 30px;
                    border-radius: 18px;
                    text-align: center;
                    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.18);
                    animation: dcModalShow 0.2s ease;
                }

                .dc-logout-icon {
                    width: 65px;
                    height: 65px;
                    margin: 0 auto 18px;
                    border-radius: 50%;
                    background: #f3efff;
                    color: #9b7bb8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 30px;
                }

                .dc-logout-modal h3 {
                    color: #443653;
                    font-size: 21px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }

                .dc-logout-modal p {
                    color: #777;
                    font-size: 14px;
                    line-height: 1.6;
                    margin-bottom: 25px;
                }

                .dc-logout-actions {
                    display: flex;
                    gap: 12px;
                }

                .dc-logout-actions button {
                    flex: 1;
                    padding: 11px;
                    border-radius: 9px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .dc-logout-cancel {
                    background: white;
                    color: #80609e;
                    border: 1px solid #d8ccec;
                }

                .dc-logout-cancel:hover {
                    background: #f3efff;
                }

                .dc-logout-confirm {
                    background: #9b7bb8;
                    color: white;
                    border: 1px solid #9b7bb8;
                }

                .dc-logout-confirm:hover {
                    background: #80609e;
                }

                .dc-logout-actions button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @keyframes dcModalShow {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .dc-sidebar {
                        left: -270px;
                    }

                    .dc-sidebar.show,
                    .dc-sidebar.open {
                        left: 0;
                    }

                    .dc-sidebar-close {
                        display: block;
                    }
                }
            `}</style>

            {/* SIDEBAR */}

            <aside
                className="dc-sidebar"
                id="sidebar"
            >
                <button
                    type="button"
                    className="dc-sidebar-close"
                    onClick={closeSidebar}
                    aria-label="Close sidebar"
                >
                    ×
                </button>

                <div className="dc-sidebar-logo">
                    <div className="dc-sidebar-logo-circle">
                        🦷
                    </div>

                    <h2>DentalCare</h2>

                    <p>
                        {role === "dentist"
                            ? "Dentist Portal"
                            : "Patient Portal"}
                    </p>
                </div>

                <ul className="dc-sidebar-nav">
                    {links.map((link) => (
                        <li key={link.key}>
                            <a
                                href={link.href}
                                className={
                                    active === link.key
                                        ? "active"
                                        : ""
                                }
                                onClick={closeSidebar}
                            >
                                <span className="dc-sidebar-icon">
                                    {link.icon}
                                </span>

                                <span>
                                    {link.label}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="dc-sidebar-logout">
                    <button
                        type="button"
                        onClick={logout}
                    >
                        <span className="dc-sidebar-icon">
                            ↪
                        </span>{" "}
                        Logout
                    </button>
                </div>
            </aside>

            {/* LOGOUT CONFIRMATION POPUP */}

            {showLogoutModal && (
                <div
                    className="dc-modal-overlay"
                    onClick={() => {
                        if (!isLoggingOut) {
                            setShowLogoutModal(false);
                        }
                    }}
                >
                    <div
                        className="dc-logout-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="dc-logout-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="dc-logout-icon">
                            ↪
                        </div>

                        <h3 id="dc-logout-title">
                            Confirm Logout
                        </h3>

                        <p>
                            Are you sure you want to log out
                            of your DentalCare account?
                        </p>

                        <div className="dc-logout-actions">
                            <button
                                type="button"
                                className="dc-logout-cancel"
                                disabled={isLoggingOut}
                                onClick={() => setShowLogoutModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="dc-logout-confirm"
                                disabled={isLoggingOut}
                                onClick={confirmLogout}
                            >
                                {isLoggingOut
                                    ? "Logging out..."
                                    : "Yes, Logout"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
