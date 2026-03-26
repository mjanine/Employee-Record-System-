/* hr_leaverequest.js */
let leaveData = [];
let activeRowId = null;
const hrName = "Tatsu"; // Persona: HR Manager

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');

    // Sidebar Tooltips
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.textContent.trim());
    });

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    tabRequests.onclick = () => {
        tabRequests.classList.add('active'); tabHistory.classList.remove('active');
        renderHRTable("Active");
    };
    tabHistory.onclick = () => {
        tabHistory.classList.add('active'); tabRequests.classList.remove('active');
        renderHRTable("History");
    };

    renderHRTable("Active");

    document.getElementById('tableSearch').addEventListener('keyup', (e) => {
        const val = e.target.value.toLowerCase();
        document.querySelectorAll('tbody tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
        });
    });
});

function getCredits(name) {
    const credits = JSON.parse(localStorage.getItem('userCredits')) || {};
    return credits[name] !== undefined ? credits[name] : 15;
}

function renderHRTable(mode) {
    const body = document.getElementById('leaveTableBody');
    const template = document.getElementById('hrRowTemplate');
    if (!body || !template) return;
    body.innerHTML = "";
    leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];

    leaveData.forEach((leave) => {
        const isFinal = leave.status === "Approved" || leave.status === "Rejected";
        
        if ((mode === "Active" && !isFinal) || (mode === "History" && isFinal)) {
            const clone = template.content.cloneNode(true);
            const statusClass = leave.status.toLowerCase().replace(/\s+/g, '-');
            
            clone.querySelector('.col-emp').innerHTML = `<strong>${leave.name}</strong><br><small>${leave.role}</small>`;
            clone.querySelector('.col-type').innerText = leave.leaveType;
            clone.querySelector('.col-start').innerText = leave.startDate;
            clone.querySelector('.col-end').innerText = leave.endDate;
            clone.querySelector('.col-days').innerText = leave.numDays;
            clone.querySelector('.col-status').innerHTML = `<span class="status-pill ${statusClass}">${leave.status}</span>`;
            clone.querySelector('.col-reviewer').innerText = leave.reviewedBy || '---';
            
            clone.querySelector('.action-link').onclick = () => openHRModal(leave.id);
            body.appendChild(clone);
        }
    });

    if (body.innerHTML === "") {
        body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#888; padding:40px;">No records found.</td></tr>`;
    }
}

function openHRModal(id) {
    activeRowId = id;
    const data = leaveData.find(l => l.id === id);
    if (!data) return;

    const isOwnRequest = (data.name.trim() === hrName.trim());
    const isSDRequest = (data.role === "School Director");
    const isFinal = (data.status === "Approved" || data.status === "Rejected");
    const statusClass = data.status.toLowerCase().replace(/\s+/g, '-');

    // Fill Modal Data by ID
    document.getElementById('modalFileName').innerText = data.fileName || "Document.pdf";
    document.getElementById('modalSubmitDate').innerText = `${data.dateFiled} at ${data.submitTime || '---'}`;
    document.getElementById('modalReason').innerText = data.reason || "N/A";
    document.getElementById('modalRemarks').innerText = data.reviewRemarks || 'Awaiting initial review.';
    document.getElementById('modalReviewerText').innerHTML = `<small>Reviewed by: ${data.reviewedBy || '---'}</small>`;
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${statusClass}">${data.status}</span>`;

    // Handle Credits Block
    const creditsBlock = document.getElementById('creditsBlock');
    if (data.leaveType === "Sick Leave") {
        creditsBlock.style.display = "block";
        document.getElementById('modalCredits').innerText = `${getCredits(data.name)} Days Remaining`;
    } else {
        creditsBlock.style.display = "none";
    }

    // Actions visibility: Hide if final, own request, or School Director request
    const actions = document.getElementById('modalActions');
    if (isFinal || isOwnRequest || isSDRequest) {
        actions.style.display = "none";
    } else {
        actions.style.display = "flex";
    }

    // File Preview
    const preview = document.querySelector('.pdf-placeholder');
    if (data.fileData) {
        preview.innerHTML = data.fileData.includes("image") 
            ? `<img src="${data.fileData}" style="width:100%; height:100%; object-fit:contain; border-radius:10px;">` 
            : `<embed src="${data.fileData}" width="100%" height="100%" style="border-radius:10px;">`;
    } else {
        preview.innerHTML = `<i class="fas fa-file-alt"></i><p>No document uploaded</p>`;
    }

    document.getElementById('viewModal').style.display = 'flex';
}

function processRequest(status) {
    const index = leaveData.findIndex(l => l.id === activeRowId);
    if (index !== -1) {
        const request = leaveData[index];
        const isHeadRequest = (request.role === "Department Head");

        if (status === "Approved") {
            if (isHeadRequest) {
                request.status = "Approved - By HR";
                request.reviewedBy = "HR Manager";
                request.reviewRemarks = "HR Manager has reviewed and approved. Waiting for final review by School Director.";
            } else {
                if (request.leaveType === "Sick Leave") {
                    let credits = JSON.parse(localStorage.getItem('userCredits')) || {};
                    credits[request.name] = getCredits(request.name) - request.numDays;
                    localStorage.setItem('userCredits', JSON.stringify(credits));
                }
                request.status = "Approved"; 
                request.reviewedBy = "HR Manager";
                request.reviewRemarks = "This request has been finalized by HR Manager.";
            }
        } else {
            request.status = "Rejected"; 
            request.reviewedBy = "HR Manager";
            request.reviewRemarks = "This request has been rejected by HR Manager.";
        }
        
        localStorage.setItem('allLeaveRequests', JSON.stringify(leaveData));
        location.reload();
    }
}

function closeViewModal() { document.getElementById('viewModal').style.display = 'none'; }