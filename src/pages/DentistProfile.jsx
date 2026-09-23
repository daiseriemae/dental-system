import { useEffect } from "react";
import Sidebar from "./Sidebar.jsx";

const pageScript = "\n\n        /* =========================\n           MOBILE SIDEBAR\n        ========================== */\n\n        function openSidebar() {\n\n            document\n                .getElementById(\"sidebar\")\n                .classList.add(\"show\");\n\n        }\n\n\n        function closeSidebar() {\n\n            document\n                .getElementById(\"sidebar\")\n                .classList.remove(\"show\");\n\n        }\n\n\n        /* =========================\n           SAVE PROFILE\n        ========================== */\n\n        function saveProfile() {\n\n            const profile = {\n\n                fullName:\n                    document.getElementById(\n                        \"fullName\"\n                    ).value,\n\n                title:\n                    document.getElementById(\n                        \"title\"\n                    ).value,\n\n                email:\n                    document.getElementById(\n                        \"email\"\n                    ).value,\n\n                phone:\n                    document.getElementById(\n                        \"phone\"\n                    ).value,\n\n                license:\n                    document.getElementById(\n                        \"license\"\n                    ).value,\n\n                experience:\n                    document.getElementById(\n                        \"experience\"\n                    ).value,\n\n                address:\n                    document.getElementById(\n                        \"address\"\n                    ).value,\n\n                about:\n                    document.getElementById(\n                        \"about\"\n                    ).value,\n\n                updatedAt:\n                    new Date().toLocaleString()\n\n            };\n\n\n            if (!profile.fullName ||\n                !profile.email ||\n                !profile.phone) {\n\n                alert(\n                    \"Please complete your name, email, and phone number.\"\n                );\n\n                return;\n            }\n\n\n            localStorage.setItem(\n                \"dentistProfile\",\n                JSON.stringify(profile)\n            );\n\n\n            document.getElementById(\n                \"profileName\"\n            ).textContent = profile.fullName;\n\n\n            document.getElementById(\n                \"lastUpdated\"\n            ).textContent =\n                profile.updatedAt;\n\n\n            alert(\n                \"Your profile has been saved successfully.\"\n            );\n\n        }\n\n\n        /* =========================\n           LOAD PROFILE\n        ========================== */\n\n        function loadProfile() {\n\n            const saved =\n                localStorage.getItem(\n                    \"dentistProfile\"\n                );\n\n            if (!saved) {\n                return;\n            }\n\n\n            const profile =\n                JSON.parse(saved);\n\n\n            document.getElementById(\n                \"fullName\"\n            ).value =\n                profile.fullName || \"\";\n\n\n            document.getElementById(\n                \"title\"\n            ).value =\n                profile.title || \"\";\n\n\n            document.getElementById(\n                \"email\"\n            ).value =\n                profile.email || \"\";\n\n\n            document.getElementById(\n                \"phone\"\n            ).value =\n                profile.phone || \"\";\n\n\n            document.getElementById(\n                \"license\"\n            ).value =\n                profile.license || \"\";\n\n\n            document.getElementById(\n                \"experience\"\n            ).value =\n                profile.experience || \"\";\n\n\n            document.getElementById(\n                \"address\"\n            ).value =\n                profile.address || \"\";\n\n\n            document.getElementById(\n                \"about\"\n            ).value =\n                profile.about || \"\";\n\n\n            document.getElementById(\n                \"profileName\"\n            ).textContent =\n                profile.fullName;\n\n\n            document.getElementById(\n                \"lastUpdated\"\n            ).textContent =\n                profile.updatedAt || \"Not updated yet\";\n\n        }\n\n\n        /* =========================\n           RESET PROFILE\n        ========================== */\n\n        function resetProfile() {\n\n            const confirmed =\n                confirm(\n                    \"Reset your profile information?\"\n                );\n\n            if (!confirmed) {\n                return;\n            }\n\n            document.getElementById(\n                \"fullName\"\n            ).value =\n                \"Dr. Maria Santos\";\n\n            document.getElementById(\n                \"title\"\n            ).value =\n                \"General Dentist\";\n\n            document.getElementById(\n                \"email\"\n            ).value =\n                \"dr.maria@dentalcare.com\";\n\n            document.getElementById(\n                \"phone\"\n            ).value =\n                \"0917 123 4567\";\n\n            document.getElementById(\n                \"license\"\n            ).value =\n                \"PRC-1234567\";\n\n            document.getElementById(\n                \"experience\"\n            ).value =\n                \"8\";\n\n            document.getElementById(\n                \"address\"\n            ).value =\n                \"DentalCare Clinic, Puerto Princesa City\";\n\n            document.getElementById(\n                \"about\"\n            ).value =\n                \"I am a licensed general dentist dedicated to providing friendly and quality dental care to my patients.\";\n\n        }\n\n\n        /* =========================\n           LOGOUT\n        ========================== */\n\n        function logout() {\n\n            const confirmed =\n                confirm(\n                    \"Are you sure you want to logout?\"\n                );\n\n            if (!confirmed) {\n                return;\n            }\n\n            localStorage.removeItem(\n                \"userEmail\"\n            );\n\n            localStorage.removeItem(\n                \"userRole\"\n            );\n\n            window.location.href =\n                \"dentist-login.html\";\n\n        }\n\n\n        /* =========================\n           ONLINE / OFFLINE\n        ========================== */\n\n        function updateOnlineStatus() {\n\n            const banner =\n                document.getElementById(\n                    \"offlineBanner\"\n                );\n\n            if (navigator.onLine) {\n\n                banner.style.display = \"none\";\n\n            } else {\n\n                banner.style.display = \"block\";\n\n            }\n\n        }\n\n\n        window.addEventListener(\n            \"online\",\n            updateOnlineStatus\n        );\n\n        window.addEventListener(\n            \"offline\",\n            updateOnlineStatus\n        );\n\n        updateOnlineStatus();\n\n\n        /* =========================\n           SERVICE WORKER\n        ========================== */\n\n        if (\"serviceWorker\" in navigator) {\n\n            window.addEventListener(\n                \"load\",\n                function () {\n\n                    navigator.serviceWorker\n                        .register(\"sw.js\")\n                        .then(function () {\n\n                            console.log(\n                                \"Service Worker registered.\"\n                            );\n\n                        })\n                        .catch(function (error) {\n\n                            console.error(\n                                \"Service Worker error:\",\n                                error\n                            );\n\n                        });\n\n                }\n            );\n\n        }\n\n\n        /* LOAD SAVED PROFILE */\n\n        loadProfile();\n\n    ";

