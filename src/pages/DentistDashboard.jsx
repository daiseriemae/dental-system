
import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar.jsx";

const api_url=
    "https://dental-system-rzqb.onrender.com";

const APPOINTMENTS_URL = `${api_url}`;
const PATIENTS_URL = `${api_url}/api/patients`;
const SERVICES_URL = `${api_url}/api/services`;

function getDentistName() {
    const firstName = localStorage.getItem("userFirstName") || "";
    const lastName = localStorage.getItem("userLastName") || "";

    const registeredName = `${firstName} ${lastName}`.trim();

    return (
        localStorage.getItem("dentistName") ||
        localStorage.getItem("userName") ||
        (registeredName ? `Dr. ${registeredName}` : "") ||
        localStorage.getItem("userEmail") ||
        "Dentist"
    );
}

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getAppointmentDate(value) {
    if (!value) return "";

    if (typeof value === "string") {
        return value.slice(0, 10);
    }

    if (value instanceof Date) {
        return [
            value.getFullYear(),
            String(value.getMonth() + 1).padStart(2, "0"),
            String(value.getDate()).padStart(2, "0")
        ].join("-");
    }

    return "";
}

function formatTime(value) {
    if (!value) return "Time not set";

    const time = String(value);

    const match = time.match(/^(\d{1,2}):(\d{2})/);

    if (!match) return time;

    let hours = Number(match[1]);
    const minutes = match[2];
    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
}

