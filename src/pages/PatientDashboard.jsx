import { useEffect } from "react";
import Sidebar from "./Sidebar.jsx";

const pageScript = "\n\n\n    /* =====================================================\n       SIDEBAR\n    ===================================================== */\n\n    function toggleSidebar() {\n\n        const sidebar =\n            document.getElementById(\"sidebar\");\n\n        sidebar.classList.toggle(\"show\");\n\n    }\n\n\n\n    /* =====================================================\n       LOGOUT\n    ===================================================== */\n\n    function logout(event) {\n\n        event.preventDefault();\n\n\n        const confirmLogout =\n            confirm(\n                \"Are you sure you want to logout?\"\n            );\n\n\n        if (confirmLogout) {\n\n            localStorage.removeItem(\n                \"userEmail\"\n            );\n\n            localStorage.removeItem(\n                \"userRole\"\n            );\n\n            localStorage.removeItem(\n                \"dentalCareUser\"\n            );\n\n\n            window.location.href =\n                \"login.html\";\n\n        }\n\n    }\n\n\n\n    /* =====================================================\n       OFFLINE STATUS\n    ===================================================== */\n\n    const offlineMessage =\n        document.getElementById(\n            \"offlineMessage\"\n        );\n\n\n    function updateConnection() {\n\n        if (navigator.onLine) {\n\n            offlineMessage.style.display =\n                \"none\";\n\n        } else {\n\n            offlineMessage.style.display =\n                \"block\";\n\n        }\n\n    }\n\n\n    window.addEventListener(\n        \"online\",\n        updateConnection\n    );\n\n\n    window.addEventListener(\n        \"offline\",\n        updateConnection\n    );\n\n\n    updateConnection();\n\n\n\n    /* =====================================================\n       SERVICE WORKER\n    ===================================================== */\n\n    if (\"serviceWorker\" in navigator) {\n\n        window.addEventListener(\n            \"load\",\n            function () {\n\n                navigator.serviceWorker\n                    .register(\"sw.js\")\n                    .then(\n                        function () {\n\n                            console.log(\n                                \"DentalCare Service Worker registered.\"\n                            );\n\n                        }\n                    )\n                    .catch(\n                        function (error) {\n\n                            console.error(\n                                \"Service Worker registration failed:\",\n                                error\n                            );\n\n                        }\n                    );\n\n            }\n        );\n\n    }\n\n";

function runInline(code, event) {
  try {
    return Function("event", code).call(event.currentTarget, event);
  } catch (error) {
    console.error(error);
  }
}

