/**
 * UI Element Selectors
 */
const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");
const menuItems = document.querySelectorAll(".menu-item");

// Attendance Components
const clockBtn = document.getElementById("clockBtn");
const workingTimeDisplay = document.getElementById("workingTime");
const timeInDisplay = document.getElementById("timeInDisplay");

/**
 * 1. SIDEBAR LOGIC
 * Handles collapsing, expanding, and active states.
 */

// Close sidebar (Manual button)
closeBtn.addEventListener("click", () => {
    sidebar.classList.add("collapsed");
});

// Expand sidebar (Clicking the logo when collapsed)
logoToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
    }
});

// Menu Item Management
menuItems.forEach(item => {
    // Set up tooltip text for collapsed mode
    const spanText = item.querySelector("span")?.innerText;
    if (spanText) {
        item.setAttribute("data-text", spanText);
    }

    // Handle 'Active' class switching
    item.addEventListener("click", () => {
        document.querySelector(".menu-item.active")?.classList.remove("active");
        item.classList.add("active");
    });
});


/**
 * 2. ATTENDANCE CLOCK LOGIC
 * Handles the "Clock In" button, timer, and visual feedback.
 */
let timerInterval = null;
let totalSeconds = 0;
let isClockedIn = false;

// Helper to format seconds into "0h 00m"
function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
}

// Function to update the timer display
function startTimer() {
    timerInterval = setInterval(() => {
        totalSeconds++;
        workingTimeDisplay.innerText = `Working for: ${formatDuration(totalSeconds)}`;
    }, 1000);
}

// Toggle Clock In / Clock Out
clockBtn.addEventListener("click", () => {
    if (!isClockedIn) {
        // --- CLOCKING IN ---
        isClockedIn = true;
        
        // Update Button UI
        clockBtn.innerText = "Clock out";
        clockBtn.style.background = "#8b0000"; // Dark red for stop
        
        // Record Current Time
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        timeInDisplay.innerText = `Time In: ${timeString}`;
        
        // Start the counter
        startTimer();

    } else {
        // --- CLOCKING OUT ---
        const confirmLogout = confirm("Are you sure you want to clock out?");
        
        if (confirmLogout) {
            isClockedIn = false;
            
            // Stop the counter
            clearInterval(timerInterval);
            
            // Reset Button UI
            clockBtn.innerText = "Clock in";
            clockBtn.style.background = "#2d5a27"; // Reset to Green
            
            // Show summary (Optional)
            alert(`Shift completed! Total time: ${formatDuration(totalSeconds)}`);
            
            // Optional: reset timer for next time
            // totalSeconds = 0;
            // workingTimeDisplay.innerText = "Working for: 0h 00m";
        }
    }
});

/**
 * 3. DYNAMIC DATE/TIME HEADER (Optional enhancement)
 * Keeps the "Monday, February 8" text updated if needed.
 */
function updateHeaderDate() {
    const dateElement = document.querySelector(".date-now");
    if (dateElement) {
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        dateElement.innerText = `${now.toLocaleDateString('en-US', options)} | ${now.toLocaleTimeString([], timeOptions)}`;
    }
}

// Update the header date every minute
setInterval(updateHeaderDate, 60000);
updateHeaderDate();