function getInitials(name) {
    if (!name) return "P";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function getStatusClass(status) {
    return String(status || "").toLowerCase() === "pending"
        ? "pending"
        : "";
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} - ${url}`);
    }

    return response.json();
}

export default function DentistDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [services, setServices] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [dentistName, setDentistName] = useState(getDentistName());

    const today = getTodayDate();

    const loadDashboard = useCallback(async (manualRefresh = false) => {
        if (manualRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        try {
            let appointmentData = [];

            // First try the dentist appointment endpoint.
            // If it is not available, use the existing patient endpoint.
            try {
                const result = await fetchJson(APPOINTMENTS_URL);

                appointmentData = Array.isArray(result)
                    ? result
                    : result.appointments || [];
            } catch (appointmentError) {
                const result = await fetchJson(
                    `${BASE_URL}/api/patient_appoint`
                );

                appointmentData = Array.isArray(result)
                    ? result
                    : result.appointments || [];
            }

            const [patientResult, serviceResult] = await Promise.allSettled([
                fetchJson(PATIENTS_URL),
                fetchJson(SERVICES_URL)
            ]);

            const patientData =
                patientResult.status === "fulfilled"
                    ? patientResult.value
                    : [];

            const serviceData =
                serviceResult.status === "fulfilled"
                    ? serviceResult.value
                    : [];

            setAppointments(appointmentData);

            setPatients(
                Array.isArray(patientData)
                    ? patientData
                    : patientData.patients || []
            );

            setServices(
                Array.isArray(serviceData)
                    ? serviceData
                    : serviceData.services || []
            );

            if (
                patientResult.status === "rejected" ||
                serviceResult.status === "rejected"
            ) {
                setError(
                    "Some dashboard information could not be loaded. Check your patients and services API routes."
                );
            }
        } catch (err) {
            console.error("Dashboard loading error:", err);

            setError(
                "Unable to connect to the backend. Make sure your Express server and MySQL database are running."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        setDentistName(getDentistName());

        loadDashboard();

        // Refresh dashboard information automatically every 30 seconds.
        const refreshInterval = setInterval(() => {
            loadDashboard(true);
        }, 30000);

        return () => clearInterval(refreshInterval);
    }, [loadDashboard]);

    // Show appointments assigned to the logged-in dentist.
    // If no dentist name is saved, show all appointments.
    const dentistAppointments = useMemo(() => {
        const loggedInName = dentistName
            .replace(/^dr\.?\s*/i, "")
            .trim()
            .toLowerCase();

        if (!loggedInName) return appointments;

        const matchingAppointments = appointments.filter((appointment) => {
            const assignedDentist = String(
                appointment.dentist || ""
            )
                .replace(/^dr\.?\s*/i, "")
                .trim()
                .toLowerCase();

            return (
                assignedDentist === loggedInName ||
                assignedDentist.includes(loggedInName) ||
                loggedInName.includes(assignedDentist)
            );
        });

        // If the stored login name does not match the appointment names,
        // keep the records visible instead of showing an empty dashboard.
        return matchingAppointments.length > 0
            ? matchingAppointments
            : appointments;
    }, [appointments, dentistName]);

    const todaysAppointments = useMemo(() => {
        return dentistAppointments
            .filter((appointment) => {
                return (
                    getAppointmentDate(
                        appointment.appointment_date || appointment.date
                    ) === today &&
                    String(appointment.status || "").toLowerCase() !==
                        "cancelled"
                );
            })
            .sort((a, b) => {
                const timeA = String(
                    a.appointment_time || a.time || ""
                );

                const timeB = String(
                    b.appointment_time || b.time || ""
                );

                return timeA.localeCompare(timeB);
            });
    }, [dentistAppointments, today]);

    const pendingAppointments = dentistAppointments.filter(
        (appointment) =>
            String(appointment.status || "").toLowerCase() === "pending"
    );

    const confirmedAppointments = dentistAppointments.filter(
        (appointment) =>
            String(appointment.status || "").toLowerCase() === "confirmed"
    );

    const completedAppointments = dentistAppointments.filter(
        (appointment) =>
            String(appointment.status || "").toLowerCase() === "completed"
    );

    const displayDate = new Date().toLocaleDateString("en-PH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const hour = new Date().getHours();

    const greeting =
        hour < 12
            ? "Good morning"
            : hour < 18
                ? "Good afternoon"
                : "Good evening";

    function showNotifications() {
        window.alert(
            `You have ${pendingAppointments.length} pending appointment requests.\n\n` +
            `${todaysAppointments.length} appointments scheduled today.\n\n` +
            `${confirmedAppointments.length} confirmed appointments.`
        );
    }

    function openSidebar() {
        const sidebar = document.getElementById("sidebar");

        if (sidebar) {
            sidebar.classList.add("show");
        }
    }

    return (
        <>
            <style>{`
                .dentist-dashboard {
                    min-height: 100vh;
                    background: #f7f4fb;
                    color: #4f3d63;
                    font-family: Arial, sans-serif;
                }

                .dentist-dashboard .dashboard-main {
                    margin-left: 250px;
                    min-height: 100vh;
                }

                .dentist-dashboard .topbar {
                    min-height: 75px;
                    background: white;
                    border-bottom: 1px solid #e6dff0;
                    padding: 15px 35px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }

                .dentist-dashboard .topbar-left {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .dentist-dashboard .menu-btn {
                    display: none;
                    border: none;
                    background: #80609e;
                    color: white;
                    width: 42px;
                    height: 42px;
                    border-radius: 9px;
                    cursor: pointer;
                    font-size: 20px;
                }

                .dentist-dashboard .page-title h1 {
                    margin: 0;
                    color: #4f3d63;
                    font-size: 24px;
                }

                .dentist-dashboard .page-title p {
                    margin: 4px 0 0;
                    color: #7d7188;
                    font-size: 13px;
                }

                .dentist-dashboard .dentist-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #f3efff;
                    color: #604879;
                    padding: 10px 15px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .dentist-dashboard .notification-btn,
                .dentist-dashboard .refresh-btn {
                    border: none;
                    background: white;
                    color: #80609e;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                }

                .dentist-dashboard .notification-btn:hover,
                .dentist-dashboard .refresh-btn:hover {
                    background: #f3efff;
                }

                .dentist-dashboard .dashboard-content {
                    padding: 30px;
                    max-width: 1250px;
                }

                .dentist-dashboard .welcome {
                    background: linear-gradient(135deg, #9b7bb8, #80609e);
                    color: white;
                    border-radius: 18px;
                    padding: 25px 28px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 25px;
                    box-shadow: 0 8px 25px rgba(79, 61, 99, 0.12);
                }

                .dentist-dashboard .welcome h2 {
                    margin: 0 0 7px;
                    font-size: 25px;
                }

                .dentist-dashboard .welcome p {
                    margin: 0;
                    font-size: 14px;
                    opacity: .92;
                }

                .dentist-dashboard .welcome-icon {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background: rgba(255,255,255,.18);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 34px;
                    flex-shrink: 0;
                }

                .dentist-dashboard .section-title {
                    color: #604879;
                    font-size: 19px;
                    margin: 0 0 15px;
                }

                .dentist-dashboard .stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 25px;
                }

                .dentist-dashboard .stat-card {
                    background: white;
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 5px 20px rgba(79,61,99,.07);
                    border: 1px solid #eee7f5;
                }

                .dentist-dashboard .stat-icon {
                    width: 45px;
                    height: 45px;
                    border-radius: 12px;
                    background: #f3efff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                }

                .dentist-dashboard .stat-card h3 {
                    margin: 14px 0 3px;
                    font-size: 27px;
                    color: #4f3d63;
                }

                .dentist-dashboard .stat-card p {
                    margin: 0;
                    color: #7d7188;
                    font-size: 13px;
                }

                .dentist-dashboard .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 20px;
                    margin-bottom: 25px;
                }

                .dentist-dashboard .card {
                    background: white;
                    border-radius: 16px;
                    padding: 22px;
                    box-shadow: 0 5px 20px rgba(79,61,99,.07);
                    border: 1px solid #eee7f5;
                    min-width: 0;
                }

                .dentist-dashboard .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 18px;
                }

                .dentist-dashboard .card-header h3 {
                    margin: 0;
                    color: #604879;
                    font-size: 18px;
                }

                .dentist-dashboard .view-link {
                    color: #80609e;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: bold;
                }

                .dentist-dashboard .view-link:hover {
                    text-decoration: underline;
                }

                .dentist-dashboard .appointment-row {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 13px 0;
                    border-bottom: 1px solid #eee7f5;
                }

                .dentist-dashboard .appointment-row:last-child {
                    border-bottom: none;
                }

                .dentist-dashboard .time {
                    width: 80px;
                    color: #80609e;
                    font-size: 13px;
                    font-weight: bold;
                    flex-shrink: 0;
                }

                .dentist-dashboard .patient-avatar {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: #eee7f5;
                    color: #80609e;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    flex-shrink: 0;
                }

                .dentist-dashboard .patient-info {
                    flex: 1;
                    min-width: 0;
                }

                .dentist-dashboard .patient-info strong {
                    display: block;
                    color: #4f3d63;
                    font-size: 14px;
                }

                .dentist-dashboard .patient-info span {
                    color: #8a8191;
                    font-size: 12px;
                }

                .dentist-dashboard .status {
                    padding: 6px 9px;
                    border-radius: 8px;
                    background: #eee7f5;
                    color: #604879;
                    font-size: 11px;
                    font-weight: bold;
                    white-space: nowrap;
                }

                .dentist-dashboard .status.pending {
                    background: #fff3cd;
                    color: #80651a;
                }

                .dentist-dashboard .status.cancelled {
                    background: #fce8e8;
                    color: #a33;
                }

                .dentist-dashboard .status.completed {
                    background: #e1f5e8;
                    color: #287344;
                }

                .dentist-dashboard .quick-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .dentist-dashboard .action-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px;
                    background: #faf8fd;
                    border: 1px solid #eee7f5;
                    border-radius: 12px;
                    color: #4f3d63;
                    text-decoration: none;
                    transition: .2s;
                }

                .dentist-dashboard .action-card:hover {
                    background: #f3efff;
                    border-color: #d8ccec;
                    transform: translateY(-2px);
                }

                .dentist-dashboard .action-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 11px;
                    background: #eee7f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .dentist-dashboard .action-card strong {
                    display: block;
                    font-size: 13px;
                    margin-bottom: 3px;
                }

                .dentist-dashboard .action-card span {
                    color: #8a8191;
                    font-size: 11px;
                }

                .dentist-dashboard .reminder {
                    background: #f3efff;
                    border: 1px solid #e2d5ee;
                    border-radius: 14px;
                    padding: 18px;
                    display: flex;
                    gap: 13px;
                    align-items: flex-start;
                }

                .dentist-dashboard .reminder-icon {
                    font-size: 23px;
                }

                .dentist-dashboard .reminder h4 {
                    margin: 0 0 5px;
                    color: #604879;
                    font-size: 15px;
                }

                .dentist-dashboard .reminder p {
                    margin: 0;
                    color: #766b80;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .dentist-dashboard .dashboard-message {
                    padding: 12px 15px;
                    border-radius: 10px;
                    background: #fff3cd;
                    color: #765b13;
                    font-size: 13px;
                    margin-bottom: 18px;
                }

                .dentist-dashboard .empty-schedule {
                    text-align: center;
                    padding: 28px 12px;
                    color: #8a8191;
                    font-size: 13px;
                }

                @media (max-width: 1050px) {
                    .dentist-dashboard .stats {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .dentist-dashboard .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .dentist-dashboard .dashboard-main {
                        margin-left: 0;
                    }

                    .dentist-dashboard .topbar {
                        padding: 15px 20px;
                    }

                    .dentist-dashboard .menu-btn {
                        display: block;
                    }

                    .dentist-dashboard .dentist-info {
                        display: none;
                    }

                    .dentist-dashboard .dashboard-content {
                        padding: 20px;
                    }

                    .dentist-dashboard .welcome {
                        padding: 20px;
                    }

                    .dentist-dashboard .welcome h2 {
                        font-size: 21px;
                    }
                }

                @media (max-width: 500px) {
                    .dentist-dashboard .stats {
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                    }

                    .dentist-dashboard .stat-card {
                        padding: 14px;
                    }

                    .dentist-dashboard .stat-card h3 {
                        font-size: 23px;
                    }

                    .dentist-dashboard .quick-actions {
                        grid-template-columns: 1fr;
                    }

                    .dentist-dashboard .welcome-icon {
                        display: none;
                    }

                    .dentist-dashboard .appointment-row {
                        align-items: flex-start;
                        gap: 9px;
                    }

                    .dentist-dashboard .time {
                        width: 68px;
                        font-size: 11px;
                    }

                    .dentist-dashboard .status {
                        font-size: 9px;
                        padding: 5px;
                    }
                }
            `}</style>

            <div className="dentist-dashboard">
                <Sidebar role="dentist" active="dashboard" />

                <div className="dashboard-main">
                    <header className="topbar">
                        <div className="topbar-left">
                            <button
                                className="menu-btn"
                                type="button"
                                onClick={openSidebar}
                                aria-label="Open menu"
                            >
                                ☰
                            </button>

                            <div className="page-title">
                                <h1>Dentist Dashboard</h1>
                                <p>Manage your clinic and patient care.</p>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px"
                            }}
                        >
                            <button
                                type="button"
                                className="refresh-btn"
                                onClick={() => loadDashboard(true)}
                                title="Refresh dashboard"
                                disabled={refreshing}
                            >
                                {refreshing ? "⏳" : "↻"}
                            </button>

                            <button
                                type="button"
                                className="notification-btn"
                                onClick={showNotifications}
                                title="Notifications"
                            >
                                🔔
                            </button>

                            <div className="dentist-info">
                                👩‍⚕️ {dentistName}
                            </div>
                        </div>
                    </header>

                    <main className="dashboard-content">
                        <section className="welcome">
                            <div>
                                <h2>
                                    {greeting}, {dentistName}! 👋
                                </h2>

                                <p>
                                    Here is your clinic overview for today.
                                </p>

                                <p style={{ marginTop: "8px" }}>
                                    {displayDate}
                                </p>
                            </div>

                            <div className="welcome-icon">🦷</div>
                        </section>

                        {error && (
                            <div className="dashboard-message">
                                {error}
                            </div>
                        )}

                        <h3 className="section-title">
                            Today's Overview
                        </h3>

                        <section className="stats">
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <h3>
                                    {loading ? "..." : todaysAppointments.length}
                                </h3>
                                <p>Today's Appointments</p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">⏳</div>
                                <h3>
                                    {loading ? "..." : pendingAppointments.length}
                                </h3>
                                <p>Pending Requests</p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <h3>
                                    {loading ? "..." : patients.length}
                                </h3>
                                <p>Total Patients</p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">🦷</div>
                                <h3>
                                    {loading ? "..." : services.length}
                                </h3>
                                <p>Available Services</p>
                            </div>
                        </section>

                        <div className="dashboard-grid">
                            <section className="card">
                                <div className="card-header">
                                    <h3>📅 Today's Schedule</h3>

                                    <a
                                        href="/dentist/appointments"
                                        className="view-link"
                                    >
                                        View All
                                    </a>
                                </div>

                                {loading ? (
                                    <div className="empty-schedule">
                                        Loading appointments...
                                    </div>
                                ) : todaysAppointments.length === 0 ? (
                                    <div className="empty-schedule">
                                        No appointments scheduled for today.
                                    </div>
                                ) : (
                                    todaysAppointments.slice(0, 5).map(
                                        (appointment, index) => {
                                            const patientName =
                                                appointment.patient_name ||
                                                appointment.patientName ||
                                                "Patient";

                                            const status = String(
                                                appointment.status || "Pending"
                                            );

                                            return (
                                                <div
                                                    className="appointment-row"
                                                    key={
                                                        appointment.id ||
                                                        appointment.appointment_id ||
                                                        index
                                                    }
                                                >
                                                    <div className="time">
                                                        {formatTime(
                                                            appointment.appointment_time ||
                                                            appointment.time
                                                        )}
                                                    </div>

                                                    <div className="patient-avatar">
                                                        {getInitials(patientName)}
                                                    </div>

                                                    <div className="patient-info">
                                                        <strong>
                                                            {patientName}
                                                        </strong>

                                                        <span>
                                                            {appointment.service ||
                                                                "Dental Service"}
                                                        </span>
                                                    </div>

                                                    <span
                                                        className={`status ${getStatusClass(status)} ${status.toLowerCase()}`}
                                                    >
                                                        {status.toUpperCase()}
                                                    </span>
                                                </div>
                                            );
                                        }
                                    )
                                )}
                            </section>

                            <section className="card">
                                <div className="card-header">
                                    <h3>⚡ Quick Actions</h3>
                                </div>

                                <div className="quick-actions">
                                    <a
                                        href="/dentist/appointments"
                                        className="action-card"
                                    >
                                        <div className="action-icon">📅</div>
                                        <div>
                                            <strong>Appointments</strong>
                                            <span>Manage schedules</span>
                                        </div>
                                    </a>

                                    <a
                                        href="/dentist/patient-record"
                                        className="action-card"
                                    >
                                        <div className="action-icon">📋</div>
                                        <div>
                                            <strong>Patient Records</strong>
                                            <span>View patient history</span>
                                        </div>
                                    </a>

                                    <a
                                        href="/dentist/services"
                                        className="action-card"
                                    >
                                        <div className="action-icon">🦷</div>
                                        <div>
                                            <strong>Dental Services</strong>
                                            <span>Manage services</span>
                                        </div>
                                    </a>

                                    <a
                                        href="/dentist/profile"
                                        className="action-card"
                                    >
                                        <div className="action-icon">👤</div>
                                        <div>
                                            <strong>My Profile</strong>
                                            <span>Update account</span>
                                        </div>
                                    </a>
                                </div>
                            </section>
                        </div>

                        <section className="reminder">
                            <div className="reminder-icon">💡</div>

                            <div>
                                <h4>Appointment Overview</h4>

                                <p>
                                    You currently have {pendingAppointments.length}
                                    {" "}pending requests, {confirmedAppointments.length}
                                    {" "}confirmed appointments, and {completedAppointments.length}
                                    {" "}completed appointments.
                                    Review your appointment page to manage their status.
                                </p>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
