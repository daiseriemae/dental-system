
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);

// Register the service worker for offline support.
if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            const registration =
                await navigator.serviceWorker.register(
                    `${import.meta.env.BASE_URL}sw.js`
                );

            console.log(
                "DentalCare service worker registered:",
                registration.scope
            );
        } catch (error) {
            console.error(
                "Service worker registration failed:",
                error
            );
        }
    });
}
