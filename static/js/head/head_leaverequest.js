/* head_leaverequest.js */
const loggedHeadName = "Jose Brian Dela Peña"; 
let activeRowId = null; 

let headSampleData = []; // Will be populated dynamically from the database

document.addEventListener('DOMContentLoaded', () => {
    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');
    const menuItems = document.querySelectorAll('.menu-item');

    // --- TOOLTIP LABEL INITIALIZATION ---
    menuItems.forEach(item => {
        const span = item.querySelector('span');
        if (span) {
            item.setAttribute('data-text', span.innerText);
        }
    });

    // Sidebar Toggles
    document.getElementById('closeBtn').onclick = () => document.getElementById('sidebar').classList.add("collapsed");
    document.getElementById('logoToggle').onclick = () => document.getElementById('sidebar').classList.toggle("collapsed");

    tabRequests.onclick = () => {
        tabRequests.classList.add('active'); tabHistory.classList.remove('active');
        renderHeadTable("Active");
    };
    tabHistory.onclick = () => {
        tabHistory.classList.add('active'); tabRequests.classList.remove('active');
        renderHeadTable("History");
    };

    // Fetch real data from Django Backend
    const table = document.getElementById('employeeTable');
    const dataSourceUrl = table && table.dataset.sourceUrl ? table.dataset.sourceUrl : '/leaves/head/history/?format=json';

    fetch(dataSourceUrl, { headers: { 'Accept': 'application/json' } })
        .then(response => response.json())
        .then(data => {
            // Map Django's JSON format to match our table logic
            headSampleData = (data.history || []).map(item => ({
                id: item.id,
                name: loggedHeadName, 
                role: "Department Head",
                dateFiled: item.dateFiled || "---",
                submitTime: item.submitTime || "---",
                leaveType: item.leave_type__name || "General Leave",
                startDate: item.start_date,
                endDate: item.end_date,
                numDays: item.days_requested,
                // Convert backend 'PENDING_HR_APPROVAL' etc. to just 'Pending'
                status: item.status.includes('PENDING') ? 'Pending' : item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase(),
                reviewedBy: "---", // Update this later if you want real reviewer tracking
                reason: item.reason,
                fileName: "Document Attached",
                reviewRemarks: "Awaiting response"
            }));
            renderHeadTable("Active");
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            renderHeadTable("Active");
        });
});

function renderHeadTable(mode) {
    const body = document.getElementById('leaveTableBody');
    const template = document.getElementById('headRowTemplate');
    body.innerHTML = "";

    headSampleData.forEach((leave) => {
        const isFinal = (leave.status === "Approved" || leave.status === "Rejected");
        let shouldShow = (mode === "Active") ? !isFinal : isFinal;

        if (shouldShow) {
            const clone = template.content.cloneNode(true);
            const statusClass = leave.status.toLowerCase().replace(/\s+/g, '-');

            clone.querySelector('.col-emp').innerHTML = `<strong>${leave.name}</strong><br><small>${leave.role}</small>`;
            clone.querySelector('.col-type').innerText = leave.leaveType;
            clone.querySelector('.col-start').innerText = leave.startDate;
            clone.querySelector('.col-end').innerText = leave.endDate;
            clone.querySelector('.col-days').innerText = leave.numDays;
            clone.querySelector('.col-status').innerHTML = `<span class="status-pill ${statusClass}">${leave.status}</span>`;
            clone.querySelector('.col-reviewer').innerText = leave.reviewedBy || '---';
            
            clone.querySelector('.action-link').onclick = () => openHeadModal(leave.id);
            body.appendChild(clone);
        }
    });
}

function openHeadModal(id) {
    activeRowId = id; 
    const data = headSampleData.find(l => l.id === id);
    if (!data) return;

    const isOwnRequest = (data.name === loggedHeadName);
    const isFinal = (data.status === "Approved" || data.status === "Rejected");
    
    document.getElementById('modalFileName').innerText = data.fileName;
    document.getElementById('modalSubmitDate').innerText = `${data.dateFiled} at ${data.submitTime}`;
    document.getElementById('modalReason').innerText = data.reason;
    document.getElementById('modalRemarks').innerText = data.reviewRemarks;
    
    const statusClass = data.status.toLowerCase().replace(/\s+/g, '-');
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${statusClass}">${data.status}</span>`;
    document.getElementById('modalReviewerText').innerHTML = `<small>Reviewed by: ${data.reviewedBy}</small>`;

    // Reset visibility
    document.getElementById('modalActions').style.display = (!isOwnRequest && !isFinal) ? "flex" : "none";
    document.getElementById('viewModal').style.display = 'flex';
}

function processHeadRequest(decision) {
    const leaveIndex = headSampleData.findIndex(l => l.id === activeRowId);

    if (leaveIndex !== -1) {
        // 1. Update Data
        headSampleData[leaveIndex].status = decision;
        headSampleData[leaveIndex].reviewedBy = loggedHeadName;
        headSampleData[leaveIndex].reviewRemarks = `${decision} by Head on ${new Date().toLocaleDateString()}`;

        // 2. INSTANT MODAL UPDATE (Visual Feedback)
        const statusClass = decision.toLowerCase();
        document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${statusClass}">${decision}</span>`;
        document.getElementById('modalRemarks').innerText = headSampleData[leaveIndex].reviewRemarks;
        document.getElementById('modalActions').style.display = "none"; 

        // 3. INSTANT TABLE UPDATE
        const currentTab = document.getElementById('tab-requests').classList.contains('active') ? "Active" : "History";
        renderHeadTable(currentTab);

        // 4. Success Notification
        Swal.fire({
            icon: 'success',
            title: `Request ${decision}`,
            text: `The status was updated and recorded.`,
            confirmButtonColor: '#4a1d1d',
            timer: 2000 
        });
    }
}

function closeViewModal() { 
    document.getElementById('viewModal').style.display = 'none'; 
}