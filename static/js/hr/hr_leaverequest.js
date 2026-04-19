/* hr_leaverequest.js */
let activeRowId = null;

let leaveData = [];
let currentUserId = null;

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const tabRequests = document.getElementById('tab-requests');
    const tabHistory = document.getElementById('tab-history');

    // Sidebar Tooltips Initialization
    document.querySelectorAll('.menu-item').forEach(item => {
        const span = item.querySelector("span");
        if (span) item.setAttribute("data-text", span.textContent.trim());
    });

    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add("collapsed");
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle("collapsed");

    // Tab Navigation
    tabRequests.onclick = () => {
        tabRequests.classList.add('active'); tabHistory.classList.remove('active');
        renderHRTable("Active");
    };
    tabHistory.onclick = () => {
        tabHistory.classList.add('active'); tabRequests.classList.remove('active');
        renderHRTable("History");
    };

    // Fetch real data from Django Backend
    const table = document.getElementById('employeeTable');
    const dataSourceUrl = table && table.dataset.sourceUrl ? table.dataset.sourceUrl : '/leaves/hr/history/?format=json';

    fetch(dataSourceUrl, { headers: { 'Accept': 'application/json' }, cache: 'no-store' })
        .then(response => response.json())
        .then(data => {
            if (data.current_user_id) {
                currentUserId = data.current_user_id;
            }
            leaveData = (data.history || []).map(item => {
                let rawStatusUpper = (item.status || "").toUpperCase();
                let displayStatus = item.status;
                if (rawStatusUpper === 'APPROVED') displayStatus = 'Approved';
                else if (rawStatusUpper === 'REJECTED') displayStatus = 'Rejected';
                else if (rawStatusUpper === 'CANCELLED') displayStatus = 'Cancelled';
                else if (rawStatusUpper.includes('PENDING_SD')) displayStatus = 'Pending SD Approval';
                else if (rawStatusUpper.includes('PENDING_HEAD')) displayStatus = 'Pending Head Approval';
                else displayStatus = 'Pending';
                
                let dynamicRemarks = item.hr_remarks;
                if (!dynamicRemarks) {
                    if (rawStatusUpper.includes('PENDING_HEAD')) dynamicRemarks = "Awaiting Department Head review";
                    else if (rawStatusUpper.includes('PENDING_HR')) dynamicRemarks = "Awaiting HR review";
                    else if (rawStatusUpper.includes('PENDING_SD')) dynamicRemarks = "Awaiting School Director review";
                    else dynamicRemarks = "Awaiting response";
                }

                return {
                    id: item.id,
                    userId: item.user__id,
                    name: item.name || "Unknown", 
                    role: item.user__role || "Employee",
                    dateFiled: item.dateFiled || "---",
                    submitTime: item.submitTime || "---",
                    leaveType: item.leave_type__name || "General Leave",
                    startDate: item.start_date,
                    endDate: item.end_date,
                    numDays: item.days_requested,
                    status: displayStatus,
                    rawStatus: rawStatusUpper,
                    reviewedBy: item.reviewed_by_hr__first_name ? `${item.reviewed_by_hr__first_name} ${item.reviewed_by_hr__last_name}` : "---", 
                    reason: item.reason,
                    fileName: item.attachment ? "Document Attached" : "No Document Attached",
                    reviewRemarks: dynamicRemarks
                };
            });
            renderHRTable("Active");
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            renderHRTable("Active");
        });

    // Real-time Search
    document.getElementById('tableSearch').addEventListener('keyup', (e) => {
        const val = e.target.value.toLowerCase();
        document.querySelectorAll('tbody tr').forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
        });
    });
});

