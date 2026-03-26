/* hr_applicationleave.js */
document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    const typeButtons = document.querySelectorAll('.type-btn');
    const dropZone = document.getElementById('dropZone');
    const dropZoneContent = document.getElementById('dropZoneContent');
    const fileInput = document.getElementById('fileInput');
    const leaveForm = document.getElementById('leaveRequestForm');
    const menuItems = document.querySelectorAll(".menu-item");

    let selectedFileData = null;
    let selectedFileName = "No Document Attached";

    // --- Sidebar & Tooltips ---
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText);
    });

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    // --- Leave Type Selection ---
    typeButtons.forEach(btn => {
        btn.onclick = () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
    });

    // --- File Upload Handling ---
    if (dropZone && fileInput) {
        dropZone.onclick = () => fileInput.click();

        fileInput.onchange = () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                selectedFileName = file.name;
                const reader = new FileReader();
                reader.onload = (e) => {
                    selectedFileData = e.target.result;
                    // Update UI inside the drop zone
                    dropZoneContent.innerHTML = `
                        <i class="fas fa-check-circle" style="color: #28a745; font-size: 24px;"></i>
                        <p style="margin-top: 10px;">Selected: <span style="color: #4a1d1d; font-weight: bold;">${selectedFileName}</span></p>
                        <small style="color: #666;">Click to change file</small>
                    `;
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // --- Form Submission Logic ---
    if (leaveForm) {
        leaveForm.onsubmit = (e) => {
            e.preventDefault();

            const activeBtn = document.querySelector('.type-btn.active');
            const leaveType = activeBtn ? activeBtn.innerText : "General Leave";
            const startDateVal = document.getElementsByName('start_date')[0].value;
            const endDateVal = document.getElementsByName('end_date')[0].value;
            const reasonVal = document.getElementById('leaveReason').value;

            // Simple validation
            if (!startDateVal || !endDateVal || !reasonVal) {
                alert("Please fill in all required fields.");
                return;
            }

            const diffDays = Math.ceil(Math.abs(new Date(endDateVal) - new Date(startDateVal)) / (1000 * 60 * 60 * 24)) + 1;

            // Create request object
            const newRequest = {
                id: Date.now(),
                name: "Tatsu", 
                role: "HR Manager",
                dept: "Human Resources",
                dateFiled: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                submitTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                leaveType: leaveType,
                startDate: startDateVal,
                endDate: endDateVal,
                numDays: diffDays,
                status: "Pending",
                reviewedBy: "---",
                fileName: selectedFileName,
                fileData: selectedFileData,
                reason: reasonVal,
                reviewRemarks: "Awaiting review from School Director."
            };

            // Save to LocalStorage
            let allRequests = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
            allRequests.push(newRequest);
            localStorage.setItem('allLeaveRequests', JSON.stringify(allRequests));

            alert('Leave request submitted successfully!');
            window.location.href = 'hr_leaverequest.html';
        };
    }
});