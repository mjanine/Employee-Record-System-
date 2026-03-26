document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    const typeButtons = document.querySelectorAll('.type-btn');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const leaveForm = document.getElementById('leaveRequestForm');
    const menuItems = document.querySelectorAll(".menu-item");

    let selectedFileData = null; 
    let selectedFileName = "No Document Attached";

    // Initialize Tooltips
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) { item.setAttribute("data-text", span.innerText); }
    });

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add('collapsed');
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle('collapsed');

    // Leave Type Selection
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // File Upload Handling
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

    // Form Submission
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
                name: "Ricardo G. Dela Cruz", // MATCHED TO SD INFO
                role: "School Director",
                dept: "Office of the Director",
                dateFiled: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                submitTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                leaveType: leaveType,
                startDate: startDateVal,
                endDate: endDateVal,
                numDays: diffDays,
                status: "Pending", // For SD, this goes to HR
                reviewedBy: "---",
                fileName: selectedFileName,
                fileData: selectedFileData, 
                reason: reasonVal,
                reviewRemarks: "Awaiting review from Human Resources."
            };

            let allRequests = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
            allRequests.push(newRequest);
            localStorage.setItem('allLeaveRequests', JSON.stringify(allRequests));
            alert("Leave Request Submitted to HR!");
            window.location.href = 'sd_leaverequest.html';
        };
    }
});