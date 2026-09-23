import { useEffect } from "react";
import Sidebar from "./Sidebar.jsx";

const pageScript = String.raw`


        /* =====================================
           LOGOUT
        ===================================== */

        function logout() {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (confirmLogout) {

                localStorage.removeItem(
                    "userEmail"
                );

                localStorage.removeItem(
                    "userRole"
                );

                localStorage.removeItem(
                    "dentalCareUser"
                );


                window.location.href =
                    "../loginpage.html";

            }

        }



        /* =====================================
           MOBILE SIDEBAR
        ===================================== */

        function toggleSidebar() {

            document
                .getElementById("sidebar")
                .classList
                .toggle("open");

        }



        /* =====================================
           ONLINE / OFFLINE STATUS
        ===================================== */

        function updateOnlineStatus() {

            const message =
                document.getElementById(
                    "offlineMessage"
                );


            if (navigator.onLine) {

                message.style.display =
                    "none";

            }

            else {

                message.style.display =
                    "block";

            }

        }



        /* =====================================
           ONLINE EVENT
        ===================================== */

        window.addEventListener(
            "online",
            updateOnlineStatus
        );



        /* =====================================
           OFFLINE EVENT
        ===================================== */

        window.addEventListener(
            "offline",
            updateOnlineStatus
        );



        /* =====================================
           INITIAL STATUS
        ===================================== */

        updateOnlineStatus();



        /* =====================================
           SERVICE WORKER
        ===================================== */

        if ("serviceWorker" in navigator) {

            window.addEventListener(
                "load",
                function() {

                    navigator.serviceWorker
                        .register("../sw.js")
                        .then(function() {

                            console.log(
                                "Service Worker registered successfully."
                            );

                        })
                        .catch(function(error) {

                            console.log(
                                "Service Worker registration failed:",
                                error
                            );

                        });

                }
            );

        }

    `;

function runInline(code, event) {
  try {
    return Function("event", code).call(event.currentTarget, event);
  } catch (error) {
    console.error(error);
  }
}

