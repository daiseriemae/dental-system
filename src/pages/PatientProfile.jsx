import { useEffect } from "react";
import Sidebar from "./Sidebar.jsx";

const pageScript = "\n\n\n        const profileForm =\n            document.getElementById(\"profileForm\");\n\n\n        profileForm.addEventListener(\n            \"submit\",\n            function(event) {\n\n                event.preventDefault();\n\n\n                const profile = {\n\n                    firstName:\n                        document.getElementById(\"firstName\").value,\n\n                    lastName:\n                        document.getElementById(\"lastName\").value,\n\n                    email:\n                        document.getElementById(\"email\").value,\n\n                    phone:\n                        document.getElementById(\"phone\").value,\n\n                    birthdate:\n                        document.getElementById(\"birthdate\").value,\n\n                    address:\n                        document.getElementById(\"address\").value\n\n                };\n\n\n                localStorage.setItem(\n                    \"patientProfile\",\n                    JSON.stringify(profile)\n                );\n\n\n                const message =\n                    document.getElementById(\"successMessage\");\n\n                message.style.display = \"block\";\n\n\n                setTimeout(function() {\n\n                    message.style.display = \"none\";\n\n                }, 3000);\n\n            }\n        );\n\n\n        function resetForm() {\n\n            document.getElementById(\"firstName\").value =\n                \"Daiserie\";\n\n            document.getElementById(\"lastName\").value =\n                \"Mae\";\n\n            document.getElementById(\"email\").value =\n                \"patient@email.com\";\n\n            document.getElementById(\"phone\").value =\n                \"0912 345 6789\";\n\n            document.getElementById(\"birthdate\").value =\n                \"2005-10-11\";\n\n            document.getElementById(\"address\").value =\n                \"Puerto Princesa City\";\n\n        }\n\n\n        function logout() {\n\n            if (confirm(\n                \"Are you sure you want to logout?\"\n            )) {\n\n                localStorage.removeItem(\"userEmail\");\n                localStorage.removeItem(\"userRole\");\n                localStorage.removeItem(\"dentalCareUser\");\n\n                window.location.href =\n                    \"login.html\";\n\n            }\n\n        }\n\n\n        function toggleSidebar() {\n\n            document\n                .getElementById(\"sidebar\")\n                .classList.toggle(\"open\");\n\n        }\n\n\n        function updateOnlineStatus() {\n\n            const message =\n                document.getElementById(\"offlineMessage\");\n\n            message.style.display =\n                navigator.onLine\n                ? \"none\"\n                : \"block\";\n\n        }\n\n\n        window.addEventListener(\n            \"online\",\n            updateOnlineStatus\n        );\n\n        window.addEventListener(\n            \"offline\",\n            updateOnlineStatus\n        );\n\n        updateOnlineStatus();\n\n\n        /* SERVICE WORKER */\n\n        if (\"serviceWorker\" in navigator) {\n\n            window.addEventListener(\n                \"load\",\n                function() {\n\n                    navigator.serviceWorker\n                        .register(\"sw.js\")\n                        .catch(function(error) {\n\n                            console.log(\n                                \"Service Worker error:\",\n                                error\n                            );\n\n                        });\n\n                }\n            );\n\n        }\n\n    ";

function runInline(code, event) {
  try {
    return Function("event", code).call(event.currentTarget, event);
  } catch (error) {
    console.error(error);
  }
}