function runInline(code, event) {
  try {
    return Function("event", code).call(event.currentTarget, event);
  } catch (error) {
    console.error(error);
  }
}

export default function DentistProfile() {
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
      <style>{"\n\n        * {\n            margin: 0;\n            padding: 0;\n            box-sizing: border-box;\n            font-family: Arial, sans-serif;\n        }\n\n        body {\n            background: #f7f3fc;\n            color: #333;\n        }\n\n        /* SIDEBAR */\n\n        .sidebar {\n            position: fixed;\n            left: 0;\n            top: 0;\n            width: 250px;\n            height: 100vh;\n            background: linear-gradient(180deg, #80609e, #9b7bb8);\n            color: white;\n            padding: 25px 18px;\n            z-index: 1000;\n            transition: 0.3s;\n        }\n\n        .logo {\n            text-align: center;\n            margin-bottom: 30px;\n        }\n\n        .logo-icon {\n            width: 55px;\n            height: 55px;\n            background: white;\n            color: #80609e;\n            border-radius: 50%;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            margin: auto;\n            font-size: 25px;\n        }\n\n        .logo h2 {\n            margin-top: 10px;\n            font-size: 21px;\n        }\n\n        .logo p {\n            font-size: 12px;\n            opacity: 0.85;\n        }\n\n        .nav-menu {\n            list-style: none;\n        }\n\n        .nav-menu li {\n            margin-bottom: 8px;\n        }\n\n        .nav-menu a {\n            display: flex;\n            gap: 12px;\n            align-items: center;\n            padding: 13px 15px;\n            color: white;\n            text-decoration: none;\n            border-radius: 10px;\n            font-size: 14px;\n        }\n\n        .nav-menu a:hover,\n        .nav-menu a.active {\n            background: rgba(255,255,255,0.20);\n        }\n\n        .logout {\n            position: absolute;\n            bottom: 25px;\n            left: 18px;\n            right: 18px;\n        }\n\n        .logout button {\n            width: 100%;\n            padding: 12px;\n            border: 1px solid rgba(255,255,255,0.4);\n            border-radius: 10px;\n            background: transparent;\n            color: white;\n            cursor: pointer;\n        }\n\n        .logout button:hover {\n            background: rgba(255,255,255,0.15);\n        }\n\n        /* MAIN */\n\n        .main {\n            margin-left: 250px;\n            padding: 30px;\n        }\n\n        .topbar {\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            margin-bottom: 25px;\n        }\n\n        .topbar h1 {\n            color: #5f4778;\n            font-size: 27px;\n        }\n\n        .topbar p {\n            color: #777;\n            margin-top: 5px;\n            font-size: 14px;\n        }\n\n        .dentist-info {\n            background: white;\n            padding: 10px 16px;\n            border-radius: 12px;\n            color: #5f4778;\n            font-weight: bold;\n            box-shadow: 0 3px 12px rgba(0,0,0,0.05);\n        }\n\n        /* OFFLINE */\n\n        .offline-banner {\n            display: none;\n            background: #fff3cd;\n            color: #856404;\n            padding: 12px;\n            border-radius: 10px;\n            margin-bottom: 20px;\n            text-align: center;\n        }\n\n        /* PROFILE */\n\n        .profile-container {\n            max-width: 900px;\n            margin: auto;\n        }\n\n        .profile-card {\n            background: white;\n            border-radius: 18px;\n            padding: 30px;\n            box-shadow: 0 4px 18px rgba(0,0,0,0.06);\n        }\n\n        .profile-header {\n            display: flex;\n            align-items: center;\n            gap: 20px;\n            padding-bottom: 25px;\n            border-bottom: 1px solid #eee;\n            margin-bottom: 25px;\n        }\n\n        .profile-avatar {\n            width: 90px;\n            height: 90px;\n            border-radius: 50%;\n            background: #eee7f5;\n            color: #80609e;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-size: 32px;\n            font-weight: bold;\n        }\n\n        .profile-header h2 {\n            color: #4f3d61;\n            font-size: 23px;\n        }\n\n        .profile-header p {\n            color: #888;\n            margin-top: 6px;\n            font-size: 13px;\n        }\n\n        .verified {\n            display: inline-block;\n            margin-top: 8px;\n            background: #e0f2e5;\n            color: #2e7d45;\n            padding: 5px 9px;\n            border-radius: 15px;\n            font-size: 11px;\n            font-weight: bold;\n        }\n\n        /* FORM */\n\n        .section-title {\n            color: #5f4778;\n            font-size: 18px;\n            margin-bottom: 15px;\n        }\n\n        .form-grid {\n            display: grid;\n            grid-template-columns: 1fr 1fr;\n            gap: 16px;\n        }\n\n        .form-group label {\n            display: block;\n            color: #666;\n            font-size: 12px;\n            font-weight: bold;\n            margin-bottom: 6px;\n        }\n\n        .form-group input,\n        .form-group textarea {\n            width: 100%;\n            padding: 12px 13px;\n            border: 1px solid #ddd;\n            border-radius: 9px;\n            outline: none;\n            font-size: 13px;\n        }\n\n        .form-group textarea {\n            min-height: 100px;\n            resize: vertical;\n        }\n\n        .form-group input:focus,\n        .form-group textarea:focus {\n            border-color: #9b7bb8;\n        }\n\n        .full {\n            grid-column: 1 / -1;\n        }\n\n        /* BUTTONS */\n\n        .buttons {\n            display: flex;\n            gap: 10px;\n            margin-top: 22px;\n        }\n\n        .save-btn {\n            border: none;\n            background: #80609e;\n            color: white;\n            padding: 12px 22px;\n            border-radius: 9px;\n            cursor: pointer;\n            font-weight: bold;\n        }\n\n        .save-btn:hover {\n            background: #6d5189;\n        }\n\n        .reset-btn {\n            border: none;\n            background: #eee7f5;\n            color: #604879;\n            padding: 12px 22px;\n            border-radius: 9px;\n            cursor: pointer;\n            font-weight: bold;\n        }\n\n        .reset-btn:hover {\n            background: #e2d5ee;\n        }\n\n        /* ACCOUNT INFO */\n\n        .account-info {\n            margin-top: 20px;\n            background: #faf8fd;\n            border-radius: 12px;\n            padding: 18px;\n        }\n\n        .account-info h3 {\n            color: #5f4778;\n            font-size: 15px;\n            margin-bottom: 10px;\n        }\n\n        .account-info p {\n            color: #777;\n            font-size: 13px;\n            margin-bottom: 5px;\n        }\n\n        /* MOBILE */\n\n        .menu-btn {\n            display: none;\n            border: none;\n            background: #80609e;\n            color: white;\n            width: 42px;\n            height: 42px;\n            border-radius: 9px;\n            cursor: pointer;\n            font-size: 20px;\n        }\n\n        .close-btn {\n            display: none;\n        }\n\n        @media (max-width: 768px) {\n\n            .sidebar {\n                left: -270px;\n            }\n\n            .sidebar.show {\n                left: 0;\n            }\n\n            .main {\n                margin-left: 0;\n                padding: 20px;\n            }\n\n            .menu-btn {\n                display: block;\n            }\n\n            .close-btn {\n                display: block;\n                position: absolute;\n                top: 15px;\n                right: 15px;\n                background: transparent;\n                border: none;\n                color: white;\n                font-size: 22px;\n                cursor: pointer;\n            }\n\n            .dentist-info {\n                display: none;\n            }\n        }\n\n        @media (max-width: 600px) {\n\n            .profile-card {\n                padding: 20px;\n            }\n\n            .profile-header {\n                flex-direction: column;\n                text-align: center;\n            }\n\n            .form-grid {\n                grid-template-columns: 1fr;\n            }\n\n            .full {\n                grid-column: auto;\n            }\n\n            .buttons {\n                flex-direction: column;\n            }\n\n            .save-btn,\n            .reset-btn {\n                width: 100%;\n            }\n\n            .topbar h1 {\n                font-size: 22px;\n            }\n        }\n\n    "}</style>
        <Sidebar role="dentist" active="profile" />
  <main className="main">
    <div className="offline-banner" id="offlineBanner">
            ⚠️ You are currently offline.
            Your changes will be saved on this device.
        </div>

    <div className="topbar">
      <div style={{display: "flex", alignItems: "center", gap: "15px"}}>
        <button className="menu-btn" onClick={(event) => runInline("openSidebar()", event)}>
                    ☰
                </button>
        <div>
          <h1>My Profile</h1>
          <p>
                        Manage your dentist account information.
                    </p>
</div>
</div>
      <div className="dentist-info">
                👩‍⚕️ Dr. Maria Santos
            </div>
</div>

    <div className="profile-container">
      <section className="profile-card">

        <div className="profile-header">
          <div className="profile-avatar" id="profileAvatar">
                        MS
                    </div>
          <div>
            <h2 id="profileName">
                            Dr. Maria Santos
                        </h2>
            <p>
                            General Dentist
                        </p>
            <span className="verified">
                            ✓ Verified Dentist
                        </span>
</div>
</div>

        <h3 className="section-title">
                    Personal Information
                </h3>
        <div className="form-grid">
          <div className="form-group">
            <label>
                            Full Name
                        </label>
            <input type="text" id="fullName" value="Dr. Maria Santos" />
</div>
          <div className="form-group">
            <label>
                            Professional Title
                        </label>
            <input type="text" id="title" value="General Dentist" />
</div>
          <div className="form-group">
            <label>
                            Email Address
                        </label>
            <input type="email" id="email" value="dr.maria@dentalcare.com" />
</div>
          <div className="form-group">
            <label>
                            Phone Number
                        </label>
            <input type="text" id="phone" value="0917 123 4567" />
</div>
          <div className="form-group">
            <label>
                            License Number
                        </label>
            <input type="text" id="license" value="PRC-1234567" />
</div>
          <div className="form-group">
            <label>
                            Years of Experience
                        </label>
            <input type="number" id="experience" value="8" />
</div>
          <div className="form-group full">
            <label>
                            Clinic Address
                        </label>
            <input type="text" id="address" value="DentalCare Clinic, Puerto Princesa City" />
</div>
          <div className="form-group full">
            <label>
                            About Me
                        </label>
            <textarea id="about">I am a licensed general dentist dedicated to providing friendly and quality dental care to my patients.</textarea>
</div>
</div>

        <div className="buttons">
          <button className="save-btn" onClick={(event) => runInline("saveProfile()", event)}>
                        💾 Save Changes
                    </button>
          <button className="reset-btn" onClick={(event) => runInline("resetProfile()", event)}>
                        ↩ Reset
                    </button>
</div>

        <div className="account-info">
          <h3>
                        Account Information
                    </h3>
          <p>
            <strong>Account Type:</strong>
                        Dentist
                    </p>
          <p>
            <strong>Account Status:</strong>
                        Active
                    </p>
          <p>
            <strong>Last Updated:</strong>
            <span id="lastUpdated">
                            Not updated yet
                        </span>
</p>
</div>
</section>
</div>
</main>
    </>
  );
}
