/* emp_applicationleave.js */
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    const typeButtons = document.querySelectorAll('.type-btn');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const leaveForm = document.getElementById('leaveRequestForm');
    const menuItems = document.querySelectorAll(".menu-item"); // Added for tooltips

    let selectedFileData = null; 
    let selectedFileName = "No Document Attached";

    // --- TOOLTIP INITIALIZATION (The Fix for the Labels) ---
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) {
            const spanText = span.innerText;
            item.setAttribute("data-text", spanText);
        }
    });

    // Sidebar
    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add('collapsed');
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle('collapsed');

    // Type Selection
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // File Upload
    if (dropZone && fileInput) {
        dropZone.onclick = () => fileInput.click();
        fileInput.onchange = () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                selectedFileName = file.name;
                const reader = new FileReader();
                reader.onload = (e) => { 
                    selectedFileData = e.target.result; 
                    dropZone.innerHTML = `<i class="fas fa-check-circle" style="color: #28a745; font-size: 24px;"></i><p>Selected: <b>${selectedFileName}</b></p>`;
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // Submit Logic
    if (leaveForm) {
        leaveForm.onsubmit = (e) => {
            e.preventDefault();
            const activeBtn = document.querySelector('.type-btn.active');
            const leaveType = activeBtn ? activeBtn.innerText : "General Leave";
            const startDateVal = document.getElementsByName('start_date')[0].value;
            const endDateVal = document.getElementsByName('end_date')[0].value;
            const reasonVal = document.querySelector('.form-textarea').value;

            const diffDays = Math.ceil(Math.abs(new Date(endDateVal) - new Date(startDateVal)) / (1000 * 60 * 60 * 24)) + 1;

            const newRequest = {
                id: Date.now(),
                name: "John Smith",
                role: "Instructor",
                dept: "CCS",
                dateFiled: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                submitDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
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
                // Stage 1 Remark
                reviewRemarks: "Awaiting initial review from the Department Head."
            };

            let allRequests = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
            allRequests.push(newRequest);
            localStorage.setItem('allLeaveRequests', JSON.stringify(allRequests));
            alert("Leave Request Submitted!");
            window.location.href = 'emp_leaverequest.html';
        };
    }
});