/**
 * Employee Management System - Application Info Logic
 * Ensure this file is located at: static/js/application_info.js
 */

console.log("application_info.js loaded successfully!");

document.addEventListener('DOMContentLoaded', () => {
    // --- SIDEBAR ELEMENTS ---
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");

    // --- FORM ELEMENTS ---
    const uploadBtn = document.getElementById('uploadBtn');
    const cvInput = document.getElementById('cvInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const employeeForm = document.getElementById('employeeForm');

    // 1. SIDEBAR TOGGLE & TOOLTIP LOGIC
    if (sidebar && closeBtn && logoToggle) {
        
        // Close button (only when expanded)
        closeBtn.addEventListener("click", () => {
            console.log("Closing sidebar...");
            sidebar.classList.add("collapsed");
        });

        // Open via logo click (only when collapsed)
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                console.log("Opening sidebar...");
                sidebar.classList.remove("collapsed");
            }
        });

        // Tooltip text generation & Active State Switcher
        menuItems.forEach(item => {
            // Get text from the span and set it as data-text for the CSS tooltip
            const span = item.querySelector("span");
            if (span) {
                const text = span.innerText;
                item.setAttribute("data-text", text);
            }

            // Handle clicking menu items to change active state
            item.addEventListener("click", () => {
                const currentActive = document.querySelector(".menu-item.active");
                if (currentActive) {
                    currentActive.classList.remove("active");
                }
                item.classList.add("active");
            });
        });

    } else {
        console.error("Sidebar elements missing! Check your IDs: sidebar, logoToggle, closeBtn");
    }

    // 2. CV UPLOAD LOGIC
    if (uploadBtn && cvInput && fileNameDisplay) {
        // Trigger hidden file input when button is clicked
        uploadBtn.addEventListener('click', () => cvInput.click());

        // Update text when a file is selected
        cvInput.addEventListener('change', () => {
            if (cvInput.files.length > 0) {
                const name = cvInput.files[0].name;
                fileNameDisplay.textContent = name;
                console.log("File selected: " + name);
            } else {
                fileNameDisplay.textContent = "File_Name.pdf";
            }
        });
    }

    // 3. FORM SUBMISSION
    if (employeeForm) {
        employeeForm.addEventListener('submit', (e) => {
            console.log("Form submitted! Add your backend API call here.");
            // e.preventDefault(); // Uncomment this if you want to test without refreshing the page
        });
    }
});