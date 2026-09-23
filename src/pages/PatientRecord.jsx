import { useEffect } from "react";
import Sidebar from "./Sidebar.jsx";

const pageScript = "\n\n        function logout() {\n\n            if (confirm(\"Are you sure you want to logout?\")) {\n\n                localStorage.removeItem(\"userEmail\");\n                localStorage.removeItem(\"userRole\");\n                localStorage.removeItem(\"dentalCareUser\");\n\n                window.location.href = \"login.html\";\n            }\n        }\n\n\n        function toggleSidebar() {\n\n            document\n                .getElementById(\"sidebar\")\n                .classList.toggle(\"open\");\n\n        }\n\n\n        function updateOnlineStatus() {\n\n            const message =\n                document.getElementById(\"offlineMessage\");\n\n            message.style.display =\n                navigator.onLine ? \"none\" : \"block\";\n\n        }\n\n        window.addEventListener(\"online\", updateOnlineStatus);\n        window.addEventListener(\"offline\", updateOnlineStatus);\n\n        updateOnlineStatus();\n\n\n        if (\"serviceWorker\" in navigator) {\n\n            window.addEventListener(\"load\", function() {\n\n                navigator.serviceWorker\n                    .register(\"sw.js\")\n                    .catch(function(error) {\n                        console.log(error);\n                    });\n\n            });\n\n        }\n\n    ";

function runInline(code, event) {
  try {
    return Function("event", code).call(event.currentTarget, event);
  } catch (error) {
    console.error(error);
  }
}

