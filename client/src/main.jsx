import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeSafeArea, logDeviceInfo } from "./lib/iosUtils.js";

// Initialize iOS-specific features
initializeSafeArea();

// Log device info in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    logDeviceInfo();
  }, 1000);
}

createRoot(document.getElementById("root")).render(<App />);
