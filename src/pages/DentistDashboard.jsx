import Sidebar from "./Sidebar.jsx";

export default function DentistDashboard() {

    function showNotifications() {
        window.alert(
            "You have 3 pending appointment requests and 2 follow-up reminders."
        );
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

                .dentist-dashboard .notification-btn {
                    border: none;
                    background: white;
                    color: #80609e;
                    font-size: 21px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                }

                .dentist-dashboard .notification-btn:hover {
                    background: #f3efff;
                }

                .dentist-dashboard .dashboard-content {
                    padding: 30px;
                    max-width: 1250px;
                }

                .dentist-dashboard .welcome {
                    background: linear-gradient(
                        135deg,
                        #9b7bb8,
                        #80609e
                    );
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
                    opacity: 0.92;
                }

                .dentist-dashboard .welcome-icon {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.18);
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
                    box-shadow: 0 5px 20px rgba(79, 61, 99, 0.07);
                    border: 1px solid #eee7f5;
                }

                .dentist-dashboard .stat-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
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
                    box-shadow: 0 5px 20px rgba(79, 61, 99, 0.07);
                    border: 1px solid #eee7f5;
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
                    width: 72px;
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
                }

                .dentist-dashboard .status.pending {
                    background: #fff3cd;
                    color: #80651a;
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
                    transition: 0.2s;
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
                        grid-template-columns: 1fr;
                    }

                    .dentist-dashboard .quick-actions {
                        grid-template-columns: 1fr;
                    }

                    .dentist-dashboard .welcome-icon {
                        display: none;
                    }

                    .dentist-dashboard .appointment-row {
                        align-items: flex-start;
                    }

                    .dentist-dashboard .status {
                        display: none;
                    }
                }
            `}</style>

            <div className="dentist-dashboard">

                <Sidebar
                    role="dentist"
                    active="dashboard"
                />

                <div className="dashboard-main">

                    <header className="topbar">

                        <div className="topbar-left">

                            <button
                                className="menu-btn"
                                type="button"
                                onClick={() => {
                                    const sidebar =
                                        document.getElementById("sidebar");

                                    sidebar.classList.add("show");
                                }}
                                aria-label="Open menu"
                            >
                                ☰
                            </button>

                            <div className="page-title">
                                <h1>Dentist Dashboard</h1>
                                <p>
                                    Manage your clinic and patient care.
                                </p>
                            </div>

                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px"
                            }}
                        >
                            <button
                                type="button"
                                className="notification-btn"
                                onClick={showNotifications}
                                title="Notifications"
                            >
                                🔔
                            </button>

                            <div className="dentist-info">
                                👩‍⚕️ Dr. Jhulance Fernandez
                            </div>
                        </div>

                    </header>

                    <main className="dashboard-content">

                        <section className="welcome">

                            <div>
                                <h2>
                                    Good morning, Dr. Lance! 👋
                                </h2>

                                <p>
                                    Here is your clinic overview for today.
                                </p>
                            </div>

                            <div className="welcome-icon">
                                🦷
                            </div>

                        </section>

                        <h3 className="section-title">
                            Today's Overview
                        </h3>

                        <section className="stats">

                            <div className="stat-card">
                                <div className="stat-top">
                                    <div className="stat-icon">📅</div>
                                </div>
                                <h3>4</h3>
                                <p>Today's Appointments</p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-top">
                                    <div className="stat-icon">⏳</div>
                                </div>
                                <h3>3</h3>
                                <p>Pending Requests</p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-top">
                                    <div className="stat-icon">👥</div>
                                </div>
                                <h3>24</h3>
                                <p>Total Patients</p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-top">
                                    <div className="stat-icon">🔔</div>
                                </div>
                                <h3>2</h3>
                                <p>Follow-up Reminders</p>
                            </div>

                        </section>

                        <div className="dashboard-grid">

                            <section className="card">

                                <div className="card-header">
                                    <h3>
                                        📅 Today's Schedule
                                    </h3>

                                    <a
                                        href="/dentist/appointments"
                                        className="view-link"
                                    >
                                        View All
                                    </a>
                                </div>

                                <div className="appointment-row">
                                    <div className="time">
                                        9:00 AM
                                    </div>

                                    <div className="patient-avatar">
                                        DM
                                    </div>

                                    <div className="patient-info">
                                        <strong>
                                            Daiserie Mae
                                        </strong>
                                        <span>
                                            Dental Check-up
                                        </span>
                                    </div>

                                    <span className="status">
                                        CONFIRMED
                                    </span>
                                </div>

                                <div className="appointment-row">
                                    <div className="time">
                                        10:30 AM
                                    </div>

                                    <div className="patient-avatar">
                                        JC
                                    </div>

                                    <div className="patient-info">
                                        <strong>
                                            John Michael Cruz
                                        </strong>
                                        <span>
                                            Dental Cleaning
                                        </span>
                                    </div>

                                    <span className="status pending">
                                        PENDING
                                    </span>
                                </div>

                                <div className="appointment-row">
                                    <div className="time">
                                        1:00 PM
                                    </div>

                                    <div className="patient-avatar">
                                        AR
                                    </div>

                                    <div className="patient-info">
                                        <strong>
                                            Angela Reyes
                                        </strong>
                                        <span>
                                            Dental Filling
                                        </span>
                                    </div>

                                    <span className="status">
                                        CONFIRMED
                                    </span>
                                </div>

                            </section>

                            <section className="card">

                                <div className="card-header">
                                    <h3>
                                        ⚡ Quick Actions
                                    </h3>
                                </div>

                                <div className="quick-actions">

                                    <a
                                        href="/dentist/appointments"
                                        className="action-card"
                                    >
                                        <div className="action-icon">
                                            📅
                                        </div>

                                        <div>
                                            <strong>
                                                Appointments
                                            </strong>
                                            <span>
                                                Manage schedules
                                            </span>
                                        </div>
                                    </a>

                                    <a
                                        href="/dentist/patient-record"
                                        className="action-card"
                                    >
                                        <div className="action-icon">
                                            📋
                                        </div>

                                        <div>
                                            <strong>
                                                Patient Records
                                            </strong>
                                            <span>
                                                View patient history
                                            </span>
                                        </div>
                                    </a>

                                    <a
                                        href="/dentist/services"
                                        className="action-card"
                                    >
                                        <div className="action-icon">
                                            🦷
                                        </div>

                                        <div>
                                            <strong>
                                                Dental Services
                                            </strong>
                                            <span>
                                                Manage services
                                            </span>
                                        </div>
                                    </a>

                                    <a
                                        href="/dentist/profile"
                                        className="action-card"
                                    >
                                        <div className="action-icon">
                                            👤
                                        </div>

                                        <div>
                                            <strong>
                                                My Profile
                                            </strong>
                                            <span>
                                                Update account
                                            </span>
                                        </div>
                                    </a>

                                </div>

                            </section>

                        </div>

                        <section className="reminder">

                            <div className="reminder-icon">
                                💡
                            </div>

                            <div>
                                <h4>
                                    Patient Follow-up Reminder
                                </h4>

                                <p>
                                    Review patients who need follow-up care
                                    and check pending appointment requests
                                    before the end of the day.
                                </p>
                            </div>

                        </section>

                    </main>

                </div>

            </div>
        </>
    );
}
