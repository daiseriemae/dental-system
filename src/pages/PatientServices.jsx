import { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";

const services = [
  {
    name: "Dental Check-up",
    image: "/what-to-expect-dental-checkup-facts.jpg",
    icon: "🦷",
    description: "Regular examination of your teeth and gums to maintain good oral health.",
    price: "₱500",
    unit: "/ visit",
  },
  {
    name: "Teeth Cleaning",
    image: "/dentist-cleaning-teeth.jpeg",
    icon: "✨",
    description: "Professional cleaning to remove plaque and maintain healthy teeth.",
    price: "₱800",
    unit: "/ session",
  },
  {
    name: "Dental Filling",
    image: "/tooth-filling.webp",
    icon: "🦷",
    description: "Treatment for cavities and damaged teeth using appropriate filling materials.",
    price: "₱1,200",
    unit: "/ tooth",
  },
  {
    name: "Teeth Whitening",
    image: "/teeth-whitening.webp",
    icon: "✨",
    description: "Cosmetic treatment designed to brighten and improve the appearance of teeth.",
    price: "₱2,500",
    unit: "/ session",
  },
  {
    name: "Tooth Extraction",
    image: "/extraction.jpg",
    icon: "🩹",
    description: "Removal of a tooth when necessary following professional dental assessment.",
    price: "₱1,500",
    unit: "/ tooth",
  },
  {
    name: "Braces Consultation",
    image: "/brace.jfif",
    icon: "😁",
    description: "Initial consultation and assessment for patients considering orthodontic treatment.",
    price: "₱600",
    unit: "/ consultation",
  },
];

export default function PatientServices() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", registerServiceWorker, { once: true });
    }
    function registerServiceWorker() {
      navigator.serviceWorker.register("/sw.js").then(() => {
        console.log("Service Worker registered successfully.");
      }).catch((error) => {
        console.warn("Service Worker registration failed:", error);
      });
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      window.removeEventListener("load", registerServiceWorker);
    };
  }, []);

  function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      sidebar.classList.toggle("open");
      sidebar.classList.toggle("show");
    }
  }

  function appointmentLink(serviceName) {
    const params = new URLSearchParams({ service: serviceName, serviceName });
    return `/patient/appointment?${params.toString()}`;
  }

  return (
    <>
      <style>{`
        .patient-services-page { min-height: 100vh; background: #f7f4fb; color: #4f3d63; font-family: Arial, sans-serif; }
        .patient-services-page * { box-sizing: border-box; }
        .patient-services-page .main { margin-left: 250px; min-height: 100vh; }
        .patient-services-page .topbar { height: 75px; background: #fff; display: flex; align-items: center; padding: 0 35px; border-bottom: 1px solid #e6dff0; }
        .patient-services-page .topbar h1 { margin: 0; font-size: 24px; color: #4f3d63; }
        .patient-services-page .content { padding: 30px; }
        .patient-services-page .intro { margin-bottom: 25px; }
        .patient-services-page .intro h2 { font-size: 28px; margin: 0 0 7px; color: #4f3d63; }
        .patient-services-page .intro p { color: #7d7188; margin: 0; }
        .patient-services-page .services { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; max-width: 1100px; }
        .patient-services-page .service-card { min-width: 0; background: #fff; padding: 25px; border-radius: 17px; box-shadow: 0 5px 20px rgba(79,61,99,.08); transition: .2s; display: flex; flex-direction: column; }
        .patient-services-page .service-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(79,61,99,.12); }
        .patient-services-page .service-image { width: 100%; height: 180px; object-fit: cover; border-radius: 14px; margin-bottom: 15px; }
        .patient-services-page .service-icon { width: 55px; height: 55px; flex: 0 0 55px; background: #f3efff; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 27px; margin-bottom: 15px; }
        .patient-services-page .service-card h3 { margin: 0 0 10px; font-size: 20px; color: #4f3d63; }
        .patient-services-page .service-card p { color: #766b80; line-height: 1.5; font-size: 14px; margin: 0 0 15px; }
        .patient-services-page .service-price { color: #80609e; font-size: 20px; font-weight: bold; margin-bottom: 18px; }
        .patient-services-page .service-price span { font-size: 13px; color: #8c8499; font-weight: normal; }
        .patient-services-page .book-btn { display: inline-block; text-decoration: none; text-align: center; background: #9b7bb8; color: #fff; padding: 10px 15px; border-radius: 9px; font-size: 14px; transition: .2s; margin-top: auto; }
        .patient-services-page .book-btn:hover { background: #80609e; color: #fff; }
        .patient-services-page .offline { background: #fff3cd; color: #725b00; padding: 10px; text-align: center; font-size: 14px; }
        .patient-services-page .mobile-header { display: none; }
        @media (max-width: 1100px) { .patient-services-page .services { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 768px) {
          .patient-services-page .main { margin-left: 0; }
          .patient-services-page .mobile-header { display: flex; height: 65px; background: #9b7bb8; color: #fff; align-items: center; padding: 0 18px; gap: 15px; }
          .patient-services-page .menu-btn { border: none; background: transparent; color: #fff; font-size: 25px; cursor: pointer; }
          .patient-services-page .topbar { display: none; }
          .patient-services-page .content { padding: 20px; }
          .patient-services-page .services { grid-template-columns: 1fr; }
          .patient-services-page .intro h2 { font-size: 24px; }
        }
        @media (max-width: 400px) { .patient-services-page .content { padding: 15px; } .patient-services-page .service-card { padding: 20px; } .patient-services-page .service-card h3 { font-size: 18px; } }
      `}</style>

      <div className="patient-services-page">
        <Sidebar role="patient" active="services" />
        <div className="main">
          <div className="mobile-header">
            <button type="button" className="menu-btn" aria-label="Toggle sidebar" onClick={toggleSidebar}>☰</button>
            <strong>DentalCare</strong>
          </div>
          <header className="topbar"><h1>Dental Services</h1></header>
          {isOffline && <div className="offline" role="status">You are currently offline.</div>}
          <main className="content">
            <div className="intro">
              <h2>Our Dental Services</h2>
              <p>Choose a dental service that you need.</p>
            </div>
            <div className="services">
              {services.map((service) => (
                <article className="service-card" key={service.name}>
                  <img className="service-image" src={service.image} alt={service.name} />
                  <div className="service-icon" aria-hidden="true">{service.icon}</div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-price">{service.price} <span>{service.unit}</span></div>
                  <a href={appointmentLink(service.name)} className="book-btn">Book Appointment</a>
                </article>
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
