import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.backgroundColor = "#f3efff";

    return () => {
      document.body.style.margin = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  const goTo = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo(0, 0);
  };

  return (
    <>
      <style>{`
        /* =========================================
           GENERAL
        ========================================= */

        * {
          box-sizing: border-box;
        }

        .landing-page {
          min-height: 100vh;

          background:
            radial-gradient(
              circle at 85% 15%,
              rgba(155, 123, 184, 0.18),
              transparent 28%
            ),
            radial-gradient(
              circle at 10% 85%,
              rgba(155, 123, 184, 0.12),
              transparent 25%
            ),
            linear-gradient(
              135deg,
              #f3efff,
              #eee7ff,
              #faf8ff
            );

          color: #51485c;
          overflow-x: hidden;
        }

        /* =========================================
           ANIMATIONS
        ========================================= */

        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-25px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(35px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeLeft {
          from {
            opacity: 0;
            transform: translateX(-45px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeRight {
          from {
            opacity: 0;
            transform: translateX(45px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes floating {
          0% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-10px);
          }

          100% {
            transform: translateY(0);
          }
        }

        @keyframes softPulse {
          0% {
            box-shadow:
              0 8px 25px rgba(123, 97, 168, 0.16),
              0 0 0 8px rgba(155, 123, 184, 0.08);
          }

          50% {
            box-shadow:
              0 12px 30px rgba(123, 97, 168, 0.22),
              0 0 0 12px rgba(155, 123, 184, 0.05);
          }

          100% {
            box-shadow:
              0 8px 25px rgba(123, 97, 168, 0.16),
              0 0 0 8px rgba(155, 123, 184, 0.08);
          }
        }

        @keyframes badgePulse {
          0% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.03);
          }

          100% {
            transform: scale(1);
          }
        }

        /* =========================================
           NAVBAR
        ========================================= */

        .landing-navbar {
          padding: 18px 6%;
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(216, 204, 236, 0.7);

          animation: fadeDown 0.8s ease-out;
        }

        .landing-logo {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 50%;

          box-shadow:
            0 5px 15px rgba(123, 97, 168, 0.18);

          transition: transform 0.3s ease;
        }

        .landing-logo:hover {
          transform: rotate(-8deg) scale(1.08);
        }

        .brand-name {
          color: #80609e;
          font-size: 22px;
          font-weight: 700;
        }

        .landing-nav-buttons {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        /* =========================================
           HERO
        ========================================= */

        .hero-section {
          min-height: calc(100vh - 85px);

          display: flex;
          align-items: center;

          padding: 60px 6%;
        }

        .hero-section .col-lg-7 {
          animation: fadeLeft 0.9s ease-out;
        }

        .hero-section .col-lg-5 {
          animation: fadeRight 0.9s ease-out;
        }

        .hero-title {
          color: #6f5290;

          font-size: clamp(38px, 5vw, 64px);

          font-weight: 800;
          line-height: 1.1;

          animation:
            fadeUp 1s ease-out 0.15s both;
        }

        .hero-title span {
          color: #9b7bb8;
        }

        .hero-text {
          color: #756b80;

          font-size: 17px;
          line-height: 1.7;

          max-width: 560px;

          animation:
            fadeUp 1s ease-out 0.3s both;
        }

        /* =========================================
           BADGE
        ========================================= */

        .hero-badge {
          display: inline-block;

          animation:
            fadeUp 0.8s ease-out both,
            badgePulse 3s ease-in-out 1.2s infinite;
        }

        /* =========================================
           BUTTONS
        ========================================= */

        .btn-primary-custom {
          background: #9b7bb8;
          color: white;

          border: none;
          border-radius: 50px;

          padding: 12px 28px;

          font-weight: 600;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .btn-primary-custom:hover {
          background: #80609e;
          color: white;

          transform: translateY(-4px);

          box-shadow:
            0 10px 22px rgba(123, 97, 168, 0.25);
        }

        .btn-primary-custom:active {
          transform: translateY(-1px);
        }

        .btn-outline-custom {
          background: white;
          color: #80609e;

          border: 1px solid #9b7bb8;
          border-radius: 50px;

          padding: 12px 28px;

          font-weight: 600;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .btn-outline-custom:hover {
          background: #9b7bb8;
          color: white;

          transform: translateY(-4px);

          box-shadow:
            0 10px 22px rgba(123, 97, 168, 0.20);
        }

        .btn-outline-custom:active {
          transform: translateY(-1px);
        }

        /* =========================================
           HERO CARD
        ========================================= */

        .hero-card {
          position: relative;

          background: rgba(255, 255, 255, 0.78);

          border: 1px solid rgba(255, 255, 255, 0.8);

          border-radius: 35px;

          padding: 35px;

          box-shadow:
            0 20px 50px rgba(123, 97, 168, 0.16);

          animation:
            fadeRight 1s ease-out,
            floating 5s ease-in-out 1.2s infinite;

          transition:
            box-shadow 0.3s ease;
        }

        .hero-card:hover {
          box-shadow:
            0 25px 60px rgba(123, 97, 168, 0.22);
        }

        /* =========================================
           SMILE IMAGE
        ========================================= */

        .smile-image-container {
          width: 130px;
          height: 130px;

          margin: 0 auto 22px;

          padding: 5px;

          border-radius: 50%;

          background: #ffffff;

          display: flex;
          align-items: center;
          justify-content: center;

          box-shadow:
            0 8px 25px rgba(123, 97, 168, 0.16),
            0 0 0 8px rgba(155, 123, 184, 0.08);

          animation:
            fadeUp 1s ease-out 0.5s both,
            softPulse 3s ease-in-out 1.5s infinite;
        }

        .smile-icon {
          width: 120px;
          height: 120px;

          display: block;

          object-fit: cover;
          object-position: center;

          border-radius: 50%;

          transition:
            transform 0.4s ease,
            filter 0.4s ease;
        }

        .smile-image-container:hover .smile-icon {
          transform: scale(1.06);

          filter: brightness(1.04);
        }

        /* =========================================
           HERO CARD TITLE
        ========================================= */

        .hero-card-title {
          color: #6f5290;

          font-weight: 700;
          font-size: 28px;

          animation:
            fadeUp 0.9s ease-out 0.65s both;
        }

        .hero-card > p {
          animation:
            fadeUp 0.9s ease-out 0.8s both;
        }

        /* =========================================
           HERO CARD FEATURES
        ========================================= */

        .hero-card .row {
          animation:
            fadeUp 0.9s ease-out 0.95s both;
        }

        .hero-card .col-4 {
          transition:
            transform 0.3s ease;
        }

        .hero-card .col-4:hover {
          transform: translateY(-6px);
        }

        .hero-card .col-4 i,
        .hero-card .dental-symbol {
          transition:
            transform 0.3s ease;
        }

        .hero-card .col-4:hover i,
        .hero-card .col-4:hover .dental-symbol {
          transform: scale(1.15);
        }

        /* =========================================
           DENTAL SYMBOL
        ========================================= */

        .dental-symbol {
          display: inline-block;

          font-size: 29px;
          line-height: 1;

          margin-bottom: 2px;

          filter:
            drop-shadow(
              0 3px 5px rgba(123, 97, 168, 0.15)
            );
        }

        /* =========================================
           FEATURES SECTION
        ========================================= */

        .feature-section {
          padding: 70px 6%;

          background: rgba(255, 255, 255, 0.45);
        }

        .section-title {
          color: #6f5290;

          font-weight: 700;

          animation:
            fadeUp 0.9s ease-out;
        }

        .feature-section .text-center > p {
          animation:
            fadeUp 0.9s ease-out 0.15s both;
        }

        .feature-card {
          height: 100%;

          padding: 28px;

          background: rgba(255, 255, 255, 0.82);

          border: 1px solid #e2d9ed;

          border-radius: 22px;

          box-shadow:
            0 8px 25px rgba(123, 97, 168, 0.08);

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-8px);

          box-shadow:
            0 18px 35px rgba(123, 97, 168, 0.16);
        }

        /* =========================================
           STAGGERED FEATURE ANIMATION
        ========================================= */

        .feature-section .col-md-4:nth-child(1) .feature-card {
          animation:
            fadeUp 0.8s ease-out 0.2s both;
        }

        .feature-section .col-md-4:nth-child(2) .feature-card {
          animation:
            fadeUp 0.8s ease-out 0.4s both;
        }

        .feature-section .col-md-4:nth-child(3) .feature-card {
          animation:
            fadeUp 0.8s ease-out 0.6s both;
        }

        /* =========================================
           FEATURE ICONS
        ========================================= */

        .feature-icon {
          width: 55px;
          height: 55px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 15px;

          background: #eee5f8;
          color: #80609e;

          font-size: 25px;

          margin-bottom: 18px;

          transition:
            transform 0.3s ease,
            background 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          transform:
            rotate(-5deg)
            scale(1.1);

          background: #e4d5f2;
        }

        /* Actual tooth symbol */

        .feature-dental-symbol {
          font-size: 27px;
          line-height: 1;
        }

        /* =========================================
           FEATURE TEXT
        ========================================= */

        .feature-title {
          color: #655a70;

          font-weight: 700;
        }

        .feature-text {
          color: #81778a;

          line-height: 1.6;

          font-size: 14px;
        }

        /* =========================================
           FOOTER
        ========================================= */

        .landing-footer {
          padding: 25px 6%;

          text-align: center;

          color: #8c8499;

          font-size: 14px;

          background: rgba(255, 255, 255, 0.65);

          animation:
            fadeUp 0.8s ease-out;
        }

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 767px) {

          .landing-navbar {
            padding: 15px 5%;
          }

          .hero-section {
            min-height: auto;

            padding: 55px 5%;
          }

          .hero-title {
            font-size: 40px;
          }

          .hero-text {
            font-size: 15px;
          }

          .hero-card {
            margin-top: 35px;

            padding: 28px 20px;

            animation:
              fadeUp 1s ease-out,
              floating 5s ease-in-out 1.2s infinite;
          }

          .landing-nav-buttons {
            width: 100%;

            margin-top: 15px;
          }

          .smile-image-container {
            width: 110px;
            height: 110px;

            margin-bottom: 20px;
          }

          .smile-icon {
            width: 100px;
            height: 100px;
          }

          .hero-card-title {
            font-size: 24px;
          }

          .dental-symbol {
            font-size: 26px;
          }

          .feature-dental-symbol {
            font-size: 24px;
          }
        }

        /* =========================================
           ACCESSIBILITY
        ========================================= */

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;

            animation-iteration-count: 1 !important;

            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="landing-page">

        {/* =========================================
            NAVBAR
        ========================================= */}

        <nav className="landing-navbar">

          <div className="container-fluid">

            <div className="d-flex align-items-center justify-content-between flex-wrap">

              {/* LOGO */}

              <div className="d-flex align-items-center gap-2">

                <img
                  src="/images.jfif"
                  alt="DentalCare Logo"
                  className="landing-logo"
                />

                <span className="brand-name">
                  DentalCare
                </span>

              </div>

              {/* NAV BUTTONS */}

              <div className="landing-nav-buttons">

                <button
                  className="btn btn-outline-custom"
                  onClick={() => goTo("/login")}
                >
                  Login
                </button>

                <button
                  className="btn btn-primary-custom"
                  onClick={() => goTo("/register")}
                >
                  Register
                </button>

              </div>

            </div>

          </div>

        </nav>

        {/* =========================================
            HERO SECTION
        ========================================= */}

        <section className="hero-section">

          <div className="container-fluid">

            <div className="row align-items-center g-5">

              {/* =====================================
                  LEFT SIDE
              ===================================== */}

              <div className="col-lg-7">

                <div className="mb-3">

                  <span
                    className="badge rounded-pill px-3 py-2 hero-badge"
                    style={{
                      backgroundColor: "#e9def5",
                      color: "#80609e"
                    }}
                  >

                    <i className="bi bi-heart-pulse me-2"></i>

                    Simple and convenient dental care

                  </span>

                </div>

                <h1 className="hero-title mb-4">

                  Your smile deserves

                  <br />

                  <span>
                    better care.
                  </span>

                </h1>

                <p className="hero-text mb-4">

                  Welcome to DentalCare, a simple dental appointment
                  system that helps patients manage appointments,
                  dental records, and services in one convenient place.

                </p>

                {/* BUTTONS */}

                <div
                  className="d-flex flex-wrap gap-3"
                  style={{
                    animation:
                      "fadeUp 1s ease-out 0.45s both"
                  }}
                >

                  <button
                    className="btn btn-primary-custom"
                    onClick={() => goTo("/login")}
                  >

                    <i className="bi bi-calendar-check me-2"></i>

                    Get Started

                  </button>

                  <button
                    className="btn btn-outline-custom"
                    onClick={() => goTo("/register")}
                  >

                    <i className="bi bi-person-plus me-2"></i>

                    Create Account

                  </button>

                </div>

              </div>

              {/* =====================================
                  RIGHT SIDE
              ===================================== */}

              <div className="col-lg-5">

                <div className="hero-card text-center">

                  {/* SMILE IMAGE */}

                  <div className="smile-image-container">

                    <img
                      src="/smile.jpg"
                      alt="DentalCare Smile"
                      className="smile-icon"
                    />

                  </div>

                  {/* TITLE */}

                  <h3 className="hero-card-title mb-3">

                    Take care of your smile

                  </h3>

                  {/* DESCRIPTION */}

                  <p className="text-secondary mb-4">

                    Manage your dental appointments and records easily
                    with DentalCare.

                  </p>

                  {/* =================================
                      HERO CARD SERVICES
                  ================================= */}

                  <div className="row g-3">

                    {/* APPOINTMENTS */}

                    <div className="col-4">

                      <div className="p-2">

                        <i
                          className="bi bi-calendar2-check fs-3"
                          style={{
                            color: "#9b7bb8"
                          }}
                        ></i>

                        <div className="small mt-2">
                          Appointments
                        </div>

                      </div>

                    </div>

                    {/* RECORDS */}

                    <div className="col-4">

                      <div className="p-2">

                        <i
                          className="bi bi-file-medical fs-3"
                          style={{
                            color: "#9b7bb8"
                          }}
                        ></i>

                        <div className="small mt-2">
                          Records
                        </div>

                      </div>

                    </div>

                    {/* SERVICES */}

                    <div className="col-4">

                      <div className="p-2">

                        {/* TOOTH SYMBOL */}

                        <span className="dental-symbol">
                          🦷
                        </span>

                        <div className="small mt-2">
                          Services
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =========================================
            FEATURES SECTION
        ========================================= */}

        <section className="feature-section">

          <div className="container">

            {/* SECTION TITLE */}

            <div className="text-center mb-5">

              <h2 className="section-title">

                Everything you need in one place

              </h2>

              <p className="text-secondary">

                DentalCare makes managing dental care
                easier and more organized.

              </p>

            </div>

            <div className="row g-4">

              {/* =====================================
                  EASY APPOINTMENTS
              ===================================== */}

              <div className="col-md-4">

                <div className="feature-card">

                  <div className="feature-icon">

                    <i className="bi bi-calendar-check"></i>

                  </div>

                  <h5 className="feature-title">

                    Easy Appointments

                  </h5>

                  <p className="feature-text mb-0">

                    Book and manage your dental appointments
                    without complicated steps.

                  </p>

                </div>

              </div>

              {/* =====================================
                  DENTAL RECORDS
              ===================================== */}

              <div className="col-md-4">

                <div className="feature-card">

                  <div className="feature-icon">

                    <i className="bi bi-file-medical"></i>

                  </div>

                  <h5 className="feature-title">

                    Dental Records

                  </h5>

                  <p className="feature-text mb-0">

                    Keep important dental information organized
                    and easy to access.

                  </p>

                </div>

              </div>

              {/* =====================================
                  DENTAL SERVICES
              ===================================== */}

              <div className="col-md-4">

                <div className="feature-card">

                  <div className="feature-icon">

                    <span className="feature-dental-symbol">
                      🦷
                    </span>

                  </div>

                  <h5 className="feature-title">

                    Dental Services

                  </h5>

                  <p className="feature-text mb-0">

                    View available dental services and learn more
                    about the care you can receive.

                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =========================================
            FOOTER
        ========================================= */}

        <footer className="landing-footer">

          <div>

            © 2026 DentalCare Dental Appointment System

          </div>

        </footer>

      </div>
    </>
  );
}