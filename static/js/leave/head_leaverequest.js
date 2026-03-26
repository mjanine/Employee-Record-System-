/* head_leaverequest.js */
let leaveData = [];
let activeRowId = null;
const loggedHeadName = "Jose Brian Dela Peña"; 

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');

    // Sidebar Tooltips
    document.querySelectorAll(".menu-item").forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.textContent.trim());
    });

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    tabRequests.onclick = () => {
        tabRequests.classList.add('active'); tabHistory.classList.remove('active');
        renderHeadTable("Active");
    };
    tabHistory.onclick = () => {
        tabHistory.classList.add('active'); tabRequests.classList.remove('active');
        renderHeadTable("History");
    };

    renderHeadTable("Active");

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

function renderHeadTable(mode) {
    const body = document.getElementById('leaveTableBody');
    const template = document.getElementById('headRowTemplate');
    body.innerHTML = "";
    leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];

    leaveData.forEach((leave) => {
        const isOwnRequest = (leave.name.trim() === loggedHeadName.trim());
        const isSDRequest = (leave.role === "School Director");
        const isHRRequest = (leave.role === "HR Manager");
        
        const isActionedByHead = leave.status.includes("- By Head");
        const isFinal = (leave.status === "Approved" || leave.status === "Rejected");

        if (isSDRequest || isHRRequest) return; 

        let shouldShow = false;
        if (mode === "Active") {
            if ((!isOwnRequest && !isActionedByHead && !isFinal) || (isOwnRequest && !isFinal)) shouldShow = true;
        } else {
            if ((!isOwnRequest && (isActionedByHead || isFinal)) || (isOwnRequest && isFinal)) shouldShow = true;
        }

        if (shouldShow) {
            const clone = template.content.cloneNode(true);
            let displayStatus = leave.status;
            if (isOwnRequest && !isFinal) displayStatus = "Pending";
            const statusClass = displayStatus.toLowerCase().replace(/\s+/g, '-');

            clone.querySelector('.col-emp').innerHTML = `<strong>${leave.name}</strong><br><small>${leave.role}</small>`;
            clone.querySelector('.col-type').innerText = leave.leaveType;
            clone.querySelector('.col-start').innerText = leave.startDate;
            clone.querySelector('.col-end').innerText = leave.endDate;
            clone.querySelector('.col-days').innerText = leave.numDays;
            clone.querySelector('.col-status').innerHTML = `<span class="status-pill ${statusClass}">${displayStatus}</span>`;
            clone.querySelector('.col-reviewer').innerText = leave.reviewedBy || '---';
            
            clone.querySelector('.action-link').onclick = () => openHeadModal(leave.id);
            body.appendChild(clone);
        }
    });

    if (body.innerHTML === "") {
        body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#888; padding:40px;">No records found.</td></tr>`;
    }
}

function openHeadModal(id) {
    activeRowId = id;
    const data = leaveData.find(l => l.id === id);
    if (!data) return;

    const isOwnRequest = (data.name.trim() === loggedHeadName.trim());
    const isFinal = (data.status === "Approved" || data.status === "Rejected");
    const isActionedByHead = data.status.includes("- By Head");
    const statusClass = data.status.toLowerCase().replace(/\s+/g, '-');

    // Fill Modal Data
    document.getElementById('modalFileName').innerText = data.fileName || "Document.pdf";
    document.getElementById('modalSubmitDate').innerText = `${data.dateFiled} at ${data.submitTime || '---'}`;
    document.getElementById('modalReason').innerText = data.reason || "N/A";
    document.getElementById('modalRemarks').innerText = data.reviewRemarks || 'Awaiting initial review.';
    document.getElementById('modalReviewerText').innerHTML = `<small>Reviewed by: ${data.reviewedBy || '---'}</small>`;
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${statusClass}">${isOwnRequest && !isFinal ? 'Pending' : data.status}</span>`;

    // Credits visibility
    const creditsBlock = document.getElementById('creditsBlock');
    if (data.leaveType === "Sick Leave") {
        creditsBlock.style.display = "block";
        document.getElementById('modalCredits').innerText = `${getCredits(data.name)} Days Remaining`;
    } else {
        creditsBlock.style.display = "none";
    }

    // Actions visibility
    const actions = document.getElementById('modalActions');
    if (!isOwnRequest && !isActionedByHead && !isFinal) {
        actions.style.display = "flex";
    } else {
        actions.style.display = "none";
    }

    // File Preview
    const preview = document.querySelector('.pdf-placeholder');
    if (data.fileData) {
        preview.innerHTML = data.fileData.includes("image") 
            ? `<img src="${data.fileData}" style="width:100%; height:100%; object-fit:contain; border-radius:10px;">` 
            : `<embed src="${data.fileData}" width="100%" height="100%" style="border-radius:10px;">`;
    }

    document.getElementById('viewModal').style.display = 'flex';
}

function processHeadRequest(decision) {
    const index = leaveData.findIndex(l => l.id === activeRowId);
    if (index !== -1) {
        leaveData[index].status = decision + " - By Head";
        leaveData[index].reviewedBy = loggedHeadName; 
        const statusStr = decision === "Approved" ? "approved" : "rejected";
        leaveData[index].reviewRemarks = `${loggedHeadName} (Dept. Head) has ${statusStr}. Awaiting HR final review.`;

        localStorage.setItem('allLeaveRequests', JSON.stringify(leaveData));
        location.reload();
    }
}

function closeViewModal() { document.getElementById('viewModal').style.display = 'none'; }