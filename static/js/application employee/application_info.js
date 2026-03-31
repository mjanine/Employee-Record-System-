document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");
    const logoutBtn = document.querySelector(".logout");
    const cvInput = document.getElementById("cv-upload");
    const fileNameDisplay = document.getElementById("file-name");
    const applicantForm = document.getElementById("applicantForm");

    // Sidebar Toggle Logic
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
        });
    }

    if (logoToggle) {
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
            }
        });
    }

    // CV Upload Display
    if (cvInput && fileNameDisplay) {
        cvInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                fileNameDisplay.textContent = e.target.files[0].name;
                fileNameDisplay.style.color = "#5c2b2b";
                fileNameDisplay.style.fontWeight = "bold";
            } else {
                fileNameDisplay.textContent = "File_Name.pdf";
            }
        });
    }

    // Menu Active States
    menuItems.forEach(item => {
        item.addEventListener("click", function() {
            if (this.parentElement.classList.contains("logout")) return;
            document.querySelector(".menu-item.active")?.classList.remove("active");
            this.classList.add("active");
        });
    });

    // Form Submission
    if (applicantForm) {
        applicantForm.addEventListener("submit", (e) => {
            e.preventDefault();
            // Basic success feedback
            const saveBtn = document.querySelector(".btn-save");
            saveBtn.innerText = "Saving...";
            saveBtn.disabled = true;

            setTimeout(() => {
                alert("Application Saved Successfully!");
                saveBtn.innerText = "Save";
                saveBtn.disabled = false;
            }, 1000);
        });
    }

    // Logout Action
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out?")) {
                window.location.href = "../login/login.html";
            }
        });
    }
});