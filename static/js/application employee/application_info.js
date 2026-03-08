document.addEventListener("DOMContentLoaded", () => {

    // 1. SELECT ELEMENTS
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");
    const logoutBtn = document.querySelector(".logout"); // Added for logout

    // CV Elements
    const cvInput = document.getElementById("cv-upload");
    const fileNameDisplay = document.getElementById("file-name");

    const applicantForm = document.getElementById("applicantForm");

    console.log("Dashboard Script: Initialized");

    // 2. SIDEBAR LOGIC
    if (sidebar && closeBtn && logoToggle) {
        // Collapse sidebar
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
            console.log("Sidebar Status: Collapsed");
        });

        // Expand sidebar when clicking logo
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
                console.log("Sidebar Status: Expanded");
            }
        });
    }

    // 3. CV UPLOAD LOGIC
    if (cvInput && fileNameDisplay) {
        cvInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const name = e.target.files[0].name;
                fileNameDisplay.textContent = name;
                console.log("File Selected:", name);
            } else {
                fileNameDisplay.textContent = "File_Name.pdf";
            }
        });
    }

    // 4. MENU ACTIVE STATES & TOOLTIP TEXT
    menuItems.forEach(item => {
        const span = item.querySelector("span");

        if (span) {
            const text = span.innerText;
            item.setAttribute("data-text", text);
        }

        item.addEventListener("click", () => {
            // Prevent 'active' highlight if it's the logout button
            if (item.classList.contains("logout")) return;

            const currentActive = document.querySelector(".menu-item.active");
            if (currentActive) {
                currentActive.classList.remove("active");
            }
            item.classList.add("active");
        });
    });

    // 5. FORM SUBMISSION
    if (applicantForm) {
        applicantForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Application Saved Successfully!");
        });
    }

    // 6. LOGOUT LOGIC (Added)
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault(); // Stop the link from following the URL immediately
            
            const confirmLogout = confirm("Are you sure you want to log out?");
            if (confirmLogout) {
                console.log("User confirmed logout.");
                // Update this path to your actual login page location
                window.location.href = "../login/login.html";
            }
        });
    }

});