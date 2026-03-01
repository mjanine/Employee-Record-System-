document.addEventListener('DOMContentLoaded', () => {
    // Select elements from the DOM
    const employeeForm = document.getElementById('employeeForm');
    const uploadBtn = document.getElementById('uploadBtn');
    const cvInput = document.getElementById('cvInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const cancelBtn = document.getElementById('btnCancel');

    /**
     * 1. HANDLE CV UPLOAD
     * Triggers the hidden file input when the "Upload CV" button is clicked.
     */
    uploadBtn.addEventListener('click', () => {
        cvInput.click();
    });

    /**
     * 2. UPDATE FILE NAME DISPLAY
     * Shows the name of the file selected by the user, matching the "File_Name.pdf" 
     * placeholder in your reference image.
     */
    cvInput.addEventListener('change', () => {
        if (cvInput.files.length > 0) {
            fileNameDisplay.textContent = cvInput.files[0].name;
            fileNameDisplay.style.color = "#333"; // Make text darker when a file is present
        } else {
            fileNameDisplay.textContent = "File_Name.pdf";
        }
    });

    /**
     * 3. CANCEL BUTTON LOGIC
     * Redirects the user back to the list or clears the form.
     */
    cancelBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to discard this application?")) {
            // If you have an index.html or list.html, it will go there
            window.location.href = 'index.html'; 
        }
    });

    /**
     * 4. FORM SUBMISSION (SAVE)
     * Collects all the data from the compact form for processing.
     */
    employeeForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload

        // Collect data from the inputs
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            department: document.getElementById('dept').value,
            position: document.getElementById('pos').value,
            cvName: cvInput.files[0] ? cvInput.files[0].name : "No file uploaded",
            submittedAt: new Date().toLocaleString()
        };

        console.log("Applicant Data Saved:", formData);

        // Optional: Save to LocalStorage so you can see it on your List page
        let applications = JSON.parse(localStorage.getItem('applicantRecords')) || [];
        applications.push(formData);
        localStorage.setItem('applicantRecords', JSON.stringify(applications));

        alert("Application for " + formData.firstName + " has been saved successfully!");
        
        // Reset form after saving
        employeeForm.reset();
        fileNameDisplay.textContent = "File_Name.pdf";
    });
});