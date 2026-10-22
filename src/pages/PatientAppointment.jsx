import { useState, useEffect } from "react";
import Sidebar from "./Sidebar.jsx";

export default function PatientAppointment() {
    const [appointments, setAppointments] = useState([]);
    const [patientId] = useState("P-00125");
    const [service, setService] = useState("");
    const [dentist, setDentist] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [notes, setNotes] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [cancellingId, setCancellingId] = useState(null);

    const API_URL = `${import.meta.env.VITE_API_URL}/api/appointments`;

    useEffect(() => {
        loadAppointments();
    }, []);

    async function loadAppointments() {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to load appointments");
            }

            const data = await response.json();
            setAppointments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            showMessage(
                "Unable to load appointments. Please check your server.",
                "error"
            );
        }
    }

    function showMessage(text, type = "success") {
        setMessage(text);
        setMessageType(type);
    }

    async function formSubmit(e) {
        e.preventDefault();
        showMessage("");

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    patientId,
                    patientName: "Daiserie Mae",
                    service,
                    dentist,
                    date,
                    time,
                    notes
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage(
                    data.message || "Failed to submit appointment.",
                    "error"
                );
                return;
            }

            const newAppointment = data.appointment || data;

            setAppointments((currentAppointments) => [
                ...currentAppointments,
                newAppointment
            ]);

            showMessage("Appointment request submitted successfully!");

            setService("");
            setDentist("");
            setDate("");
            setTime("");
            setNotes("");
        } catch (err) {
            console.error(err);
            showMessage(
                "Something went wrong. Please check your backend server.",
                "error"
            );
        }
    }

    async function cancelAppointment(appointment) {
        const appointmentId = appointment.id ?? appointment._id;
        const currentStatus = appointment.status || "Pending";

        if (!appointmentId) {
            showMessage("Unable to cancel: appointment ID not found.", "error");
            return;
        }

        if (
            currentStatus === "Cancelled" ||
            currentStatus === "Completed"
        ) {
            showMessage(
                "This appointment can no longer be cancelled.",
                "error"
            );
            return;
        }

        if (
            !window.confirm(
                "Are you sure you want to cancel this appointment?"
            )
        ) {
            return;
        }

        setCancellingId(String(appointmentId));
        showMessage("");

        try {
            const response = await fetch(
                `${API_URL}/${encodeURIComponent(appointmentId)}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: "Cancelled"
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                showMessage(
                    data.message || "Failed to cancel appointment.",
                    "error"
                );
                return;
            }

            const updatedAppointment = data.appointment;

            setAppointments((currentAppointments) =>
                currentAppointments.map((item) =>
                    String(item.id ?? item._id) === String(appointmentId)
                        ? {
                              ...item,
                              ...(updatedAppointment || {}),
                              status: "Cancelled"
                          }
                        : item
                )
            );

            showMessage("Appointment cancelled successfully!");
        } catch (err) {
            console.error(err);
            showMessage(
                "Unable to cancel appointment. Please check your backend server.",
                "error"
            );
        } finally {
            setCancellingId(null);
        }
    }

    const myAppointments = appointments.filter(
        (appointment) => appointment.patientId === patientId
    );

    return (
        <>
            <style>{`
                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    background: #f7f4fb;
                    color: #4f3d63;
                    margin: 0;
                }

                .appointment-main {
                    margin-left: 250px;
                    min-height: 100vh;
                    color: #4f3d63;
                }

                .appointment-topbar {
                    height: 75px;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    padding: 0 35px;
                    border-bottom: 1px solid #e6dff0;
                }

                .appointment-topbar h1 {
                    color: #4f3d63;
                    font-size: 24px;
                    margin: 0;
                }

                .appointment-content {
                    padding: 30px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .appointment-intro {
                    margin-bottom: 25px;
                }

                .appointment-intro h2 {
                    color: #4f3d63;
                    font-size: 28px;
                    margin: 0 0 7px;
                }

                .appointment-intro p {
                    color: #6b5b7d;
                }

                .appointment-form-card,
                .appointment-table-card {
                    background: #fff;
                    padding: 30px;
                    border-radius: 18px;
                    box-shadow: 0 5px 20px rgba(79, 61, 99, .08);
                    margin-bottom: 30px;
                }

                .appointment-form-group {
                    margin-bottom: 20px;
                }

                .appointment-form-group label {
                    display: block;
                    color: #4f3d63;
                    margin-bottom: 8px;
                    font-weight: bold;
                }

                .appointment-form-group input,
                .appointment-form-group select,
                .appointment-form-group textarea {
                    display: block;
                    width: 100%;
                    padding: 13px 14px;
                    border: 1px solid #d8ccec;
                    border-radius: 10px;
                    font-size: 15px;
                    color: #352344;
                    background: #fff;
                    outline: none;
                }

                .appointment-form-group input:focus,
                .appointment-form-group select:focus,
                .appointment-form-group textarea:focus {
                    border-color: #9b7bb8;
                    box-shadow: 0 0 0 3px #eee7f5;
                }

                .appointment-form-group input[readonly] {
                    background: #f8f5fc;
                    color: #4f3d63;
                }

                .appointment-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .appointment-form-group textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .appointment-submit-btn {
                    width: 100%;
                    border: none;
                    background: #9b7bb8;
                    color: #fff;
                    padding: 14px 22px;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: bold;
                    cursor: pointer;
                }

                .appointment-submit-btn:hover {
                    background: #80609e;
                }

                .appointment-message {
                    margin-bottom: 20px;
                    padding: 15px;
                    border-radius: 10px;
                    font-weight: 500;
                    overflow-wrap: anywhere;
                }

                .appointment-message.success {
                    background: #e7f6ec;
                    color: #205c35;
                }

                .appointment-message.error {
                    background: #fde8e8;
                    color: #a61b1b;
                }

                .appointment-info-box {
                    margin-top: 20px;
                    background: #f3efff;
                    border-left: 5px solid #9b7bb8;
                    padding: 15px;
                    border-radius: 8px;
                    font-size: 14px;
                    line-height: 1.7;
                    color: #4f3d63;
                }

                .appointment-table-card {
                    overflow-x: auto;
                }

                .appointment-table-card h2 {
                    color: #4f3d63;
                    margin: 0 0 20px;
                    font-size: 22px;
                }

                .appointment-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #fff;
                    color: #4f3d63;
                }

                .appointment-table th,
                .appointment-table td {
                    padding: 13px;
                    text-align: left;
                    border-bottom: 1px solid #e4dced;
                    color: #4f3d63 !important;
                    font-size: 14px;
                    background: #fff;
                    vertical-align: middle;
                }

                .appointment-table th {
                    background: #f0e8fc !important;
                    color: #39254f !important;
                    font-weight: bold;
                    white-space: nowrap;
                }

                .appointment-table tbody tr:hover td {
                    background: #faf7ff;
                }

                .appointment-status {
                    display: inline-block;
                    background: #fff0c2;
                    color: #654d00 !important;
                    padding: 6px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    white-space: nowrap;
                }

                .appointment-status.status-cancelled {
                    background: #fde2e2;
                    color: #a61b1b !important;
                }

                .appointment-status.status-completed {
                    background: #d9f4e2;
                    color: #176638 !important;
                }

                .appointment-cancel-btn {
                    background: #dc3545;
                    color: #fff;
                    border: none;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: bold;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .appointment-cancel-btn:hover {
                    background: #b02a37;
                }

                .appointment-cancel-btn:disabled {
                    opacity: .6;
                    cursor: not-allowed;
                }

                .appointment-empty {
                    text-align: center !important;
                    padding: 25px !important;
                    color: #6b5b7d !important;
                }

                .appointment-mobile-header {
                    display: none;
                }

                @media (max-width: 768px) {
                    .appointment-main {
                        margin-left: 0;
                    }

                    .appointment-mobile-header {
                        display: flex;
                        height: 65px;
                        background: #9b7bb8;
                        color: #fff;
                        align-items: center;
                        padding: 0 18px;
                        gap: 15px;
                    }

                    .appointment-menu-btn {
                        border: none;
                        background: transparent;
                        color: #fff;
                        font-size: 25px;
                        cursor: pointer;
                    }

                    .appointment-topbar {
                        display: none;
                    }

                    .appointment-content {
                        padding: 20px 14px;
                    }

                    .appointment-row {
                        grid-template-columns: 1fr;
                        gap: 0;
                    }

                    .appointment-form-card,
                    .appointment-table-card {
                        padding: 20px;
                    }

                    .appointment-table {
                        min-width: 900px;
                    }
                }
            `}</style>

            <Sidebar role="patient" active="appointments" />

            <div className="appointment-main">
                <div className="appointment-mobile-header">
                    <button
                        className="appointment-menu-btn"
                        type="button"
                        aria-label="Toggle navigation"
                        onClick={() => {
                            const sidebar = document.querySelector(".sidebar");

                            if (sidebar) {
                                sidebar.classList.toggle("open");
                                sidebar.classList.toggle("show");
                            }
                        }}
                    >
                        ☰
                    </button>

                    <strong>DentalCare</strong>
                </div>

                <header className="appointment-topbar">
                    <h1>Book an Appointment</h1>
                </header>

                <main className="appointment-content">
                    <div className="appointment-intro">
                        <h2>Book Your Appointment</h2>
                        <p>
                            Choose your preferred dental service, dentist,
                            date, and time.
                        </p>
                    </div>

                    {message && (
                        <div
                            className={`appointment-message ${messageType}`}
                            role="status"
                        >
                            {message}
                        </div>
                    )}

                    <section className="appointment-form-card">
                        <form onSubmit={formSubmit}>
                            <div className="appointment-form-group">
                                <label htmlFor="patientId">Patient ID</label>
                                <input
                                    type="text"
                                    id="patientId"
                                    value={patientId}
                                    readOnly
                                />
                            </div>

                            <div className="appointment-form-group">
                                <label htmlFor="service">Dental Service</label>
                                <select
                                    id="service"
                                    value={service}
                                    onChange={(e) => setService(e.target.value)}
                                    required
                                >
                                    <option value="">Select a service</option>
                                    <option value="Dental Check-up">Dental Check-up</option>
                                    <option value="Teeth Cleaning">Teeth Cleaning</option>
                                    <option value="Tooth Extraction">Tooth Extraction</option>
                                    <option value="Dental Filling">Dental Filling</option>
                                    <option value="Dental Consultation">Dental Consultation</option>
                                    <option value="Orthodontic Consultation">Orthodontic Consultation</option>
                                </select>
                            </div>

                            <div className="appointment-form-group">
                                <label htmlFor="dentist">Preferred Dentist</label>
                                <select
                                    id="dentist"
                                    value={dentist}
                                    onChange={(e) => setDentist(e.target.value)}
                                    required
                                >
                                    <option value="">Select a dentist</option>
                                    <option value="Dr. Jhulance Fernandez">Dr. Jhulance Fernandez</option>
                                    <option value="Dr. John Cruz">Dr. John Cruz</option>
                                    <option value="Dr. Angela Reyes">Dr. Angela Reyes</option>
                                </select>
                            </div>

                            <div className="appointment-row">
                                <div className="appointment-form-group">
                                    <label htmlFor="date">Preferred Date</label>
                                    <input
                                        type="date"
                                        id="date"
                                        value={date}
                                        min={new Date().toLocaleDateString("en-CA")}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="appointment-form-group">
                                    <label htmlFor="time">Preferred Time</label>
                                    <select
                                        id="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        required
                                    >
                                        <option value="">Select time</option>
                                        <option value="9:00 AM">9:00 AM</option>
                                        <option value="10:00 AM">10:00 AM</option>
                                        <option value="11:00 AM">11:00 AM</option>
                                        <option value="1:00 PM">1:00 PM</option>
                                        <option value="2:00 PM">2:00 PM</option>
                                        <option value="3:00 PM">3:00 PM</option>
                                        <option value="4:00 PM">4:00 PM</option>
                                    </select>
                                </div>
                            </div>

                            <div className="appointment-form-group">
                                <label htmlFor="notes">Additional Notes</label>
                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Tell us if you have any concerns or additional information..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="appointment-submit-btn"
                            >
                                📅 Request Appointment
                            </button>
                        </form>

                        <div className="appointment-info-box">
                            <strong>Appointment Reminder</strong>
                            <br />
                            Please arrive at least 10 minutes before your
                            scheduled appointment.
                            <br />
                            Bring your patient ID when visiting the clinic.
                        </div>
                    </section>

                    <section className="appointment-table-card">
                        <h2>My Appointments</h2>

                        <table className="appointment-table">
                            <thead>
                                <tr>
                                    <th>Patient ID</th>
                                    <th>Service</th>
                                    <th>Dentist</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Notes</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {myAppointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="appointment-empty">
                                            No appointments found.
                                        </td>
                                    </tr>
                                ) : (
                                    myAppointments.map((appointment, index) => {
                                        const appointmentId =
                                            appointment.id ?? appointment._id;

                                        const status =
                                            appointment.status || "Pending";

                                        return (
                                            <tr key={appointmentId ?? index}>
                                                <td>{appointment.patientId || "—"}</td>
                                                <td>{appointment.service || "—"}</td>
                                                <td>{appointment.dentist || "—"}</td>
                                                <td>{appointment.date || "—"}</td>
                                                <td>{appointment.time || "—"}</td>
                                                <td>{appointment.notes || "—"}</td>
                                                <td>
                                                    <span
                                                        className={`appointment-status ${
                                                            status === "Cancelled"
                                                                ? "status-cancelled"
                                                                : status === "Completed"
                                                                ? "status-completed"
                                                                : ""
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {status !== "Cancelled" &&
                                                    status !== "Completed" ? (
                                                        <button
                                                            type="button"
                                                            className="appointment-cancel-btn"
                                                            disabled={
                                                                cancellingId ===
                                                                String(appointmentId)
                                                            }
                                                            onClick={() =>
                                                                cancelAppointment(
                                                                    appointment
                                                                )
                                                            }
                                                        >
                                                            {cancellingId ===
                                                            String(appointmentId)
                                                                ? "Cancelling..."
                                                                : "Cancel"}
                                                        </button>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </>
    );
}
