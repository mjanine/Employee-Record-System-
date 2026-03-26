document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    const typeButtons = document.querySelectorAll('.type-btn');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    const handleToggle = () => sidebar.classList.toggle('collapsed');
    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add('collapsed');
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.remove('collapsed');

    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector('span');
        if (span) item.setAttribute('data-text', span.innerText);
    });

    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                dropZone.innerHTML = `<i class="fas fa-check-circle" style="color: #28a745; font-size: 24px;"></i><p>Selected: <b>${fileName}</b></p><small style="color: #666; cursor: pointer;">Click to change file</small>`;
            }
        });
    }

    const leaveForm = document.getElementById('leaveRequestForm');
    if (leaveForm) {
        leaveForm.onsubmit = (e) => {
            e.preventDefault();

            const selectedType = document.querySelector('.type-btn.active')?.innerText || "General Leave";
            const startDateVal = document.querySelector('input[name="start_date"]').value;
            const endDateVal = document.querySelector('input[name="end_date"]').value;
            const reasonVal = document.querySelector('.form-textarea').value;
            
            const start = new Date(startDateVal);
            const end = new Date(endDateVal);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            const file = fileInput.files[0];
            const saveRequest = (fileBase64 = null) => {
                const newRequest = {
                    id: Date.now(),
                    name: "Jose Brian Dela Peña", 
                    role: "Department Head",
                    dateFiled: new Date().toISOString().split('T')[0],
                    leaveType: selectedType,
                    startDate: startDateVal,
                    endDate: endDateVal,
                    numDays: diffDays,
                    reason: reasonVal,
                    status: "Pending", 
                    reviewedBy: "---",
                    reviewRemarks: "Awaiting initial review.", // Fixed: No longer undefined
                    submitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    fileName: file ? file.name : "No Document Attached",
                    fileData: fileBase64 // Fixed: Saves PNG/JPG/PDF data
                };

                let allRequests = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
                allRequests.push(newRequest);
                localStorage.setItem('allLeaveRequests', JSON.stringify(allRequests));

                alert("Leave Request Submitted Successfully!");
                window.location.href = 'head_leaveselect.html';
            };

            if (file) {
                const reader = new FileReader();
                reader.onload = () => saveRequest(reader.result);
                reader.readAsDataURL(file);
            } else {
                saveRequest();
            }
        };
    }
});