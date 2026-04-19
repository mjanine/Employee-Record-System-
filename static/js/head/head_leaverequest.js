/* head_leaverequest.js */
let activeRowId = null; 

let headSampleData = []; // Will be populated dynamically from the database
let currentUserId = null;

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

    fetch(dataSourceUrl, { headers: { 'Accept': 'application/json' }, cache: 'no-store' })
        .then(response => response.json())
        .then(data => {
            if (data.current_user_id) {
                currentUserId = data.current_user_id;
            }
            // Map Django's JSON format to match our table logic
            headSampleData = (data.history || []).map(item => {
                let rawStatusUpper = (item.status || "").toUpperCase();
                let displayStatus = item.status;
                
                if (rawStatusUpper === 'APPROVED') displayStatus = 'Approved';
                else if (rawStatusUpper === 'REJECTED') displayStatus = 'Rejected';
                else if (rawStatusUpper === 'CANCELLED') displayStatus = 'Cancelled';
                else if (rawStatusUpper.includes('PENDING_HR')) displayStatus = 'Pending HR Approval';
                else if (rawStatusUpper.includes('PENDING_SD')) displayStatus = 'Pending SD Approval';
                else if (rawStatusUpper.includes('PENDING_HEAD')) displayStatus = 'Pending Head Approval';
                else displayStatus = 'Pending';
                
                let dynamicRemarks = item.head_remarks;
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
                    reviewedBy: item.reviewed_by_head__first_name ? `${item.reviewed_by_head__first_name} ${item.reviewed_by_head__last_name}` : "---",
                    reason: item.reason,
                    fileName: item.attachment ? "Document Attached" : "No Document Attached",
                    reviewRemarks: dynamicRemarks
                };
            });
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

    if (!body || !template) {
        console.error("Critical rendering error: Required HTML structure is missing.");
        return;
    }

    body.innerHTML = "";

    headSampleData.forEach((leave) => {
        const isActionable = leave.rawStatus && leave.rawStatus.includes("PENDING_HEAD") && leave.userId !== currentUserId;
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
            
            clone.querySelector('.action-link').onclick = () => openHeadModal(leave.id);
            body.appendChild(clone);
        }
    });

    if (body.innerHTML === "") {
        body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#888; padding:40px;">No leave records found.</td></tr>`;
    }
}

function openHeadModal(id) {
    activeRowId = id; 
    const data = headSampleData.find(l => l.id === id);
    if (!data) return;

    const isOwnRequest = (data.userId === currentUserId);
    const isActionable = data.rawStatus && data.rawStatus.includes("PENDING_HEAD");
    
    document.getElementById('modalFileName').innerText = data.fileName;
    document.getElementById('modalSubmitDate').innerText = `${data.dateFiled} at ${data.submitTime}`;
    document.getElementById('modalReason').innerText = data.reason;
    document.getElementById('modalRemarks').innerText = data.reviewRemarks;
    
    let statusClass = data.status.toLowerCase().replace(/\s+/g, '-');
    if (statusClass.includes('pending')) statusClass = 'pending';
    document.getElementById('modalStatusContainer').innerHTML = `<span class="status-pill ${statusClass}">${data.status}</span>`;
    document.getElementById('modalReviewerText').innerHTML = `<small>Reviewed by: ${data.reviewedBy}</small>`;

    // Reset visibility
    document.getElementById('modalActions').style.display = (!isOwnRequest && isActionable) ? "flex" : "none";
    document.getElementById('viewModal').style.display = 'flex';
}

function processHeadRequest(decision) {
    if (!activeRowId) return;

    let actionStr = decision.trim().toUpperCase(); 
    if (actionStr === 'APPROVED') actionStr = 'APPROVE';
    if (actionStr === 'REJECTED') actionStr = 'REJECT';

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/leaves/head/approve/${activeRowId}/`;

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

    form.innerHTML = `
        <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
        <input type="hidden" name="action" value="${actionStr}">
        <input type="hidden" name="remarks" value="Processed by Head via Dashboard">
    `;

    document.body.appendChild(form);

        Swal.fire({
            icon: 'success',
            title: `Request ${decision}`,
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