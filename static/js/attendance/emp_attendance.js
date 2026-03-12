/**
 * 1. UI ELEMENT SELECTORS
 */
const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");
const menuItems = document.querySelectorAll(".menu-item");

// Main Attendance Dashboard Components
const clockBtn = document.getElementById("clockBtn");
const workingTimeDisplay = document.getElementById("workingTime");
const timeInDisplay = document.getElementById("timeInDisplay");

// Full History Modal Components
const historyModal = document.getElementById("historyModal");
const openHistoryBtn = document.getElementById("openHistory");
const closeHistoryBtn = document.getElementById("closeHistory");
const weeklyViewBtn = document.getElementById("weeklyViewBtn");
const monthlyViewBtn = document.getElementById("monthlyViewBtn");
const historyDateRange = document.getElementById("historyDateRange");

/**
 * 2. SIDEBAR NAVIGATION LOGIC
 */
// Toggle Sidebar Collapse
closeBtn.addEventListener("click", () => {
    sidebar.classList.add("collapsed");
});

logoToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
    }
});

// Active State Management
menuItems.forEach(item => {
    item.addEventListener("click", () => {
        document.querySelector(".menu-item.active")?.classList.remove("active");
        item.classList.add("active");
    });
});

/**
 * 3. REAL-TIME ATTENDANCE CLOCK LOGIC
 */
let timerInterval = null;
let totalSeconds = 0;
let isClockedIn = false;

function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        totalSeconds++;
        workingTimeDisplay.innerText = `Working for: ${formatDuration(totalSeconds)}`;
    }, 1000);
}

clockBtn.addEventListener("click", () => {
    if (!isClockedIn) {
        // Clocking In
        isClockedIn = true;
        clockBtn.innerText = "Clock out";
        clockBtn.style.background = "#8b0000"; // Dark red for active state
        
        const now = new Date();
        timeInDisplay.innerText = `Time In: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        
        startTimer();
    } else {
        // Clocking Out
        if (confirm("Are you sure you want to clock out?")) {
            isClockedIn = false;
            clearInterval(timerInterval);
            clockBtn.innerText = "Clock in";
            clockBtn.style.background = "#2d5a27"; // Return to original green
            alert(`Shift completed! Total time: ${formatDuration(totalSeconds)}`);
        }
    }
});

/**
 * 4. FULL HISTORY MODAL LOGIC
 */
// Open and Close Modal
openHistoryBtn.addEventListener("click", () => {
    historyModal.style.display = "block";
});

closeHistoryBtn.addEventListener("click", () => {
    historyModal.style.display = "none";
});

// Close modal when clicking outside of the content box
window.addEventListener("click", (event) => {
    if (event.target === historyModal) {
        historyModal.style.display = "none";
    }
});

// Weekly vs Monthly View Toggle
function switchHistoryView(view) {
    if (view === "weekly") {
        weeklyViewBtn.classList.add("active");
        monthlyViewBtn.classList.remove("active");
        historyDateRange.innerText = "February 4 - 10, 2026";
        // Logic to update table rows for weekly data goes here
    } else {
        monthlyViewBtn.classList.add("active");
        weeklyViewBtn.classList.remove("active");
        historyDateRange.innerText = "February 2026";
        // Logic to update table rows for monthly data goes here
    }
}

weeklyViewBtn.addEventListener("click", () => switchHistoryView("weekly"));
monthlyViewBtn.addEventListener("click", () => switchHistoryView("monthly"));

/**
 * 5. HEADER DATE/TIME UPDATER
 */
function updateHeader() {
    const dateElement = document.querySelector(".date-now");
    if (dateElement) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        dateElement.innerText = `${dateStr} | ${timeStr}`;
    }
}

setInterval(updateHeader, 60000);
updateHeader();