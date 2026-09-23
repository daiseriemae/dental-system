import { useState, useEffect } from "react";
import Sidebar from "./Sidebar.jsx";

export default function PatientAppointment() {

    const [appointments, setAppointments] = useState([]);

    const [patientId, setPatientId] = useState("P-00125");
    const [service, setService] = useState("");
    const [dentist, setDentist] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [notes, setNotes] = useState("");

    const [message, setMessage] = useState("");

    const api_url = "http://localhost:8080/api/appointment";

    useEffect(() => {

        fetch(api_url)
            .then((response) => response.json())
            .then((data) => {
                setAppointments(data);
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });

    }, []);

    async function formSubmit(e) {
    e.preventDefault();

    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                patientId: patientId,
                patientName: "Daiserie Mae",
                service: service,
                dentist: dentist,
                date: date,
                time: time,
                notes: notes
            })
        });

        const data = await response.json();

        if (!response.ok) {
            setMessage(` ${data.message}`);
            return;
        }

        setAppointments((currentAppointments) => [
            ...currentAppointments,
            data
        ]);

        setMessage(" Appointment request submitted successfully!");

        setService("");
        setDentist("");
        setDate("");
        setTime("");
        setNotes("");

        console.log("New appointment:", data);

    } catch (err) {
        console.log(err);
        setMessage(" Something went wrong. Please try again.");
    }
}

    return (

        <>
            <style>{`

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                body {
                    font-family: Arial, sans-serif;
                    background: #f7f4fb;
                    color: #4f3d63;
                }

                .sidebar {
                    position: fixed;
                    left: 0;
                    top: 0;
                    width: 250px;
                    height: 100vh;
                    background: #9b7bb8;
                    color: white;
                    padding: 25px 18px;
                    z-index: 1000;
                }

                .logo {
                    text-align: center;
                    margin-bottom: 35px;
                }

                .logo-circle {
                    width: 60px;
                    height: 60px;
                    margin: auto;
                    background: white;
                    color: #9b7bb8;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    font-weight: bold;
                }

                .logo h2 {
                    margin-top: 10px;
                    font-size: 21px;
                }

                .logo p {
                    font-size: 12px;
                    opacity: .85;
                }

                .nav {
                    list-style: none;
                }

                .nav li {
                    margin-bottom: 8px;
                }

                .nav a {
                    display: block;
                    color: white;
                    text-decoration: none;
                    padding: 13px 15px;
                    border-radius: 10px;
                    transition: .2s;
                }

                .nav a:hover,
                .nav a.active {
                    background: rgba(255,255,255,.2);
                }

                .logout {
                    position: absolute;
                    bottom: 25px;
                    left: 18px;
                    right: 18px;
                    border: none;
                    background: rgba(255,255,255,.15);
                    color: white;
                    padding: 13px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 15px;
                }

                .main {
                    margin-left: 250px;
                    min-height: 100vh;
                }

                .topbar {
                    height: 75px;
                    background: white;
                    display: flex;
                    align-items: center;
                    padding: 0 35px;
                    border-bottom: 1px solid #e6dff0;
                }

                .topbar h1 {
                    font-size: 24px;
                }

                .content {
                    padding: 30px;
                    max-width: 1100px;
                }

                .page-intro {
                    margin-bottom: 25px;
                }

                .page-intro h2 {
                    font-size: 28px;
                    margin-bottom: 7px;
                }

                .page-intro p {
                    color: #7d7188;
                }

                .form-card {
                    background: white;
                    padding: 30px;
                    border-radius: 18px;
                    box-shadow: 0 5px 20px rgba(79,61,99,.08);
                    margin-bottom: 30px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: bold;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 13px 14px;
                    border: 1px solid #ddd3e7;
                    border-radius: 10px;
                    font-size: 15px;
                    outline: none;
                    background: #fff;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    border-color: #9b7bb8;
                    box-shadow: 0 0 0 3px #eee7f5;
                }

                .row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .btn {
                    border: none;
                    background: #9b7bb8;
                    color: white;
                    padding: 14px 22px;
                    border-radius: 10px;
                    font-size: 15px;
                    cursor: pointer;
                    width: 100%;
                    font-weight: bold;
                }

                .btn:hover {
                    background: #80609e;
                }

                .message {
                    margin-bottom: 20px;
                    background: #e7f6ec;
                    color: #277443;
                    padding: 15px;
                    border-radius: 10px;
                }

                .info-box {
                    margin-top: 20px;
                    background: #f3efff;
                    border-left: 5px solid #9b7bb8;
                    padding: 15px;
                    border-radius: 8px;
                    font-size: 14px;
                }

                .appointment-card {
                    background: white;
                    padding: 30px;
                    border-radius: 18px;
                    box-shadow: 0 5px 20px rgba(79,61,99,.08);
                    overflow-x: auto;
                }

                .appointment-card h2 {
                    margin-bottom: 20px;
                    font-size: 22px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th,
                td {
                    padding: 13px;
                    text-align: left;
                    border-bottom: 1px solid #eee7f5;
                }

                th {
                    background: #f3efff;
                    color: #4f3d63;
                }

                tr:hover {
                    background: #faf8fd;
                }

                .status {
                    background: #fff3cd;
                    color: #725b00;
                    padding: 5px 10px;
                    border-radius: 20px;
                    font-size: 13px;
                }

                .mobile-header {
                    display: none;
                }

                @media (max-width: 768px) {

                    .sidebar {
                        width: 220px;
                        transform: translateX(-100%);
                        transition: .3s;
                    }

                    .sidebar.open {
                        transform: translateX(0);
                    }

                    .main {
                        margin-left: 0;
                    }

                    .mobile-header {
                        display: flex;
                        height: 65px;
                        background: #9b7bb8;
                        color: white;
                        align-items: center;
                        padding: 0 18px;
                        gap: 15px;
                    }

                    .menu-btn {
                        border: none;
                        background: transparent;
                        color: white;
                        font-size: 25px;
                        cursor: pointer;
                    }

                    .topbar {
                        display: none;
                    }

                    .content {
                        padding: 20px;
                    }

                    .row {
                        grid-template-columns: 1fr;
                        gap: 0;
                    }

                    .form-card,
                    .appointment-card {
                        padding: 20px;
                    }

                    table {
                        min-width: 800px;
                    }

                }

            `}</style>

            <Sidebar
                role="patient"
                active="appointments"
            />

            <div className="main">

                <div className="mobile-header">

                    <button
                        className="menu-btn"
                        onClick={() => {
                            const sidebar =
                                document.querySelector(".sidebar");

                            sidebar.classList.toggle("open");
                        }}
                    >
                        ☰
                    </button>

                    <strong>DentalCare</strong>

                </div>

                <div className="topbar">

                    <h1>Book an Appointment</h1>

                </div>

                <div className="content">

                    <div className="page-intro">

                        <h2>Book Your Appointment</h2>

                        <p>
                            Choose your preferred dental service,
                            dentist, date, and time.
                        </p>

                    </div>

                    {message && (

                        <div className="message">

                            {message}

                        </div>

                    )}

                    <div className="form-card">

                        <form onSubmit={formSubmit}>

                            <div className="form-group">

                                <label htmlFor="patientId">
                                    Patient ID
                                </label>

                                <input
                                    type="text"
                                    id="patientId"
                                    value={patientId}
                                    readOnly
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="service">
                                    Dental Service
                                </label>

                                <select
                                    id="service"
                                    value={service}
                                    onChange={(event) =>
                                        setService(event.target.value)
                                    }
                                    required
                                >

                                    <option value="">
                                        Select a service
                                    </option>

                                    <option value="Dental Check-up">
                                        Dental Check-up
                                    </option>

                                    <option value="Teeth Cleaning">
                                        Teeth Cleaning
                                    </option>

                                    <option value="Tooth Extraction">
                                        Tooth Extraction
                                    </option>

                                    <option value="Dental Filling">
                                        Dental Filling
                                    </option>

                                    <option value="Dental Consultation">
                                        Dental Consultation
                                    </option>

                                    <option value="Orthodontic Consultation">
                                        Orthodontic Consultation
                                    </option>

                                </select>

                            </div>

                            <div className="form-group">

                                <label htmlFor="dentist">
                                    Preferred Dentist
                                </label>

                                <select
                                    id="dentist"
                                    value={dentist}
                                    onChange={(event) =>
                                        setDentist(event.target.value)
                                    }
                                    required
                                >

                                    <option value="">
                                        Select a dentist
                                    </option>

                                    <option value="Dr. Jhulance Fernandez">
                                        Dr. Jhulance Fernandez
                                    </option>

                                    <option value="Dr. John Cruz">
                                        Dr. John Cruz
                                    </option>

                                    <option value="Dr. Angela Reyes">
                                        Dr. Angela Reyes
                                    </option>

                                </select>

                            </div>

                            <div className="row">

                                <div className="form-group">

                                    <label htmlFor="date">
                                        Preferred Date
                                    </label>

                                    <input
                                        type="date"
                                        id="date"
                                        value={date}
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        onChange={(event) =>
                                            setDate(event.target.value)
                                        }
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label htmlFor="time">
                                        Preferred Time
                                    </label>

                                    <select
                                        id="time"
                                        value={time}
                                        onChange={(event) =>
                                            setTime(event.target.value)
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select time
                                        </option>

                                        <option value="9:00 AM">
                                            9:00 AM
                                        </option>

                                        <option value="10:00 AM">
                                            10:00 AM
                                        </option>

                                        <option value="11:00 AM">
                                            11:00 AM
                                        </option>

                                        <option value="1:00 PM">
                                            1:00 PM
                                        </option>

                                        <option value="2:00 PM">
                                            2:00 PM
                                        </option>

                                        <option value="3:00 PM">
                                            3:00 PM
                                        </option>

                                        <option value="4:00 PM">
                                            4:00 PM
                                        </option>

                                    </select>

                                </div>

                            </div>

                            <div className="form-group">

                                <label htmlFor="reason">
                                    Additional Notes
                                </label>

                                <textarea
                                    id="reason"
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                    placeholder="Tell us if you have any concerns or additional information..."
                                ></textarea>

                            </div>

                            <button
                                type="submit"
                                className="btn"
                            >
                                📅 Request Appointment
                            </button>

                        </form>

                        <div className="info-box">

                            <strong>
                                Appointment Reminder
                            </strong>

                            <br />

                            Please arrive at least 10 minutes
                            before your scheduled appointment.

                            <br />

                            Bring your patient ID when visiting
                            the clinic.

                        </div>

                    </div>

                    <div className="appointment-card">

                        <h2>
                            My Appointments
                        </h2>

                        <table>
                            <thead>
                                <tr>
                               <th>Patient ID</th>
                               <th>Service</th>
                               <th>Dentist</th>
                               <th>Date</th>
                               <th>Time</th>
                               <th>Notes</th>
                               <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>

                                {

                                    appointments.map(
                                        (appointment, index) => (

                                            <tr key={index}>

                                                <td>
                                                    {
                                                        appointment.patientId
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        appointment.service
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        appointment.dentist
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        appointment.date
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        appointment.time
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        appointment.notes
                                                    }
                                                </td>

                                                <td>

                                                    <span className="status">

                                                        {
                                                            appointment.status
                                                        }

                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )

                                }

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </>

    );
}
