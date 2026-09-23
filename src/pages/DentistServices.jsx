import { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";

const API_URL = "http://localhost:8080/api/services";

const serviceImages = {
    "Dental Cleaning": "/dentist-cleaning-teeth.jpeg",
    "Dental Check-up": "/what-to-expect-dental-checkup-facts.jpg",
    "Dental Filling": "/tooth-filling.webp",
    "Teeth Whitening": "/teeth-whitening.webp",
    "Tooth Extraction": "/extraction.jpg",
    "Braces Consultation": "/brace.jfif"
};

export default function DentistServices() {
    const [services, setServices] = useState([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadServices();
    }, []);

    async function loadServices() {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to load services");
            }

            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error(error);
            setMessage("Cannot connect to the backend.");
        } finally {
            setLoading(false);
        }
    }

    async function addService(e) {
        e.preventDefault();

        if (!name.trim() || !price || !description.trim()) {
            setMessage("Please complete all service fields.");
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name.trim(),
                    price: Number(price),
                    description: description.trim()
                })
            });

            if (!response.ok) {
                throw new Error("Failed to add service");
            }

            const newService = await response.json();

            setServices((currentServices) => [
                ...currentServices,
                newService
            ]);

            setName("");
            setPrice("");
            setDescription("");
            setMessage("New dental service added successfully.");
        } catch (error) {
            console.error(error);
            setMessage("Cannot add service. Check your backend.");
        }
    }

    async function removeService(id, serviceName) {
        const confirmed = window.confirm(
            `Remove ${serviceName} from the service list?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Failed to remove service");
            }

            setServices((currentServices) =>
                currentServices.filter((service) => service._id !== id)
            );

            setMessage("Service removed successfully.");
        } catch (error) {
            console.error(error);
            setMessage("Cannot remove service. Check your backend.");
        }
    }

    return (
        <>
            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: Arial, sans-serif;
                }

                body {
                    background: #f7f3fc;
                    color: #333;
                }

                .main {
                    margin-left: 250px;
                    padding: 30px;
                }

                .topbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }

                .topbar h1 {
                    color: #5f4778;
                    font-size: 27px;
                }

                .topbar p {
                    color: #777;
                    margin-top: 5px;
                    font-size: 14px;
                }

                .dentist-info {
                    background: white;
                    padding: 10px 16px;
                    border-radius: 12px;
                    color: #5f4778;
                    font-weight: bold;
                    box-shadow: 0 3px 12px rgba(0,0,0,0.05);
                }

                .offline-banner {
                    background: #fff3cd;
                    color: #856404;
                    padding: 12px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .intro {
                    background: white;
                    padding: 22px;
                    border-radius: 15px;
                    margin-bottom: 22px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }

                .intro h2 {
                    color: #5f4778;
                    margin-bottom: 7px;
                    font-size: 20px;
                }

                .intro p {
                    color: #777;
                    font-size: 14px;
                }

                .message {
                    background: #eee7f5;
                    color: #5f4778;
                    padding: 12px 15px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    font-size: 14px;
                }

                .service-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 18px;
                }

                .service-card {
                    background: white;
                    border-radius: 15px;
                    padding: 22px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    transition: 0.2s;
                }

                .service-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 7px 18px rgba(128,96,158,0.12);
                }

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
                    border-radius: 13px;
                    background: #eee7f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 26px;
                    margin-bottom: 15px;
                }

                .service-card h3 {
                    color: #5f4778;
                    font-size: 17px;
                    margin-bottom: 8px;
                }

                .service-card p {
                    color: #777;
                    font-size: 13px;
                    line-height: 1.5;
                    min-height: 58px;
                }

                .service-bottom {
                    border-top: 1px solid #eee;
                    margin-top: 15px;
                    padding-top: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .price {
                    color: #80609e;
                    font-weight: bold;
                    font-size: 15px;
                }

                .remove-btn {
                    border: none;
                    background: #f9e0e2;
                    color: #a03a43;
                    padding: 8px 11px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .remove-btn:hover {
                    opacity: 0.8;
                }

                .add-section {
                    margin-top: 25px;
                    background: white;
                    padding: 22px;
                    border-radius: 15px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }

                .add-section h2 {
                    color: #5f4778;
                    font-size: 19px;
                    margin-bottom: 15px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 14px;
                }

                .form-group label {
                    display: block;
                    color: #666;
                    font-size: 12px;
                    margin-bottom: 6px;
                    font-weight: bold;
                }

                .form-group input,
                .form-group textarea {
                    width: 100%;
                    padding: 11px 13px;
                    border: 1px solid #ddd;
                    border-radius: 9px;
                    outline: none;
                    font-size: 13px;
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    border-color: #9b7bb8;
                }

                .full {
                    grid-column: 1 / -1;
                }

                .add-btn {
                    margin-top: 15px;
                    border: none;
                    background: #80609e;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 9px;
                    cursor: pointer;
                    font-weight: bold;
                }

                .add-btn:hover {
                    background: #6d5189;
                }

                .empty {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    text-align: center;
                    color: #777;
                }

                @media (max-width: 1000px) {
                    .service-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .main {
                        margin-left: 0;
                        padding: 20px;
                    }

                    .dentist-info {
                        display: none;
                    }
                }

                @media (max-width: 550px) {
                    .service-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .full {
                        grid-column: auto;
                    }

                    .topbar h1 {
                        font-size: 22px;
                    }
                }
            `}</style>

            <Sidebar role="dentist" active="services" />

            <main className="main">
                {!navigator.onLine && (
                    <div className="offline-banner">
                        ⚠️ You are currently offline.
                    </div>
                )}

                <div className="topbar">
                    <div>
                        <h1>Dental Services</h1>
                        <p>Manage the services offered by your clinic.</p>
                    </div>

                    <div className="dentist-info">
                        👩‍⚕️ Dr. Jhulance Fenandez
                    </div>
                </div>

                {message && (
                    <div className="message">
                        {message}
                    </div>
                )}

                <section className="intro">
                    <h2>Available Dental Services</h2>
                    <p>
                        These are the dental services currently available
                        for patients when booking an appointment.
                    </p>
                </section>

                <section className="service-grid">
                    {loading ? (
                        <div className="empty">
                            Loading services...
                        </div>
                    ) : services.length === 0 ? (
                        <div className="empty">
                            No dental services available.
                        </div>
                    ) : (
                        services.map((service) => (
                            <div
                                className="service-card"
                                key={service._id}
                            >
                                {serviceImages[service.name] && (
                                    <img
                                        className="service-image"
                                        src={serviceImages[service.name]}
                                        alt={service.name}
                                    />
                                )}

                                <div className="service-icon">
                                    🦷
                                </div>

                                <h3>{service.name}</h3>

                                <p>
                                    {service.description}
                                </p>

                                <div className="service-bottom">
                                    <span className="price">
                                        ₱{Number(service.price).toLocaleString()}
                                    </span>

                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() =>
                                            removeService(
                                                service._id,
                                                service.name
                                            )
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </section>

                <section className="add-section">
                    <h2>➕ Add New Service</h2>

                    <form onSubmit={addService}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Service Name</label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Example: Root Canal"
                                />
                            </div>

                            <div className="form-group">
                                <label>Price</label>

                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) =>
                                        setPrice(e.target.value)
                                    }
                                    placeholder="Example: 3000"
                                />
                            </div>

                            <div className="form-group full">
                                <label>Description</label>

                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Enter a short description..."
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="add-btn"
                        >
                            Add Service
                        </button>
                    </form>
                </section>
            </main>
        </>
    );
}