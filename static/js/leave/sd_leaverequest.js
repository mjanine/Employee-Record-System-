/* sd_leaverequest.js */
const sdInfo = { name: "Ricardo G. Dela Cruz" };
let activeRowId = null; 

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');

    // Tooltips
    document.querySelectorAll(".menu-item").forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.innerText);
    });

    renderLeaveTable("Active");

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    tabRequests.onclick = () => {
        tabRequests.classList.add('active'); tabHistory.classList.remove('active');
        renderLeaveTable("Active");
    };
    tabHistory.onclick = () => {
        tabHistory.classList.add('active'); tabRequests.classList.remove('active');
        renderLeaveTable("History");
    };

    document.getElementById('tableSearch').addEventListener('keyup', (e) => {
        const val = e.target.value.toLowerCase();
        document.querySelectorAll('tbody tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
        });
    });
});

function renderLeaveTable(filter) {
    const body = document.getElementById('leaveTableBody');
    const template = document.getElementById('sdRowTemplate');
    body.innerHTML = "";
    const leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
    
    const visibleLeaves = leaveData.filter(l => 
        l.name === sdInfo.name || l.role === "Department Head" || l.role === "HR Manager"
    );

    visibleLeaves.forEach((leave) => {
        const isFinal = leave.status === "Approved" || leave.status === "Rejected";
        
        if ((filter === "Active" && !isFinal) || (filter === "History" && isFinal)) {
            const clone = template.content.cloneNode(true);
            const statusClass = leave.status.toLowerCase().replace(/\s+/g, '-');
            
            clone.querySelector('.col-emp').innerHTML = `<strong>${leave.name}</strong><br><small>${leave.role}</small>`;
            clone.querySelector('.col-type').innerText = leave.leaveType;
            clone.querySelector('.col-start').innerText = leave.startDate;
            clone.querySelector('.col-end').innerText = leave.endDate;
            clone.querySelector('.col-days').innerText = leave.numDays;
            clone.querySelector('.col-status').innerHTML = `<span class="status-pill ${statusClass}">${leave.status}</span>`;
            clone.querySelector('.col-reviewer').innerText = leave.reviewedBy || '---';
            
            clone.querySelector('.action-link').onclick = () => openViewModalByID(leave.id);
            body.appendChild(clone);
        }
    });

    if (body.innerHTML === "") {
        body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#888; padding:40px;">No leave records found.</td></tr>`;
    }
}

function openViewModalByID(id) {
    activeRowId = id;
    const leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
    const data = leaveData.find(l => l.id === id);
    if (!data) return;

    const isOwnRequest = (data.name === sdInfo.name);
    const isFinal = (data.status === "Approved" || data.status === "Rejected");
    const statusClass = data.status.toLowerCase().replace(/\s+/g, '-');

    // Fill Modal Fields
    document.getElementById('modalFileName').innerText = data.fileName || "Document.pdf";
    document.getElementById('modalSubmitDate').innerText = `${data.dateFiled} at ${data.submitTime || '---'}`;
    document.getElementById('modalReason').innerText = data.reason || "No reason provided.";
    document.getElementById('modalRemarks').innerText = data.reviewRemarks || "Awaiting action.";
    document.getElementById('modalReviewerText').innerText = `Reviewed by: ${data.reviewedBy || '---'}`;
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${statusClass}">${data.status}</span>`;

    // Toggle Action Buttons
    const actions = document.getElementById('modalActions');
    if (!isOwnRequest && !isFinal) {
        actions.style.display = "flex";
    } else {
        actions.style.display = "none";
    }

    // Preview logic
    const preview = document.querySelector('.pdf-placeholder');
    if (data.fileData) {
        preview.innerHTML = data.fileData.includes("image") 
            ? `<img src="${data.fileData}" style="width:100%; height:100%; object-fit:contain; border-radius:10px;">` 
            : `<embed src="${data.fileData}" width="100%" height="100%" style="border-radius:10px;">`;
    } else {
        preview.innerHTML = `<i class="fas fa-file-pdf"></i><p>No document attached</p>`;
    }

    document.getElementById('viewModal').style.display = 'flex';
}

function processSDDecision(decision) {
    let leaveData = JSON.parse(localStorage.getItem('allLeaveRequests')) || [];
    const index = leaveData.findIndex(l => l.id === activeRowId);
    if (index !== -1) {
        leaveData[index].status = decision; 
        leaveData[index].reviewedBy = sdInfo.name;
        leaveData[index].reviewRemarks = `Final decision: ${decision} by School Director ${sdInfo.name}.`;
        
        localStorage.setItem('allLeaveRequests', JSON.stringify(leaveData));
        location.reload();
    }
}

function closeViewModal() { 
    document.getElementById('viewModal').style.display = 'none'; 
}