export default function PatientDashboard() {
  useEffect(() => {
    if (!pageScript.trim()) return;

    const script = document.createElement("script");
    script.textContent = pageScript;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <>
      <style>{"\n\n        /* =====================================================\n           GENERAL\n        ===================================================== */\n\n        * {\n            margin: 0;\n            padding: 0;\n            box-sizing: border-box;\n        }\n\n        body {\n            font-family: Arial, Helvetica, sans-serif;\n\n            background: #f7f4fb;\n\n            color: #40364a;\n\n            min-height: 100vh;\n        }\n\n        button,\n        a {\n            font-family: inherit;\n        }\n\n\n        /* =====================================================\n           LAYOUT\n        ===================================================== */\n\n        .dashboard {\n            display: flex;\n\n            min-height: 100vh;\n        }\n\n\n        /* =====================================================\n           SIDEBAR\n        ===================================================== */\n\n        .sidebar {\n            width: 250px;\n\n            background: #9b7bb8;\n\n            color: white;\n\n            padding: 25px 18px;\n\n            position: fixed;\n\n            left: 0;\n            top: 0;\n            bottom: 0;\n\n            z-index: 1000;\n        }\n\n\n        /* =========================\n   LOGO SECTION\n========================= */\n\n.logo {\n    text-align: center;\n    margin-bottom: 35px;\n    padding-top: 5px;\n}\n\n/* Logo Circle */\n.logo-circle {\n   width: 60px;\n            height: 60px;\n            margin: auto;\n            background: white;\n            color: #9b7bb8;\n            border-radius: 50%;\n\n            display: flex;\n            align-items: center;\n            justify-content: center;\n\n            font-size: 28px;\n}\n\n/* DentalCare Title */\n.logo h2 {\n    margin: 0 0 5px 0;\n\n    font-size: 22px;\n    font-weight: bold;\n\n    color: white;\n}\n\n/* Dentist Portal */\n.logo p {\n    margin: 0;\n\n    font-size: 12px;\n\n    color: white;\n\n    opacity: 0.85;\n}\n\n        /* =====================================================\n           NAVIGATION\n        ===================================================== */\n\n        .nav-menu {\n            list-style: none;\n        }\n\n\n        .nav-menu li {\n            margin-bottom: 8px;\n        }\n\n\n        .nav-menu a {\n            display: flex;\n\n            align-items: center;\n\n            gap: 13px;\n\n            padding: 13px 15px;\n\n            border-radius: 10px;\n\n            color: white;\n\n            text-decoration: none;\n\n            font-size: 14px;\n\n            transition: .2s;\n        }\n\n\n        .nav-menu a:hover,\n        .nav-menu a.active {\n            background: #d8ccec;\n\n            color: #4f3d63;\n        }\n\n\n        .nav-icon {\n            width: 22px;\n\n            text-align: center;\n\n            font-size: 17px;\n        }\n\n\n        .logout {\n            position: absolute;\n\n            left: 18px;\n            right: 18px;\n\n            bottom: 25px;\n        }\n\n\n        .logout a {\n            background: rgba(255,255,255,.12);\n        }\n\n\n        /* =====================================================\n           MAIN CONTENT\n        ===================================================== */\n\n        .main {\n            margin-left: 250px;\n\n            width: calc(100% - 250px);\n\n            min-height: 100vh;\n        }\n\n\n        /* =====================================================\n           TOP BAR\n        ===================================================== */\n\n        .topbar {\n            background: white;\n\n            height: 75px;\n\n            display: flex;\n\n            align-items: center;\n\n            justify-content: space-between;\n\n            padding: 0 35px;\n\n            border-bottom: 1px solid #eee8f4;\n        }\n\n\n        .page-title h1 {\n            font-size: 22px;\n\n            color: #4f3d63;\n\n            margin-bottom: 3px;\n        }\n\n\n        .page-title p {\n            font-size: 12px;\n\n            color: #888;\n        }\n\n\n        .user-area {\n            display: flex;\n\n            align-items: center;\n\n            gap: 12px;\n        }\n\n\n        .notification {\n            width: 40px;\n            height: 40px;\n\n            border: none;\n\n            border-radius: 50%;\n\n            background: #f3efff;\n\n            color: #80609e;\n\n            font-size: 18px;\n\n            cursor: pointer;\n        }\n\n\n        .user-avatar {\n            width: 42px;\n            height: 42px;\n\n            border-radius: 50%;\n\n            background: #d8ccec;\n\n            color: #80609e;\n\n            display: flex;\n\n            align-items: center;\n\n            justify-content: center;\n\n            font-weight: bold;\n        }\n\n\n        /* =====================================================\n           CONTENT\n        ===================================================== */\n\n        .content {\n            padding: 30px 35px;\n        }\n\n\n        /* =====================================================\n           WELCOME\n        ===================================================== */\n\n        .welcome {\n            background: linear-gradient(\n                135deg,\n                #e9def5,\n                #f3efff\n            );\n\n            border-radius: 18px;\n\n            padding: 28px;\n\n            display: flex;\n\n            align-items: center;\n\n            justify-content: space-between;\n\n            margin-bottom: 25px;\n        }\n\n\n        .welcome-text h2 {\n            color: #80609e;\n\n            font-size: 25px;\n\n            margin-bottom: 8px;\n        }\n\n\n        .welcome-text p {\n            color: #706579;\n\n            font-size: 14px;\n\n            line-height: 1.6;\n\n            max-width: 600px;\n        }\n\n\n        .welcome-icon {\n            font-size: 70px;\n\n            color: #9b7bb8;\n\n            padding-right: 25px;\n        }\n\n\n        /* =====================================================\n           QUICK ACTIONS\n        ===================================================== */\n\n        .section-title {\n            font-size: 18px;\n\n            color: #4f3d63;\n\n            margin-bottom: 15px;\n        }\n\n\n        .quick-actions {\n            display: grid;\n\n            grid-template-columns:\n                repeat(3, 1fr);\n\n            gap: 15px;\n\n            margin-bottom: 25px;\n        }\n\n\n        .action-card {\n            background: white;\n\n            border: 1px solid #eee8f4;\n\n            border-radius: 15px;\n\n            padding: 20px;\n\n            text-decoration: none;\n\n            color: #40364a;\n\n            display: flex;\n\n            align-items: center;\n\n            gap: 15px;\n\n            transition: .2s;\n\n            cursor: pointer;\n        }\n\n\n        .action-card:hover {\n            transform: translateY(-2px);\n\n            box-shadow:\n                0 8px 20px rgba(100,70,130,.10);\n        }\n\n\n        .action-icon {\n            width: 48px;\n            height: 48px;\n\n            min-width: 48px;\n\n            border-radius: 12px;\n\n            background: #f3efff;\n\n            color: #9b7bb8;\n\n            display: flex;\n\n            align-items: center;\n\n            justify-content: center;\n\n            font-size: 22px;\n        }\n\n\n        .action-card h3 {\n            font-size: 15px;\n\n            margin-bottom: 4px;\n\n            color: #4f3d63;\n        }\n\n\n        .action-card p {\n            font-size: 12px;\n\n            color: #888;\n        }\n\n\n        /* =====================================================\n           MAIN GRID\n        ===================================================== */\n\n        .dashboard-grid {\n            display: grid;\n\n            grid-template-columns:\n                2fr 1fr;\n\n            gap: 20px;\n        }\n\n\n        /* =====================================================\n           CARD\n        ===================================================== */\n\n        .card {\n            background: white;\n\n            border-radius: 17px;\n\n            padding: 23px;\n\n            border: 1px solid #eee8f4;\n\n            box-shadow:\n                0 4px 15px rgba(100,70,130,.05);\n        }\n\n\n        .card-header {\n            display: flex;\n\n            align-items: center;\n\n            justify-content: space-between;\n\n            margin-bottom: 18px;\n        }\n\n\n        .card-header h3 {\n            font-size: 17px;\n\n            color: #4f3d63;\n        }\n\n\n        .view-link {\n            color: #80609e;\n\n            text-decoration: none;\n\n            font-size: 12px;\n\n            font-weight: bold;\n        }\n\n\n        /* =====================================================\n           APPOINTMENT\n        ===================================================== */\n\n        .appointment {\n            display: flex;\n\n            align-items: center;\n\n            gap: 17px;\n\n            padding: 17px;\n\n            border-radius: 13px;\n\n            background: #faf8fd;\n\n            border: 1px solid #eee8f4;\n        }\n\n\n        .calendar-box {\n            width: 58px;\n            min-width: 58px;\n\n            height: 65px;\n\n            border-radius: 12px;\n\n            background: #9b7bb8;\n\n            color: white;\n\n            display: flex;\n\n            flex-direction: column;\n\n            align-items: center;\n\n            justify-content: center;\n        }\n\n\n        .calendar-box strong {\n            font-size: 20px;\n        }\n\n\n        .calendar-box span {\n            font-size: 10px;\n\n            text-transform: uppercase;\n        }\n\n\n        .appointment-info {\n            flex: 1;\n        }\n\n\n        .appointment-info h4 {\n            font-size: 15px;\n\n            color: #4f3d63;\n\n            margin-bottom: 5px;\n        }\n\n\n        .appointment-info p {\n            font-size: 12px;\n\n            color: #888;\n\n            line-height: 1.7;\n        }\n\n\n        .status {\n            background: #e9def5;\n\n            color: #665078;\n\n            padding: 6px 10px;\n\n            border-radius: 20px;\n\n            font-size: 10px;\n\n            font-weight: bold;\n        }\n\n\n        /* =====================================================\n           PROFILE CARD\n        ===================================================== */\n\n        .profile-top {\n            display: flex;\n\n            align-items: center;\n\n            gap: 15px;\n\n            margin-bottom: 20px;\n        }\n\n\n        .profile-avatar {\n            width: 58px;\n            height: 58px;\n\n            border-radius: 50%;\n\n            background: #d8ccec;\n\n            color: #80609e;\n\n            display: flex;\n\n            align-items: center;\n\n            justify-content: center;\n\n            font-size: 25px;\n        }\n\n\n        .profile-name h4 {\n            color: #4f3d63;\n\n            font-size: 15px;\n\n            margin-bottom: 4px;\n        }\n\n\n        .profile-name p {\n            color: #888;\n\n            font-size: 11px;\n        }\n\n\n        .profile-info {\n            border-top: 1px solid #eee8f4;\n\n            padding-top: 15px;\n        }\n\n\n        .info-row {\n            display: flex;\n\n            justify-content: space-between;\n\n            padding: 8px 0;\n\n            font-size: 12px;\n        }\n\n\n        .info-row span:first-child {\n            color: #888;\n        }\n\n\n        .info-row span:last-child {\n            color: #4f3d63;\n\n            font-weight: 600;\n        }\n\n\n        /* =====================================================\n           HEALTH REMINDER\n        ===================================================== */\n\n        .reminder {\n            margin-top: 20px;\n\n            padding: 18px;\n\n            border-radius: 13px;\n\n            background: #f3efff;\n\n            display: flex;\n\n            gap: 13px;\n        }\n\n\n        .reminder-icon {\n            color: #9b7bb8;\n\n            font-size: 22px;\n        }\n\n\n        .reminder h4 {\n            font-size: 14px;\n\n            color: #4f3d63;\n\n            margin-bottom: 5px;\n        }\n\n\n        .reminder p {\n            color: #777;\n\n            font-size: 11px;\n\n            line-height: 1.5;\n        }\n\n\n        /* =====================================================\n           MOBILE MENU\n        ===================================================== */\n\n        .mobile-menu {\n            display: none;\n\n            border: none;\n\n            background: #f3efff;\n\n            color: #80609e;\n\n            width: 40px;\n            height: 40px;\n\n            border-radius: 9px;\n\n            font-size: 20px;\n\n            cursor: pointer;\n        }\n\n\n        /* =====================================================\n           OFFLINE\n        ===================================================== */\n\n        .offline {\n            display: none;\n\n            position: fixed;\n\n            bottom: 20px;\n\n            left: 50%;\n\n            transform: translateX(-50%);\n\n            background: #fff3cd;\n\n            color: #664d03;\n\n            padding: 10px 17px;\n\n            border-radius: 10px;\n\n            font-size: 12px;\n\n            box-shadow:\n                0 5px 20px rgba(0,0,0,.12);\n\n            z-index: 3000;\n        }\n\n\n        /* =====================================================\n           RESPONSIVE\n        ===================================================== */\n\n        @media (max-width: 1000px) {\n\n            .quick-actions {\n                grid-template-columns:\n                    repeat(2, 1fr);\n            }\n\n            .dashboard-grid {\n                grid-template-columns: 1fr;\n            }\n\n        }\n\n\n        @media (max-width: 768px) {\n\n            .sidebar {\n                transform: translateX(-100%);\n\n                transition: .25s;\n            }\n\n\n            .sidebar.show {\n                transform: translateX(0);\n            }\n\n\n            .main {\n                margin-left: 0;\n\n                width: 100%;\n            }\n\n\n            .mobile-menu {\n                display: block;\n            }\n\n\n            .topbar {\n                padding: 0 18px;\n            }\n\n\n            .content {\n                padding: 20px 18px;\n            }\n\n\n            .welcome {\n                padding: 22px;\n\n                text-align: center;\n\n                justify-content: center;\n            }\n\n\n            .welcome-icon {\n                display: none;\n            }\n\n        }\n\n\n        @media (max-width: 550px) {\n\n            .quick-actions {\n                grid-template-columns: 1fr;\n            }\n\n\n            .user-name {\n                display: none;\n            }\n\n\n            .appointment {\n                align-items: flex-start;\n\n                flex-wrap: wrap;\n            }\n\n\n            .status {\n                margin-left: 75px;\n            }\n\n\n            .welcome-text h2 {\n                font-size: 21px;\n            }\n\n        }\n\n    "}</style>
        <div className="dashboard">

    <Sidebar role="patient" active="dashboard" />

    <div className="main">

      <header className="topbar">
        <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
          <button className="mobile-menu" onClick={(event) => runInline("toggleSidebar()", event)}>
                    ☰
                </button>
          <div className="page-title">
            <h1>Patient Dashboard</h1>
            <p>
                        Manage your dental care easily
                    </p>
</div>
</div>
        <div className="user-area">
          <button className="notification" title="Notifications">
                    🔔
                </button>
          <div className="user-avatar">
                    DM
                </div>
          <div className="user-name">
            <strong style={{display: "block", fontSize: "13px", color: "#4f3d63"}}>
                        Daiserie Mae
                    </strong>
            <span style={{fontSize: "11px", color: "#888"}}>
                        Patient
                    </span>
</div>
</div>
</header>

      <main className="content">

        <section className="welcome">
          <div className="welcome-text">
            <h2>
                        Welcome back, Daiserie! 👋
                    </h2>
            <p>
                        Keep your smile healthy by managing
                        your appointments and dental records
                        in one place.
                    </p>
</div>
          <div className="welcome-icon">
                    🦷
                </div>
</section>

        <h3 className="section-title">
                What would you like to do?
            </h3>
        <section className="quick-actions">
          <a href="/patient/appointment" className="action-card">
            <div className="action-icon">
                        📅
                    </div>
            <div>
              <h3>
                            Book Appointment
                        </h3>
              <p>
                            Schedule your next visit
                        </p>
</div>
</a>
          <a href="records.html" className="action-card">
            <div className="action-icon">
                        📋
                    </div>
            <div>
              <h3>
                            Dental Records
                        </h3>
              <p>
                            View your dental history
                        </p>
</div>
</a>
          <a href="/patient/profile" className="action-card">
            <div className="action-icon">
                        👤
                    </div>
            <div>
              <h3>
                            My Profile
                        </h3>
              <p>
                            Update your information
                        </p>
</div>
</a>
</section>

        <section className="dashboard-grid">

          <div className="card">
            <div className="card-header">
              <h3>
                            📅 Next Appointment
                        </h3>
              <a href="/patient/appointment" className="view-link">
                            View All
                        </a>
</div>
            <div className="appointment">
              <div className="calendar-box">
                <strong>
                                15
                            </strong>
                <span>
                                Sep
                            </span>
</div>
              <div className="appointment-info">
                <h4>
                                Dental Check-up
                            </h4>
                <p>
                                👨‍⚕️ Dr. Maria Santos
                                                  <br />

                                🕐 10:00 AM
                                                  <br />

                                📍 DentalCare Clinic
                            </p>
</div>
              <span className="status">
                            CONFIRMED
                        </span>
</div>
</div>

          <div className="card">
            <div className="card-header">
              <h3>
                            👤 My Profile
                        </h3>
              <a href="/patient/profile" className="view-link">
                            Edit
                        </a>
</div>
            <div className="profile-top">
              <div className="profile-avatar">
                            👤
                        </div>
              <div className="profile-name">
                <h4>
                                Daiserie Mae
                            </h4>
                <p>
                                Patient ID: P-00125
                            </p>
</div>
</div>
            <div className="profile-info">
              <div className="info-row">
                <span>
                                Email
                            </span>
                <span>
                                patient@email.com
                            </span>
</div>
              <div className="info-row">
                <span>
                                Phone
                            </span>
                <span>
                                0912 345 6789
                            </span>
</div>
              <div className="info-row">
                <span>
                                Birthdate
                            </span>
                <span>
                                Oct 11, 2005
                            </span>
</div>
</div>
</div>
</section>

        <div className="reminder">
          <div className="reminder-icon">
                    💡
                </div>
          <div>
            <h4>
                        Dental Care Reminder
                    </h4>
            <p>
                        Remember to brush your teeth twice
                        a day, floss regularly, and attend
                        your scheduled dental appointments.
                    </p>
</div>
</div>
</main>
</div>
</div>
  <div className="offline" id="offlineMessage">
    📡 You are offline. DentalCare is using cached files.
</div>
    </>
  );
}
