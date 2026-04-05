/**
 * combined_attendance.js
 * Integrated Logic for Attendance Management
 * ============================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    /* ── 1. ELEMENT SELECTORS ────────────────────────────────── */

    // Sidebar & Navigation
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");

    // View Switcher (The Toggle Buttons from your screenshot)
    const btnLogView = document.getElementById("btnLogView");
    const btnMonitorView = document.getElementById("btnMonitorView");
    const logSection = document.getElementById("attendanceLogSection");
    const monitorSection = document.getElementById("attendanceMonitorSection");
    const pageTitle = document.getElementById("pageTitle");

    // Real-Time Attendance Clock (Log View)
    const clockBtn = document.getElementById("clockBtn");
    const workingTimeDisplay = document.getElementById("workingTime");
    const timeInDisplay = document.getElementById("timeInDisplay");
    const clockOutOverlay = document.getElementById("clockOutOverlay");
    const clockOutConfirmBtn = document.getElementById("clockOutConfirmBtn");
    const clockOutCancelBtn = document.getElementById("clockOutCancel");

    // Modals (History Modal for Log / Employee Modal for Monitoring)
    const historyModal = document.getElementById("historyModal");
    const employeeModal = document.getElementById("employeeModal");
    const openHistoryBtn = document.getElementById("openHistory");
    const closeHistoryBtn = document.getElementById("closeHistory");
    const monitorTableRows = document.querySelectorAll(".monitor-table tbody tr");


    /* ── 2. VIEW SWITCHING LOGIC ────────────────────────────── */

    /**
     * Toggles between Attendance Log and Attendance Monitoring
     * @param {string} view - 'log' or 'monitor'
     */
    function switchMainView(view) {
        if (view === "monitor") {
            btnMonitorView.classList.add("active");
            btnLogView.classList.remove("active");
            logSection.style.display = "none";
            monitorSection.style.display = "block";
            pageTitle.innerText = "Attendance Monitoring";
        } else {
            btnLogView.classList.add("active");
            btnMonitorView.classList.remove("active");
            monitorSection.style.display = "none";
            logSection.style.display = "block";
            pageTitle.innerText = "Attendance Log";
        }
    }

    if (btnLogView) btnLogView.addEventListener("click", () => switchMainView("log"));
    if (btnMonitorView) btnMonitorView.addEventListener("click", () => switchMainView("monitor"));


    /* ── 3. SIDEBAR & NAVIGATION ────────────────────────────── */

    if (closeBtn) {
        closeBtn.addEventListener("click", () => sidebar.classList.add("collapsed"));
    }

    if (logoToggle) {
        logoToggle.addEventListener("click", () => sidebar.classList.toggle("collapsed"));
    }

    // Set tooltip text for collapsed sidebar
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText.trim());
    });


    /* ── 4. REAL-TIME CLOCK LOGIC (Log View) ────────────────── */

    let timerInterval = null;
    let totalSeconds = 0;
    let isClockedIn = false;

    function formatDuration(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hrs}h ${mins.toString().padStart(2, "0")}m`;
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            totalSeconds++;
            if (workingTimeDisplay) {
                workingTimeDisplay.innerText = `Working for: ${formatDuration(totalSeconds)}`;
            }
        }, 1000);
    }

    function resetClockUI() {
        clearInterval(timerInterval);
        timerInterval = null;
        totalSeconds = 0;
        isClockedIn = false;
        clockBtn.innerText = "Clock in";
        clockBtn.classList.remove("is-clocked-in");
        workingTimeDisplay.innerText = "Working for: 0h";
        timeInDisplay.innerText = "Time In: --";
    }

    if (clockBtn) {
        clockBtn.addEventListener("click", () => {
            if (!isClockedIn) {
                // Clock In
                isClockedIn = true;
                clockBtn.innerText = "Clock out";
                clockBtn.classList.add("is-clocked-in");

                const now = new Date();
                timeInDisplay.innerText = `Time In: ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                startTimer();
            } else {
                // Trigger Clock Out Overlay (from your original logic)
                if (clockOutOverlay) clockOutOverlay.classList.add("clock-out-overlay--visible");
            }
        });
    }

    if (clockOutConfirmBtn) {
        clockOutConfirmBtn.addEventListener("click", () => {
            alert(`Shift completed: ${formatDuration(totalSeconds)}`);
            if (clockOutOverlay) clockOutOverlay.classList.remove("clock-out-overlay--visible");
            resetClockUI();
        });
    }

    if (clockOutCancelBtn) {
        clockOutCancelBtn.addEventListener("click", () => {
            clockOutOverlay.classList.remove("clock-out-overlay--visible");
        });
    }


    /* ── 5. MODAL MANAGEMENT ────────────────────────────────── */

    // History Modal (Log View)
    if (openHistoryBtn) {
        openHistoryBtn.addEventListener("click", () => historyModal.classList.add("open"));
    }
    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener("click", () => historyModal.classList.remove("open"));
    }

    // Employee Detail Modal (Monitoring View)
    monitorTableRows.forEach(row => {
        row.addEventListener("click", () => {
            const name = row.querySelector(".name")?.innerText || "Employee";
            // Populate modal (using your hr_attendance monitoring logic)
            const modalName = document.getElementById("modalEmployeeName");
            if (modalName) modalName.innerText = name;
            
            if (employeeModal) employeeModal.style.display = "block";
        });
    });

    // Close Modals on outside click
    window.addEventListener("click", (e) => {
        if (e.target === historyModal) historyModal.classList.remove("open");
        if (e.target === employeeModal) employeeModal.style.display = "none";
    });


    /* ── 6. HEADER CLOCK UPDATER ────────────────────────────── */

    function updateHeaderTime() {
        const dateElement = document.querySelector(".date-now");
        if (dateElement) {
            const now = new Date();
            const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
            const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            dateElement.innerText = `${dateStr} | ${timeStr}`;
        }
    }

    setInterval(updateHeaderTime, 60000);
    updateHeaderTime();


    /* ── 7. RESPONSIVE UTILS ────────────────────────────────── */

    const checkResponsive = () => {
        if (window.innerWidth <= 1100) {
            sidebar.classList.add("collapsed");
        }
    };

    window.addEventListener("resize", checkResponsive);
    checkResponsive();
});