export default function PatientRecord() {
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
      <style>{"\n\n        * {\n            box-sizing: border-box;\n            margin: 0;\n            padding: 0;\n        }\n\n        body {\n            font-family: Arial, sans-serif;\n            background: #f7f4fb;\n            color: #4f3d63;\n        }\n\n        /* SIDEBAR */\n\n        .sidebar {\n            position: fixed;\n            left: 0;\n            top: 0;\n            width: 250px;\n            height: 100vh;\n            background: #9b7bb8;\n            color: white;\n            padding: 25px 18px;\n            z-index: 1000;\n        }\n\n        .logo {\n            text-align: center;\n            margin-bottom: 35px;\n        }\n\n        .logo-circle {\n            width: 60px;\n            height: 60px;\n            margin: auto;\n            background: white;\n            color: #9b7bb8;\n            border-radius: 50%;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-size: 28px;\n        }\n\n        .logo h2 {\n            margin-top: 10px;\n            font-size: 21px;\n        }\n\n        .logo p {\n            font-size: 12px;\n            opacity: .85;\n        }\n\n        .nav {\n            list-style: none;\n        }\n\n        .nav li {\n            margin-bottom: 8px;\n        }\n\n        .nav a {\n            display: block;\n            color: white;\n            text-decoration: none;\n            padding: 13px 15px;\n            border-radius: 10px;\n        }\n\n        .nav a:hover,\n        .nav a.active {\n            background: rgba(255,255,255,.2);\n        }\n\n        .logout {\n            position: absolute;\n            bottom: 25px;\n            left: 18px;\n            right: 18px;\n            border: none;\n            background: rgba(255,255,255,.15);\n            color: white;\n            padding: 13px;\n            border-radius: 10px;\n            cursor: pointer;\n            font-size: 15px;\n        }\n\n        /* MAIN */\n\n        .main {\n            margin-left: 250px;\n            min-height: 100vh;\n        }\n\n        .topbar {\n            height: 75px;\n            background: white;\n            display: flex;\n            align-items: center;\n            padding: 0 35px;\n            border-bottom: 1px solid #e6dff0;\n        }\n\n        .topbar h1 {\n            font-size: 24px;\n        }\n\n        .content {\n            padding: 30px;\n            max-width: 1100px;\n        }\n\n        .intro {\n            margin-bottom: 25px;\n        }\n\n        .intro h2 {\n            font-size: 28px;\n            margin-bottom: 7px;\n        }\n\n        .intro p {\n            color: #7d7188;\n        }\n\n        /* SUMMARY */\n\n        .summary {\n            display: grid;\n            grid-template-columns: repeat(3, 1fr);\n            gap: 18px;\n            margin-bottom: 25px;\n        }\n\n        .summary-card {\n            background: white;\n            padding: 22px;\n            border-radius: 15px;\n            box-shadow: 0 5px 20px rgba(79,61,99,.07);\n        }\n\n        .summary-card span {\n            font-size: 28px;\n        }\n\n        .summary-card h3 {\n            margin-top: 10px;\n            font-size: 25px;\n        }\n\n        .summary-card p {\n            color: #7d7188;\n            font-size: 14px;\n        }\n\n        /* RECORDS */\n\n        .records-card {\n            background: white;\n            border-radius: 18px;\n            padding: 25px;\n            box-shadow: 0 5px 20px rgba(79,61,99,.08);\n        }\n\n        .record {\n            padding: 20px 0;\n            border-bottom: 1px solid #eee7f5;\n        }\n\n        .record:last-child {\n            border-bottom: none;\n        }\n\n        .record-header {\n            display: flex;\n            justify-content: space-between;\n            gap: 15px;\n        }\n\n        .record h3 {\n            font-size: 18px;\n            margin-bottom: 6px;\n        }\n\n        .record-date {\n            color: #80609e;\n            font-size: 14px;\n        }\n\n        .record p {\n            margin-top: 8px;\n            color: #71677a;\n            line-height: 1.5;\n        }\n\n        .status {\n            background: #e7f6ec;\n            color: #277443;\n            padding: 6px 10px;\n            border-radius: 20px;\n            height: fit-content;\n            font-size: 12px;\n            font-weight: bold;\n        }\n\n        .offline {\n            display: none;\n            background: #fff3cd;\n            color: #725b00;\n            padding: 10px 15px;\n            text-align: center;\n        }\n\n        .mobile-header {\n            display: none;\n        }\n\n        @media (max-width: 768px) {\n\n            .sidebar {\n                width: 220px;\n                transform: translateX(-100%);\n                transition: .3s;\n            }\n\n            .sidebar.open {\n                transform: translateX(0);\n            }\n\n            .main {\n                margin-left: 0;\n            }\n\n            .mobile-header {\n                display: flex;\n                height: 65px;\n                background: #9b7bb8;\n                color: white;\n                align-items: center;\n                padding: 0 18px;\n                gap: 15px;\n            }\n\n            .menu-btn {\n                border: none;\n                background: transparent;\n                color: white;\n                font-size: 25px;\n                cursor: pointer;\n            }\n\n            .topbar {\n                display: none;\n            }\n\n            .content {\n                padding: 20px;\n            }\n\n            .summary {\n                grid-template-columns: 1fr;\n            }\n\n            .record-header {\n                flex-direction: column;\n            }\n        }\n\n    "}</style>
        <Sidebar role="patient" active="records" />
  <div className="main">
    <div className="mobile-header">
      <button className="menu-btn" onClick={(event) => runInline("toggleSidebar()", event)}>☰</button>
      <strong>DentalCare</strong>
</div>
    <div className="topbar">
      <h1>Dental Records</h1>
</div>
    <div className="offline" id="offlineMessage">
            You are currently offline.
        </div>
    <div className="content">
      <div className="intro">
        <h2>My Dental Records</h2>
        <p>View your previous dental visits and treatment history.</p>
</div>
      <div className="summary">
        <div className="summary-card">
          <span>🦷</span>
          <h3>3</h3>
          <p>Total Visits</p>
</div>
        <div className="summary-card">
          <span>✨</span>
          <h3>2</h3>
          <p>Completed Treatments</p>
</div>
        <div className="summary-card">
          <span>📅</span>
          <h3>1</h3>
          <p>Upcoming Appointment</p>
</div>
</div>
      <div className="records-card">
        <div className="record">
          <div className="record-header">
            <div>
              <h3>Dental Check-up</h3>
              <div className="record-date">
                                September 15, 2026
                            </div>
</div>
            <span className="status">CONFIRMED</span>
</div>
          <p>
                        Scheduled dental check-up with Dr. Maria Santos.
                    </p>
</div>
        <div className="record">
          <div className="record-header">
            <div>
              <h3>Teeth Cleaning</h3>
              <div className="record-date">
                                August 20, 2026
                            </div>
</div>
            <span className="status">COMPLETED</span>
</div>
          <p>
                        Routine dental cleaning and oral hygiene assessment.
                    </p>
</div>
        <div className="record">
          <div className="record-header">
            <div>
              <h3>Dental Consultation</h3>
              <div className="record-date">
                                July 10, 2026
                            </div>
</div>
            <span className="status">COMPLETED</span>
</div>
          <p>
                        General dental consultation and oral examination.
                    </p>
</div>
        <div className="record">
          <div className="record-header">
            <div>
              <h3>Dental Filling</h3>
              <div className="record-date">
                                June 18, 2026
                            </div>
</div>
            <span className="status">COMPLETED</span>
</div>
          <p>
                        Dental filling procedure completed successfully.
                    </p>
</div>
</div>
</div>
</div>
    </>
  );
}
