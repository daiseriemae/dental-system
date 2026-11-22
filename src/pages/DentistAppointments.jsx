
import { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar.jsx";


export default function DentistAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [dentistName, setDentistName] = useState(
        getRegisteredDentistName
    );


const BASE_URL = "https://dental-system-rzqb.onrender.com";
const API_URL = `${BASE_URL}/api/dentist_appoint`;


function getRegisteredDentistName() {
    const firstName = localStorage.getItem("userFirstName") || "";
    const lastName = localStorage.getItem("userLastName") || "";
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) return fullName;

    return (
        localStorage.getItem("dentistName") ||
        localStorage.getItem("userName") ||
        localStorage.getItem("userEmail") ||
        "Dentist"
    );
}

    // ==========================================
    // LOAD APPOINTMENTS FROM MYSQL
    // ==========================================

    const loadAppointments = useCallback(async () => {
        try {
            setLoading(true);

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(
                    `Server returned ${response.status}.`
                );
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Invalid appointment data received.");
            }

            const formattedAppointments = data.map((item) => ({
                id: String(item.id),

                patientId:
                    item.patient_id ??
                    item.patientId ??
                    "",

                patientName:
                    item.patient_name ??
                    item.patientName ??
                    item.patient ??
                    "Unknown Patient",

                service:
                    item.service ??
                    item.service_name ??
                    "",

                dentist:
                    item.dentist ??
                    item.dentist_name ??
                    "",

                date: String(
                    item.appointment_date ??
                    item.date ??
                    ""
                ).slice(0, 10),

                time:
                    item.appointment_time ??
                    item.time ??
                    "",

                notes: item.notes ?? "",

                status: item.status ?? "Pending"
            }));

            setAppointments(formattedAppointments);

        } catch (error) {
            console.error("Load appointments error:", error);
            setAppointments([]);

            alert(
                "Unable to load appointments. Check that XAMPP MySQL and your Express backend are running."
            );

        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAppointments();
        setDentistName(getRegisteredDentistName());
    }, [loadAppointments]);

    // ==========================================
    // UPDATE APPOINTMENT STATUS IN MYSQL
    // ==========================================

    async function updateStatus(id, status) {
        const appointment = appointments.find(
            item => String(item.id) === String(id)
        );

        if (!appointment) return;

        const messages = {
            Confirmed: `Confirm appointment for ${appointment.patientName}?`,
            Completed: `Mark ${appointment.patientName}'s appointment as completed?`,
            Cancelled: `Cancel the appointment for ${appointment.patientName}?`
        };

        if (!window.confirm(messages[status] || "Update appointment status?")) {
            return;
        }

        try {
            setUpdatingId(String(id));

            const response = await fetch(
                `${API_URL}/${encodeURIComponent(id)}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ status })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to update appointment status."
                );
            }

            await loadAppointments();

            alert(
                status === "Confirmed"
                    ? `Appointment for ${appointment.patientName} has been confirmed.`
                    : status === "Completed"
                    ? "Appointment marked as completed."
                    : "Appointment has been cancelled."
            );

        } catch (error) {
            console.error("Update appointment status error:", error);
            alert(error.message || "Unable to update appointment status.");

        } finally {
            setUpdatingId(null);
        }
    }

    // ==========================================
    // VIEW APPOINTMENT DETAILS
    // ==========================================

    function viewAppointment(appointment) {
        alert(
            `Patient: ${appointment.patientName}\n\n` +
            `Patient ID: ${appointment.patientId || "Not available"}\n` +
            `Service: ${appointment.service || "—"}\n` +
            `Dentist: ${appointment.dentist || dentistName}\n` +
            `Date: ${formatDate(appointment.date)}\n` +
            `Time: ${formatTime(appointment.time)}\n` +
            `Status: ${appointment.status}\n\n` +
            `Notes: ${appointment.notes || "No notes"}`
        );
    }

    // ==========================================
    // RESET FILTERS
    // ==========================================

    function resetFilters() {
        setSearch("");
        setStatusFilter("all");
        setDateFilter("");
    }

    // ==========================================
    // FILTER APPOINTMENTS
    // ==========================================

    const filteredAppointments = appointments.filter(appointment => {
        const patientName = String(
            appointment.patientName || ""
        ).toLowerCase();

        const patientId = String(
            appointment.patientId || ""
        ).toLowerCase();

        const searchText = search.toLowerCase().trim();

        const matchesSearch =
            patientName.includes(searchText) ||
            patientId.includes(searchText);

        const matchesStatus =
            statusFilter === "all" ||
            String(appointment.status || "").toLowerCase() ===
                statusFilter.toLowerCase();

        const matchesDate =
            dateFilter === "" ||
            appointment.date === dateFilter;

        return matchesSearch && matchesStatus && matchesDate;
    });

    // ==========================================
    // SUMMARY COUNTS
    // ==========================================

    const pendingCount = appointments.filter(
        appointment =>
            String(appointment.status).toLowerCase() === "pending"
    ).length;

    const confirmedCount = appointments.filter(
        appointment =>
            String(appointment.status).toLowerCase() === "confirmed"
    ).length;

    const completedCount = appointments.filter(
        appointment =>
            String(appointment.status).toLowerCase() === "completed"
    ).length;

    const now = new Date();

    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    const todayCount = appointments.filter(
        appointment => appointment.date === today
    ).length;

    // ==========================================
    // FORMAT PATIENT INITIALS
    // ==========================================

    function getInitials(name) {
        if (!name) return "PT";

        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase();
    }

    // ==========================================
    // FORMAT DATE
    // ==========================================

    function formatDate(date) {
        if (!date) return "—";

        const dateObject = new Date(
            `${String(date).slice(0, 10)}T00:00:00`
        );

        if (Number.isNaN(dateObject.getTime())) {
            return String(date);
        }

        return dateObject.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    // ==========================================
    // FORMAT TIME
    // ==========================================

    function formatTime(time) {
        if (!time) return "—";

        const value = String(time).trim();

        const match = value.match(
            /^(\d{1,2}):(\d{2})(?::\d{2})?$/
        );

        if (match) {
            const hours = Number(match[1]);
            const minutes = match[2];

            if (hours >= 0 && hours <= 23) {
                const period = hours >= 12 ? "PM" : "AM";
                const displayHour = hours % 12 || 12;

                return `${displayHour}:${minutes} ${period}`;
            }
        }

        return value;
    }

    return (
        <>
            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: Arial, sans-serif;
                }

                body {
                    background: #f7f3fc;
                    color: #333;
                }

                .main {
                    margin-left: 250px;
                    padding: 30px;
                }

                .topbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }

                .topbar h1 {
                    color: #5f4778;
                    font-size: 27px;
                }

                .topbar p {
                    color: #777;
                    margin-top: 5px;
                    font-size: 14px;
                }

                .dentist-info {
                    background: white;
                    padding: 10px 16px;
                    border-radius: 12px;
                    box-shadow: 0 3px 12px rgba(0,0,0,0.05);
                    color: #5f4778;
                    font-weight: bold;
                }

                .summary {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 18px;
                    margin-bottom: 25px;
                }

                .summary-card {
                    background: white;
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.06);
                }

                .summary-card h3 {
                    font-size: 28px;
                    color: #80609e;
                    margin-bottom: 5px;
                }

                .summary-card p {
                    color: #777;
                    font-size: 13px;
                }

                .filter-box {
                    background: white;
                    padding: 20px;
                    border-radius: 15px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    margin-bottom: 20px;
                }

                .filter-box h2 {
                    color: #5f4778;
                    font-size: 18px;
                    margin-bottom: 15px;
                }

                .filters {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr auto;
                    gap: 12px;
                }

                input, select {
                    width: 100%;
                    padding: 11px 13px;
                    border: 1px solid #ddd;
                    border-radius: 9px;
                    outline: none;
                    font-size: 14px;
                    background: white;
                }

                input:focus, select:focus {
                    border-color: #9b7bb8;
                }

                .btn {
                    border: none;
                    border-radius: 9px;
                    padding: 11px 18px;
                    cursor: pointer;
                    font-weight: bold;
                }

                .btn-reset {
                    background: #eee7f5;
                    color: #604879;
                }

                .appointment-container {
                    background: white;
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }

                .appointment-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 18px;
                }

                .appointment-header h2 {
                    color: #5f4778;
                    font-size: 20px;
                }

                .appointment-count {
                    background: #eee7f5;
                    color: #604879;
                    padding: 6px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                }

                .appointment-card {
                    border: 1px solid #eee;
                    border-radius: 13px;
                    padding: 18px;
                    margin-bottom: 12px;
                    transition: 0.2s;
                }

                .appointment-card:hover {
                    box-shadow: 0 3px 12px rgba(128,96,158,0.10);
                }

                .appointment-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .patient-info {
                    display: flex;
                    gap: 13px;
                    align-items: center;
                }

                .patient-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: #eee7f5;
                    color: #80609e;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 17px;
                    flex-shrink: 0;
                }

                .patient-info h3 {
                    color: #4e3b60;
                    font-size: 16px;
                }

                .patient-info p {
                    color: #888;
                    font-size: 12px;
                    margin-top: 3px;
                    overflow-wrap: anywhere;
                }

                .status {
                    padding: 6px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: bold;
                }

                .status.pending {
                    background: #fff3cd;
                    color: #856404;
                }

                .status.confirmed {
                    background: #dff3e4;
                    color: #2e7d45;
                }

                .status.completed {
                    background: #e1e8f5;
                    color: #3c5685;
                }

                .status.cancelled {
                    background: #f8d7da;
                    color: #842029;
                }

                .appointment-details {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin-top: 18px;
                    padding-top: 15px;
                    border-top: 1px solid #eee;
                }

                .detail-item span {
                    display: block;
                    font-size: 11px;
                    color: #999;
                    margin-bottom: 4px;
                }

                .detail-item strong {
                    font-size: 13px;
                    color: #555;
                    overflow-wrap: anywhere;
                }

                .appointment-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 15px;
                    flex-wrap: wrap;
                }

                .action-btn {
                    border: none;
                    padding: 8px 13px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                }

                .action-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .confirm-btn {
                    background: #e0f2e5;
                    color: #2e7d45;
                }

                .complete-btn {
                    background: #e3e9f6;
                    color: #405986;
                }

                .cancel-btn {
                    background: #f9e0e2;
                    color: #a03a43;
                }

                .view-btn {
                    background: #eee7f5;
                    color: #604879;
                }

                .action-btn:hover:not(:disabled) {
                    opacity: 0.8;
                }

                .no-results {
                    text-align: center;
                    padding: 35px 10px;
                    color: #888;
                }

                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #80609e;
                }

                .menu-btn {
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

                @media (max-width: 1000px) {
                    .summary {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .filters {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .sidebar {
                        left: -270px;
                    }

                    .sidebar.show {
                        left: 0;
                    }

                    .main {
                        margin-left: 0;
                        padding: 20px;
                    }

                    .menu-btn {
                        display: block;
                    }

                    .topbar {
                        gap: 15px;
                    }

                    .topbar h1 {
                        font-size: 22px;
                    }

                    .dentist-info {
                        display: none;
                    }

                    .appointment-details {
                        grid-template-columns: 1fr;
                        gap: 10px;
                    }
                }

                @media (max-width: 550px) {
                    .summary {
                        grid-template-columns: 1fr;
                    }

                    .filters {
                        grid-template-columns: 1fr;
                    }

                    .appointment-top {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .appointment-actions {
                        flex-wrap: wrap;
                    }

                    .action-btn {
                        flex: 1;
                    }
                }
            `}</style>

            <Sidebar role="dentist" active="appointments" />

            <main className="main">
                <div className="topbar">
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px"
                    }}>
                        <button
                            className="menu-btn"
                            onClick={() => {
                                document
                                    .querySelector(".sidebar")
                                    ?.classList.toggle("show");
                            }}
                        >
                            ☰
                        </button>

                        <div>
                            <h1>Appointments</h1>
                            <p>
                                Manage your patient's dental appointments.
                            </p>
                        </div>
                    </div>

                    <div className="dentist-info">
                        👩‍⚕️ {dentistName}
                    </div>
                </div>

                <section className="summary">
                    <div className="summary-card">
                        <h3>{todayCount}</h3>
                        <p>Today's Appointments</p>
                    </div>

                    <div className="summary-card">
                        <h3>{pendingCount}</h3>
                        <p>Pending Requests</p>
                    </div>

                    <div className="summary-card">
                        <h3>{confirmedCount}</h3>
                        <p>Confirmed</p>
                    </div>

                    <div className="summary-card">
                        <h3>{completedCount}</h3>
                        <p>Completed</p>
                    </div>
                </section>

                <section className="filter-box">
                    <h2>Find Appointment</h2>

                    <div className="filters">
                        <input
                            type="text"
                            placeholder="Search patient name or ID..."
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                        />

                        <select
                            value={statusFilter}
                            onChange={event => setStatusFilter(event.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <input
                            type="date"
                            value={dateFilter}
                            onChange={event => setDateFilter(event.target.value)}
                        />

                        <button
                            className="btn btn-reset"
                            onClick={resetFilters}
                        >
                            Reset
                        </button>
                    </div>
                </section>

                <section className="appointment-container">
                    <div className="appointment-header">
                        <h2>Appointment List</h2>

                        <span className="appointment-count">
                            {filteredAppointments.length}{" "}
                            {filteredAppointments.length === 1
                                ? "appointment"
                                : "appointments"}
                        </span>
                    </div>

                    {loading ? (
                        <div className="loading">
                            Loading appointments...
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="no-results">
                            <div style={{ fontSize: "35px" }}>🔍</div>
                            <p>No appointments found.</p>
                            <small>
                                Try changing your search or filters.
                            </small>
                        </div>
                    ) : (
                        filteredAppointments.map(appointment => {
                            const patientName =
                                appointment.patientName || "Unknown Patient";

                            const status =
                                appointment.status || "Pending";

                            const statusClass = status.toLowerCase();

                            const isUpdating =
                                updatingId === String(appointment.id);

                            return (
                                <div
                                    className="appointment-card"
                                    key={appointment.id}
                                >
                                    <div className="appointment-top">
                                        <div className="patient-info">
                                            <div className="patient-avatar">
                                                {getInitials(patientName)}
                                            </div>

                                            <div>
                                                <h3>{patientName}</h3>
                                                <p>
                                                    Patient ID:{" "}
                                                    {appointment.patientId || "Not available"}
                                                </p>
                                            </div>
                                        </div>

                                        <span className={`status ${statusClass}`}>
                                            {status}
                                        </span>
                                    </div>

                                    <div className="appointment-details">
                                        <div className="detail-item">
                                            <span>DATE</span>
                                            <strong>
                                                {formatDate(appointment.date)}
                                            </strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>TIME</span>
                                            <strong>
                                                {formatTime(appointment.time)}
                                            </strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>SERVICE</span>
                                            <strong>
                                                {appointment.service || "—"}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="appointment-actions">
                                        <button
                                            className="action-btn view-btn"
                                            onClick={() => viewAppointment(appointment)}
                                        >
                                            View
                                        </button>

                                        {statusClass === "pending" && (
                                            <>
                                                <button
                                                    className="action-btn confirm-btn"
                                                    disabled={isUpdating}
                                                    onClick={() =>
                                                        updateStatus(
                                                            appointment.id,
                                                            "Confirmed"
                                                        )
                                                    }
                                                >
                                                    {isUpdating ? "Updating..." : "Confirm"}
                                                </button>

                                                <button
                                                    className="action-btn cancel-btn"
                                                    disabled={isUpdating}
                                                    onClick={() =>
                                                        updateStatus(
                                                            appointment.id,
                                                            "Cancelled"
                                                        )
                                                    }
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}

                                        {statusClass === "confirmed" && (
                                            <>
                                                <button
                                                    className="action-btn complete-btn"
                                                    disabled={isUpdating}
                                                    onClick={() =>
                                                        updateStatus(
                                                            appointment.id,
                                                            "Completed"
                                                        )
                                                    }
                                                >
                                                    {isUpdating ? "Updating..." : "Mark Completed"}
                                                </button>

                                                <button
                                                    className="action-btn cancel-btn"
                                                    disabled={isUpdating}
                                                    onClick={() =>
                                                        updateStatus(
                                                            appointment.id,
                                                            "Cancelled"
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </section>
            </main>
        </>
    );
}