function renderHRTable(mode) {
    const body = document.getElementById('leaveTableBody');
    const template = document.getElementById('hrRowTemplate');
    if (!body || !template) return;
    body.innerHTML = "";

    leaveData.forEach((leave) => {
        // HR's "Final Approval" queue processes PENDING_HR.
        // It also catches PENDING_HEAD requests from HEAD/HR users since they don't have a standard Head approver.
        const isActionable = leave.rawStatus && (leave.rawStatus.includes("PENDING_HR") || (leave.rawStatus.includes("PENDING_HEAD") && leave.role !== "EMP" && leave.role !== "Employee"));
        let shouldShow = (mode === "Active") ? isActionable : !isActionable;

        if (shouldShow) {
            const clone = template.content.cloneNode(true);
            let statusClass = leave.status.toLowerCase().replace(/\s+/g, '-');
            if (statusClass.includes('pending')) statusClass = 'pending';
            
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

    const isOwnRequest = (data.userId === currentUserId);
    const isSDRequest = (data.role === "SD" || data.role === "School Director");
    const isActionable = data.rawStatus && (data.rawStatus.includes("PENDING_HR") || (data.rawStatus.includes("PENDING_HEAD") && data.role !== "EMP" && data.role !== "Employee"));
    let statusClass = data.status.toLowerCase().replace(/\s+/g, '-');
    if (statusClass.includes('pending')) statusClass = 'pending';

    document.getElementById('modalFileName').innerText = data.fileName;
    document.getElementById('modalSubmitDate').innerText = `${data.dateFiled} at ${data.submitTime}`;
    document.getElementById('modalReason').innerText = data.reason;
    document.getElementById('modalRemarks').innerText = data.reviewRemarks;
    document.getElementById('modalReviewerText').innerHTML = `<small>Reviewed by: ${data.reviewedBy}</small>`;
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${statusClass}">${data.status}</span>`;

    // --- UPDATED CREDITS LOGIC ---
    const creditsBlock = document.getElementById('creditsBlock');
    if (data.leaveType === "Sick Leave") {
        creditsBlock.style.display = "block";
        // Dynamically calculate based on the 15 baseline
        const remaining = 15 - data.numDays;
        document.getElementById('modalCredits').innerText = `${remaining} Days Remaining`;
    } else {
        creditsBlock.style.display = "none";
    }

    // Toggle Action Buttons
    const actions = document.getElementById('modalActions');
    if (!isActionable || isOwnRequest || isSDRequest) {
        actions.style.display = "none";
    } else {
        actions.style.display = "flex";
    }

    const preview = document.querySelector('.pdf-placeholder');
    preview.innerHTML = `<i class="fas fa-file-pdf"></i><p>Preview for ${data.fileName}</p>`;

    document.getElementById('viewModal').style.display = 'flex';
}

function processRequest(status) {
    if (!activeRowId) return;

    // Map status "Approved" or "Rejected" to the expected backend action
    let actionStr = status.trim().toUpperCase(); 
    if (actionStr === 'APPROVED') actionStr = 'APPROVE';
    if (actionStr === 'REJECTED') actionStr = 'REJECT';

    // Build a form dynamically to submit to the Django backend
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/leaves/hr/approve/${activeRowId}/`;

    let csrfToken = '';
    const csrfTokenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    if (csrfTokenInput && csrfTokenInput.value) {
        csrfToken = csrfTokenInput.value;
    } else {
        const name = 'csrftoken';
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    csrfToken = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
    }

    if (!csrfToken) {
        console.error("CSRF token not found.");
        Swal.fire({ icon: 'error', title: 'Security Error', text: 'CSRF token missing.', confirmButtonColor: '#4a1d1d' });
        return;
    }

    // Append required fields (csrf_token, action, and remarks) to the form
    form.innerHTML = `
        <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
        <input type="hidden" name="action" value="${actionStr}">
        <input type="hidden" name="remarks" value="Processed by HR via Dashboard">
    `;

    document.body.appendChild(form);

    // Show the notification, then actually submit to the database!
    Swal.fire({
        icon: 'success',
        title: `Request ${status}`,
        text: `Saving decision to database...`,
        confirmButtonColor: '#4a1d1d',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        form.submit();
    });
}

function closeViewModal() { 
    document.getElementById('viewModal').style.display = 'none'; 
}