export default function PatientServices() {
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
      <style>{String.raw`

        /* =====================================
           BASIC RESET
        ===================================== */

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }


        /* =====================================
           BODY
        ===================================== */

        body {
            font-family: Arial, sans-serif;
            background: #f7f4fb;
            color: #4f3d63;
        }


        /* =====================================
           SIDEBAR
        ===================================== */

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


        /* =====================================
           LOGO
        ===================================== */

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
        }


        .logo h2 {
            margin-top: 10px;
        }


        .logo p {
            font-size: 12px;
            opacity: .85;
        }


        /* =====================================
           NAVIGATION
        ===================================== */

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


        /* =====================================
           LOGOUT BUTTON
        ===================================== */

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

            transition: .2s;
        }


        .logout:hover {
            background: rgba(255,255,255,.25);
        }


        /* =====================================
           MAIN CONTENT
        ===================================== */

        .main {
            margin-left: 250px;

            min-height: 100vh;
        }


        /* =====================================
           TOP BAR
        ===================================== */

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


        /* =====================================
           CONTENT
        ===================================== */

        .content {
            padding: 30px;
        }


        /* =====================================
           INTRODUCTION
        ===================================== */

        .intro {
            margin-bottom: 25px;
        }


        .intro h2 {
            font-size: 28px;
            margin-bottom: 7px;
        }


        .intro p {
            color: #7d7188;
        }


        /* =====================================
           SERVICES GRID
        ===================================== */

        .services {
            display: grid;

            grid-template-columns:
                repeat(3, 1fr);

            gap: 20px;

            max-width: 1100px;
        }


        /* =====================================
           SERVICE CARD
        ===================================== */

        .service-card {
            background: white;

            padding: 25px;

            border-radius: 17px;

            box-shadow:
                0 5px 20px
                rgba(79,61,99,.08);

            transition: .2s;

            display: flex;
            flex-direction: column;
        }


        .service-card:hover {
            transform: translateY(-3px);

            box-shadow:
                0 8px 25px
                rgba(79,61,99,.12);
        }


        /* =====================================
           SERVICE ICON
        ===================================== */


        .service-image {
            width: 100%;
            height: 180px;
            object-fit: cover;
            border-radius: 14px;
            margin-bottom: 15px;
        }

        .service-icon {
            width: 55px;
            height: 55px;

            background: #f3efff;

            border-radius: 14px;

            display: flex;

            align-items: center;
            justify-content: center;

            font-size: 27px;

            margin-bottom: 15px;
        }


        /* =====================================
           SERVICE TITLE
        ===================================== */

        .service-card h3 {
            margin-bottom: 10px;

            font-size: 20px;

            color: #4f3d63;
        }


        /* =====================================
           SERVICE DESCRIPTION
        ===================================== */

        .service-card p {
            color: #766b80;

            line-height: 1.5;

            font-size: 14px;

            margin-bottom: 15px;
        }


        /* =====================================
           SERVICE PRICE
        ===================================== */

        .service-price {
            color: #80609e;

            font-size: 20px;

            font-weight: bold;

            margin-bottom: 18px;
        }


        .service-price span {
            font-size: 13px;

            color: #8c8499;

            font-weight: normal;
        }


        /* =====================================
           BOOK APPOINTMENT BUTTON
        ===================================== */

        .book-btn {
            display: inline-block;

            text-decoration: none;

            text-align: center;

            background: #9b7bb8;

            color: white;

            padding: 10px 15px;

            border-radius: 9px;

            font-size: 14px;

            transition: .2s;

            margin-top: auto;
        }


        .book-btn:hover {
            background: #80609e;

            color: white;
        }


        /* =====================================
           OFFLINE MESSAGE
        ===================================== */

        .offline {
            display: none;

            background: #fff3cd;

            color: #725b00;

            padding: 10px;

            text-align: center;

            font-size: 14px;
        }


        /* =====================================
           MOBILE HEADER
        ===================================== */

        .mobile-header {
            display: none;
        }


        /* =====================================
           TABLET
        ===================================== */

        @media (max-width: 950px) {

            .services {
                grid-template-columns:
                    repeat(2, 1fr);
            }

        }


        /* =====================================
           MOBILE
        ===================================== */

        @media (max-width: 768px) {

            .sidebar {

                width: 220px;

                transform:
                    translateX(-100%);

                transition: .3s;

            }


            .sidebar.open {
                transform:
                    translateX(0);
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


            .services {
                grid-template-columns: 1fr;
            }


            .intro h2 {
                font-size: 24px;
            }

        }


        /* =====================================
           SMALL MOBILE
        ===================================== */

        @media (max-width: 400px) {

            .content {
                padding: 15px;
            }


            .service-card {
                padding: 20px;
            }


            .service-card h3 {
                font-size: 18px;
            }

        }

    `}</style>
        <Sidebar role="patient" active="services" />
  <div className="main">

    <div className="mobile-header">
      <button className="menu-btn" onClick={(event) => runInline("toggleSidebar()", event)}>

                ☰

            </button>
      <strong>
                DentalCare
            </strong>
</div>

    <div className="topbar">
      <h1>
                Dental Services
            </h1>
</div>

    <div className="offline" id="offlineMessage">

            You are currently offline.

        </div>

    <div className="content">

      <div className="intro">
        <h2>
                    Our Dental Services
                </h2>
        <p>
                    Choose a dental service that you need.
                </p>
</div>

      <div className="services">

        <div className="service-card">
        <img className="service-image" src="/what-to-expect-dental-checkup-facts.jpg" alt="Dental Check-up" />
          <div className="service-icon">
                        🦷
                    </div>
          <h3>
                        Dental Check-up
                    </h3>
          <p>
                        Regular examination of your
                        teeth and gums to maintain
                        good oral health.
                    </p>
          <div className="service-price">
                        ₱500
                                    <span>
                            / visit
                        </span>
</div>
          <a href="/patient/appointment" className="book-btn">

                        Book Appointment

                    </a>
</div>

        <div className="service-card">
        <img className="service-image" src="/dentist-cleaning-teeth.jpeg" alt="Teeth Cleaning" />
          <div className="service-icon">
                        ✨
                    </div>
          <h3>
                        Teeth Cleaning
                    </h3>
          <p>
                        Professional cleaning to remove
                        plaque and maintain healthy teeth.
                    </p>
          <div className="service-price">
                        ₱800
                                    <span>
                            / session
                        </span>
</div>
          <a href="/patient/appointment" className="book-btn">

                        Book Appointment

                    </a>
</div>

        <div className="service-card">
        <img className="service-image" src="/tooth-filling.webp" alt="Dental Filling" />
          <div className="service-icon">
                        🦷
                    </div>
          <h3>
                        Dental Filling
                    </h3>
          <p>
                        Treatment for cavities and
                        damaged teeth using appropriate
                        filling materials.
                    </p>
          <div className="service-price">
                        ₱1,200
                                    <span>
                            / tooth
                        </span>
</div>
          <a href="/patient/appointment" className="book-btn">

                        Book Appointment

                    </a>
</div>

<div className="service-card">
        <img className="service-image" src="/teeth-whitening.webp" alt="Teeth Whitening" />
          <div className="service-icon">
                        ✨
                    </div>
          <h3>
                       Teeth Whitening
                    </h3>
          <p>
                    Cosmetic treatment designed to brighten
                    and improve the appearance of teeth.
                    </p>
          <div className="service-price">
                        ₱2,500
                                    <span>
                            / session
                        </span>
</div>
          <a href="/patient/appointment" className="book-btn">

                        Book Appointment

                    </a>
</div>

        <div className="service-card">
        <img className="service-image" src="/extraction.jpg" alt="Tooth Extraction" />
          <div className="service-icon">
                        🩹
                    </div>
          <h3>
                        Tooth Extraction
                    </h3>
          <p>
                        Removal of a tooth when necessary
                        following professional dental
                        assessment.
                    </p>
          <div className="service-price">
                        ₱1,500
                                    <span>
                            / tooth
                        </span>
</div>
          <a href="/patient/appointment" className="book-btn">

                        Book Appointment

                    </a>
</div>

        <div className="service-card">
        <img className="service-image" src="/brace.jfif" alt="Braces Consultation" />
          <div className="service-icon">
                        😁
                    </div>
          <h3>
                        Braces Consultation
                    </h3>
          <p>
                        Initial consultation and assessment for 
                        patients considering orthodontic treatment.
                    </p>
          <div className="service-price">
                        ₱600
                                    <span>
                            / consultation
                        </span>
</div>
          <a href="/patient/appointment" className="book-btn">

                        Book Appointment

                    </a>
</div>
</div>
</div>
</div>
    </>
  );
}
