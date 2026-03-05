document.addEventListener("DOMContentLoaded", () => {
    // 1. SELECT ELEMENTS
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");
    
    // Select CV Elements
    const uploadBtn = document.getElementById("uploadBtn");
    const cvInput = document.getElementById("cvInput");
    const fileNameDisplay = document.getElementById("fileNameDisplay");

    console.log("Script status: Initialized");

    // 2. SIDEBAR LOGIC (Safe Mode)
    if (sidebar && closeBtn && logoToggle) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
            console.log("Sidebar Closed");
        });

        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
                console.log("Sidebar Opened");
            }
        });
    }

    // 3. UPLOAD CV LOGIC (Safe Mode)
    // Check if the button and the hidden input exist before adding listeners
    if (uploadBtn && cvInput) {
        uploadBtn.addEventListener("click", (e) => {
            e.preventDefault(); // Stop form from doing anything weird
            console.log("Upload button clicked - triggering hidden input");
            cvInput.click(); // This opens the file window
        });

        cvInput.addEventListener("change", () => {
            if (cvInput.files && cvInput.files.length > 0) {
                const name = cvInput.files[0].name;
                console.log("File selected:", name);
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = name;
                }
            }
        });
    } else {
        console.error("CV Elements not found! Check IDs: uploadBtn, cvInput");
    }

    // 4. MENU ACTIVE STATES
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            document.querySelector(".menu-item.active")?.classList.remove("active");
            item.classList.add("active");
        });
    });
});