export default function PatientProfile() {
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
      <style>{"\n\n        * {\n            box-sizing: border-box;\n            margin: 0;\n            padding: 0;\n        }\n\n        body {\n            font-family: Arial, sans-serif;\n            background: #f7f4fb;\n            color: #4f3d63;\n        }\n\n        /* SIDEBAR */\n\n        .sidebar {\n            position: fixed;\n            left: 0;\n            top: 0;\n            width: 250px;\n            height: 100vh;\n            background: #9b7bb8;\n            color: white;\n            padding: 25px 18px;\n            z-index: 1000;\n        }\n\n        .logo {\n            text-align: center;\n            margin-bottom: 35px;\n        }\n\n        .logo-circle {\n            width: 60px;\n            height: 60px;\n            margin: auto;\n            background: white;\n            color: #9b7bb8;\n            border-radius: 50%;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-size: 28px;\n        }\n\n        .logo h2 {\n            margin-top: 10px;\n        }\n\n        .logo p {\n            font-size: 12px;\n            opacity: .85;\n        }\n\n        .nav {\n            list-style: none;\n        }\n\n        .nav li {\n            margin-bottom: 8px;\n        }\n\n        .nav a {\n            display: block;\n            color: white;\n            text-decoration: none;\n            padding: 13px 15px;\n            border-radius: 10px;\n        }\n\n        .nav a:hover,\n        .nav a.active {\n            background: rgba(255,255,255,.2);\n        }\n\n        .logout {\n            position: absolute;\n            bottom: 25px;\n            left: 18px;\n            right: 18px;\n            border: none;\n            background: rgba(255,255,255,.15);\n            color: white;\n            padding: 13px;\n            border-radius: 10px;\n            cursor: pointer;\n            font-size: 15px;\n        }\n\n        /* MAIN */\n\n        .main {\n            margin-left: 250px;\n            min-height: 100vh;\n        }\n\n        .topbar {\n            height: 75px;\n            background: white;\n            display: flex;\n            align-items: center;\n            padding: 0 35px;\n            border-bottom: 1px solid #e6dff0;\n        }\n\n        .topbar h1 {\n            font-size: 24px;\n        }\n\n        .content {\n            padding: 30px;\n            max-width: 1000px;\n        }\n\n        .intro {\n            margin-bottom: 25px;\n        }\n\n        .intro h2 {\n            font-size: 28px;\n            margin-bottom: 7px;\n        }\n\n        .intro p {\n            color: #7d7188;\n        }\n\n        /* PROFILE */\n\n        .profile-card {\n            background: white;\n            border-radius: 18px;\n            padding: 30px;\n            box-shadow: 0 5px 20px rgba(79,61,99,.08);\n        }\n\n        .profile-header {\n            display: flex;\n            align-items: center;\n            gap: 18px;\n            padding-bottom: 25px;\n            border-bottom: 1px solid #eee7f5;\n            margin-bottom: 25px;\n        }\n\n        .profile-avatar {\n            width: 75px;\n            height: 75px;\n            border-radius: 50%;\n            background: #d8ccec;\n            color: #4f3d63;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-size: 28px;\n            font-weight: bold;\n        }\n\n        .profile-header h3 {\n            font-size: 22px;\n        }\n\n        .profile-header p {\n            color: #7d7188;\n            margin-top: 5px;\n        }\n\n        .form-grid {\n            display: grid;\n            grid-template-columns: 1fr 1fr;\n            gap: 20px;\n        }\n\n        .form-group {\n            margin-bottom: 18px;\n        }\n\n        .form-group.full {\n            grid-column: 1 / -1;\n        }\n\n        .form-group label {\n            display: block;\n            font-weight: bold;\n            margin-bottom: 8px;\n        }\n\n        .form-group input {\n            width: 100%;\n            padding: 13px;\n            border: 1px solid #ddd3e7;\n            border-radius: 10px;\n            font-size: 15px;\n            outline: none;\n        }\n\n        .form-group input:focus {\n            border-color: #9b7bb8;\n            box-shadow: 0 0 0 3px #eee7f5;\n        }\n\n        .form-group input:disabled {\n            background: #f3efff;\n            color: #766b80;\n        }\n\n        .buttons {\n            margin-top: 10px;\n            display: flex;\n            gap: 12px;\n        }\n\n        .btn {\n            border: none;\n            padding: 13px 22px;\n            border-radius: 10px;\n            cursor: pointer;\n            font-weight: bold;\n            font-size: 14px;\n        }\n\n        .save {\n            background: #9b7bb8;\n            color: white;\n        }\n\n        .save:hover {\n            background: #80609e;\n        }\n\n        .cancel {\n            background: #eee7f5;\n            color: #4f3d63;\n        }\n\n        .message {\n            display: none;\n            margin-bottom: 20px;\n            background: #e7f6ec;\n            color: #277443;\n            padding: 13px;\n            border-radius: 10px;\n        }\n\n        .offline {\n            display: none;\n            background: #fff3cd;\n            color: #725b00;\n            padding: 10px;\n            text-align: center;\n        }\n\n        .mobile-header {\n            display: none;\n        }\n\n        @media (max-width: 768px) {\n\n            .sidebar {\n                width: 220px;\n                transform: translateX(-100%);\n                transition: .3s;\n            }\n\n            .sidebar.open {\n                transform: translateX(0);\n            }\n\n            .main {\n                margin-left: 0;\n            }\n\n            .mobile-header {\n                display: flex;\n                height: 65px;\n                background: #9b7bb8;\n                color: white;\n                align-items: center;\n                padding: 0 18px;\n                gap: 15px;\n            }\n\n            .menu-btn {\n                border: none;\n                background: transparent;\n                color: white;\n                font-size: 25px;\n                cursor: pointer;\n            }\n\n            .topbar {\n                display: none;\n            }\n\n            .content {\n                padding: 20px;\n            }\n\n            .profile-card {\n                padding: 20px;\n            }\n\n            .form-grid {\n                grid-template-columns: 1fr;\n                gap: 0;\n            }\n\n            .form-group.full {\n                grid-column: auto;\n            }\n\n            .buttons {\n                flex-direction: column;\n            }\n\n            .btn {\n                width: 100%;\n            }\n        }\n\n    "}</style>
        <Sidebar role="patient" active="profile" />
  <div className="main">
    <div className="mobile-header">
      <button className="menu-btn" onClick={(event) => runInline("toggleSidebar()", event)}>

                ☰

            </button>
      <strong>DentalCare</strong>
</div>
    <div className="topbar">
      <h1>My Profile</h1>
</div>
    <div className="offline" id="offlineMessage">

            You are currently offline.

        </div>
    <div className="content">
      <div className="intro">
        <h2>My Profile</h2>
        <p>
                    View and update your personal information.
                </p>
</div>
      <div className="message" id="successMessage">

                ✅ Profile information saved successfully.

            </div>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
                        DM
                    </div>
          <div>
            <h3>
                            Daiserie Mae
                        </h3>
            <p>
                            Patient ID: P-00125
                        </p>
</div>
</div>
        <form id="profileForm">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">
                                First Name
                            </label>
              <input type="text" id="firstName" value="Daiserie" required="" />
</div>
            <div className="form-group">
              <label htmlFor="lastName">
                                Last Name
                            </label>
              <input type="text" id="lastName" value="Mae" required="" />
</div>
            <div className="form-group">
              <label htmlFor="email">
                                Email Address
                            </label>
              <input type="email" id="email" value="patient@email.com" required="" />
</div>
            <div className="form-group">
              <label htmlFor="phone">
                                Phone Number
                            </label>
              <input type="tel" id="phone" value="0912 345 6789" required="" />
</div>
            <div className="form-group">
              <label htmlFor="birthdate">
                                Birthdate
                            </label>
              <input type="date" id="birthdate" value="2005-10-11" />
</div>
            <div className="form-group">
              <label htmlFor="patientId">
                                Patient ID
                            </label>
              <input type="text" id="patientId" value="P-00125" disabled="" />
</div>
            <div className="form-group full">
              <label htmlFor="address">
                                Address
                            </label>
              <input type="text" id="address" value="Puerto Princesa City" />
</div>
</div>
          <div className="buttons">
            <button type="submit" className="btn save">

                            💾 Save Changes

                        </button>
            <button type="button" className="btn cancel" onClick={(event) => runInline("resetForm()", event)}>

                            ↩ Cancel

                        </button>
</div>
</form>
</div>
</div>
</div>
    </>
  );
}
