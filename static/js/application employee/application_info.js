document.addEventListener("DOMContentLoaded", () => {
    // --- 1. SELECT ELEMENTS ---
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const menuItems = document.querySelectorAll(".menu-item");
    
    // CV Upload Elements
    const cvInput = document.getElementById("cv-upload");
    const fileNameDisplay = document.getElementById("file-name");

    console.log("Application Script: Initialized");

    // --- 2. SIDEBAR LOGIC ---
    if (sidebar && closeBtn && logoToggle) {
        // Close button: Collapses the sidebar
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
            console.log("Sidebar: Collapsed");
        });

        // Logo click: Expands the sidebar if it is currently collapsed
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
                console.log("Sidebar: Expanded");
            }
        });
    }

    // --- 3. UPLOAD CV LOGIC (DYNAMIC FILE NAME) ---
    if (cvInput && fileNameDisplay) {
        // This event fires the moment the user selects a file from the system dialog
        cvInput.addEventListener("change", function() {
            // Check if at least one file was selected
            if (this.files && this.files.length > 0) {
                // Get the name of the chosen file
                const chosenName = this.files[0].name;
                
                // Update the <span> text to show the actual filename
                fileNameDisplay.textContent = chosenName;
                
                // Optional: Enhance visibility of the selected name
                fileNameDisplay.style.color = "#1a1a1a"; 
                fileNameDisplay.style.fontWeight = "600";
                
                console.log("File Selected: " + chosenName);
            } else {
                // If the user opens the dialog but cancels, revert to default
                fileNameDisplay.textContent = "File_Name.pdf";
                fileNameDisplay.style.color = "#555";
                fileNameDisplay.style.fontWeight = "400";
            }
        });
    }

    // --- 4. MENU ACTIVE STATES & TOOLTIPS ---
    menuItems.forEach(item => {
        // Automatically set tooltip text for collapsed mode based on the span text
        const spanText = item.querySelector("span")?.innerText;
        if (spanText) {
            item.setAttribute("data-text", spanText);
        }

        item.addEventListener("click", () => {
            // Remove 'active' class from current item
            const currentActive = document.querySelector(".menu-item.active");
            if (currentActive) {
                currentActive.classList.remove("active");
            }
            // Set clicked item as active
            item.classList.add("active");
        });
    });

    // --- 5. FORM SUBMISSION ---
    const applicantForm = document.getElementById("applicantForm");
    if (applicantForm) {
        applicantForm.addEventListener("submit", (e) => {
            e.preventDefault();
            // Basic validation check for the file
            if (cvInput.files.length === 0) {
                alert("Please upload your CV before saving.");
                return;
            }
            alert("Applicant information and CV saved successfully!");
        });
    }
});