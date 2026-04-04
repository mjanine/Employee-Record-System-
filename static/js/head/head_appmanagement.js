/* ============================================================
   head_appmanagement.js
   Path: static/js/application_management/head_appmanagement.js
   ============================================================ */

const headName = 'Department Head';
const HEAD_STAGE = 'pending-head';
let activeAppId = null;

// ── Sample Data ───────────────────────────────────────────────────────
let appData = [
    {
        id: '001',
        name: 'Dela Cruz, Juan',
        dept: 'CCS',
        position: 'Instructor',
        submitted: '02/12/2026',
        progress: 'Stage 2 of 4',
        status: 'pending-hr',
        statusLabel: 'Pending - HR Evaluator',
        reviewedBy: '---',
        remarks: 'Awaiting HR evaluation.',
        fileName: 'Application_001.pdf'
    },
    {
        id: '002',
        name: 'Santos, Maria',
        dept: 'CBA',
        position: 'Professor',
        submitted: '02/15/2026',
        progress: 'Stage 1 of 4',
        status: 'pending-head',
        statusLabel: 'Pending - Dept. Head',
        reviewedBy: '---',
        remarks: 'Awaiting department head review.',
        fileName: 'Application_002.pdf'
    },
    {
        id: '003',
        name: 'Reyes, Ricardo',
        dept: 'COE',
        position: 'Registrar',
        submitted: '02/10/2026',
        progress: 'Completed',
        status: 'approved',
        statusLabel: 'Approved',
        reviewedBy: 'Department Head',
        remarks: 'Approved on ' + new Date().toLocaleDateString() + '.',
        fileName: 'Application_003.pdf'
    },
    {
        id: '004',
        name: 'Gomez, Patricia',
        dept: 'CAS',
        position: 'Assistant Professor',
        submitted: '03/01/2026',
        progress: 'Stage 3 of 4',
        status: 'pending-hr',
        statusLabel: 'Pending - HR Evaluator',
        reviewedBy: '---',
        remarks: 'Documents under review by HR.',
        fileName: 'Application_004.pdf'
    },
    {
        id: '005',
        name: 'Torres, Miguel',
        dept: 'CON',
        position: 'Clinical Instructor',
        submitted: '03/05/2026',
        progress: 'Completed',
        status: 'rejected',
        statusLabel: 'Rejected',
        reviewedBy: 'Department Head',
        remarks: 'Incomplete submission requirements.',
        fileName: 'Application_005.pdf'
    }
];

// ── Position Change Request Data ──────────────────────────────────────
let positionChangeData = [];

// Mock employee lookup
const employeeDirectory = {
    'dela cruz, juan':   { id: 'EMP-001', position: 'Instructor',         dept: 'CCS' },
    'santos, maria':     { id: 'EMP-002', position: 'Professor',           dept: 'CBA' },
    'reyes, ricardo':    { id: 'EMP-003', position: 'Registrar',           dept: 'COE' },
    'gomez, patricia':   { id: 'EMP-004', position: 'Assistant Professor', dept: 'CAS' },
    'torres, miguel':    { id: 'EMP-005', position: 'Clinical Instructor', dept: 'CON' },
    'johnson, alice':    { id: 'EMP-006', position: 'Senior Instructor',   dept: 'CAS' }
};

// ── Helpers ───────────────────────────────────────────────────────────
function isFinalStatus(status) {
    return status === 'approved' || status === 'rejected';
}

function canActOnApp(status) {
    return status === HEAD_STAGE;
}

function resetPositionForm() {
    document.getElementById('pcEmpName').value       = '';
    document.getElementById('pcEmpId').value         = '';
    document.getElementById('pcCurrentPos').value    = '';
    document.getElementById('pcDept').value          = '';
    document.getElementById('pcRequestedPos').value  = '';
    document.getElementById('pcEffectiveDate').value = '';
    document.getElementById('pcReason').value        = '';

    ['pcEmpName', 'pcRequestedPos', 'pcEffectiveDate', 'pcReason'].forEach(function (id) {
        document.getElementById(id).style.borderColor = '';
    });
}

function autoFillEmployee(name) {
    const key    = name.trim().toLowerCase();
    const emp    = employeeDirectory[key];
    const idEl   = document.getElementById('pcEmpId');
    const posEl  = document.getElementById('pcCurrentPos');
    const deptEl = document.getElementById('pcDept');

    if (emp) {
        idEl.value   = emp.id;
        posEl.value  = emp.position;
        deptEl.value = emp.dept;
    } else {
        idEl.value   = '';
        posEl.value  = '';
        deptEl.value = '';
    }
}

function generatePCRId() {
    return 'PCR-' + String(positionChangeData.length + 1).padStart(3, '0');
}

// ── Toast System ──────────────────────────────────────────────────────
function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    const icons = {
        approved: 'fas fa-check-circle',
        rejected: 'fas fa-times-circle',
        info:     'fas fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML =
        '<i class="' + icons[type] + ' toast-icon"></i>' +
        '<div class="toast-body">' +
            '<div class="toast-title">' + title + '</div>' +
            '<div class="toast-msg">' + message + '</div>' +
        '</div>' +
        '<button type="button" class="toast-close"><i class="fas fa-times"></i></button>' +
        '<div class="toast-progress"></div>';

    toast.querySelector('.toast-close').addEventListener('click', function () {
        removeToast(toast);
    });

    container.appendChild(toast);
    setTimeout(function () { removeToast(toast); }, 4000);
}

function removeToast(el) {
    if (!el || !el.parentElement) return;
    el.style.animation = 'toastOut 0.35s ease forwards';
    setTimeout(function () { el.remove(); }, 340);
}

// ── Render Table ──────────────────────────────────────────────────────
function renderTable(mode) {
    const body     = document.getElementById('applicationTableBody');
    const template = document.getElementById('appRowTemplate');
    body.innerHTML = '';

    const filtered = mode === 'Active'
        ? appData.filter(function (a) { return !isFinalStatus(a.status); })
        : appData.filter(function (a) { return  isFinalStatus(a.status); });

    if (filtered.length === 0) {
        body.innerHTML =
            '<tr><td colspan="8" class="no-records">No records found.</td></tr>';
        return;
    }

    filtered.forEach(function (app) {
        const clone   = template.content.cloneNode(true);
        const isFinal = isFinalStatus(app.status);
        const canAct  = canActOnApp(app.status);

        clone.querySelector('.col-id').innerText        = app.id;
        clone.querySelector('.col-name').innerText      = app.name;
        clone.querySelector('.col-dept').innerText      = app.dept;
        clone.querySelector('.col-position').innerText  = app.position;
        clone.querySelector('.col-submitted').innerText = app.submitted;
        clone.querySelector('.col-progress').innerText  = app.progress;
        clone.querySelector('.col-status').innerHTML    =
            '<span class="status-pill ' + app.status + '">' + app.statusLabel + '</span>';

        const actionsCell = clone.querySelector('.col-actions');

        if (isFinal) {
            // Completed — view only
            actionsCell.innerHTML = '<span class="action-link view-link-btn">View Details</span>';
            actionsCell.querySelector('.view-link-btn').addEventListener('click', function () {
                openModal(app.id);
            });
        } else if (canAct) {
            // Head's stage — show View + Update dropdown
            actionsCell.innerHTML =
                '<div class="actions-cell">' +
                    '<span class="action-link view-link-btn">View Details</span>' +
                    '<div class="dropdown">' +
                        '<button type="button" class="update-link">Update <i class="fas fa-caret-down"></i></button>' +
                        '<div class="dropdown-content">' +
                            '<a href="#" class="approve-option" data-id="' + app.id + '">Approve</a>' +
                            '<a href="#" class="reject-option"  data-id="' + app.id + '">Reject</a>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            actionsCell.querySelector('.view-link-btn').addEventListener('click', function () {
                openModal(app.id);
            });
            actionsCell.querySelector('.approve-option').addEventListener('click', function (e) {
                e.preventDefault();
                processApp(app.id, 'Approved');
            });
            actionsCell.querySelector('.reject-option').addEventListener('click', function (e) {
                e.preventDefault();
                processApp(app.id, 'Rejected');
            });
        } else {
            // Not Head's stage — view only, no Update dropdown
            actionsCell.innerHTML =
                '<div class="actions-cell">' +
                    '<span class="action-link view-link-btn">View Details</span>' +
                '</div>';
            actionsCell.querySelector('.view-link-btn').addEventListener('click', function () {
                openModal(app.id);
            });
        }

        body.appendChild(clone);
    });
}

// ── Open Modal ────────────────────────────────────────────────────────
function openModal(id) {
    activeAppId = id;
    const app = appData.find(function (a) { return a.id === id; });
    if (!app) return;

    document.getElementById('modalFileName').innerText        = app.fileName;
    document.getElementById('modalSubmitDate').innerText      = app.submitted;
    document.getElementById('modalDepartment').innerText      = app.dept;
    document.getElementById('modalPosition').innerText        = app.position;
    document.getElementById('modalProgress').innerText        = app.progress;
    document.getElementById('modalRemarks').innerText         = app.remarks;
    document.getElementById('modalReviewerText').innerHTML    = '<small>Reviewed by: ' + app.reviewedBy + '</small>';
    document.getElementById('modalStatusContainer').innerHTML =
        '<span class="status-pill ' + app.status + '">' + app.statusLabel + '</span>';
    document.getElementById('pdfPlaceholder').innerHTML       =
        '<i class="fas fa-file-pdf"></i><p>Preview for ' + app.fileName + '</p>';

    // Only show Approve/Reject if it's Head's stage
    document.getElementById('modalActions').style.display =
        (!isFinalStatus(app.status) && canActOnApp(app.status)) ? 'flex' : 'none';

    document.getElementById('viewModal').style.display = 'flex';
}

function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
}

// ── Process Application ───────────────────────────────────────────────
function processApp(id, decision) {
    const idx = appData.findIndex(function (a) { return a.id === id; });
    if (idx === -1) return;

    const app     = appData[idx];
    const dateStr = new Date().toLocaleDateString();

    // Guard: only allow action if it's Head's stage
    if (!canActOnApp(app.status)) {
        showToast('info', 'Action Not Allowed',
            'This application is not at the Department Head stage.');
        return;
    }

    if (decision === 'Approved') {
        app.status      = 'approved';
        app.statusLabel = 'Approved';
        app.progress    = 'Completed';
        app.reviewedBy  = headName;
        app.remarks     = 'Approved on ' + dateStr + '.';
        showToast('approved', 'Application Approved',
            app.name + "'s application has been successfully approved.");
    } else {
        app.status      = 'rejected';
        app.statusLabel = 'Rejected';
        app.progress    = 'Completed';
        app.reviewedBy  = headName;
        app.remarks     = 'Rejected on ' + dateStr + '.';
        showToast('rejected', 'Application Rejected',
            app.name + "'s application has been rejected.");
    }

    // Update modal live
    document.getElementById('modalStatusContainer').innerHTML =
        '<span class="status-pill ' + app.status + '">' + app.statusLabel + '</span>';
    document.getElementById('modalRemarks').innerText      = app.remarks;
    document.getElementById('modalReviewerText').innerHTML = '<small>Reviewed by: ' + app.reviewedBy + '</small>';
    document.getElementById('modalActions').style.display  = 'none';

    const currentMode = document.getElementById('tab-new').classList.contains('active')
        ? 'Active' : 'History';
    renderTable(currentMode);
}

// ── DOM Ready ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    const sidebar     = document.getElementById('sidebar');
    const logoToggle  = document.getElementById('logoToggle');
    const closeBtn    = document.getElementById('closeBtn');
    const tabNew      = document.getElementById('tab-new');
    const tabPosition = document.getElementById('tab-position');
    const posModal    = document.getElementById('positionChangeModal');
    const viewModal   = document.getElementById('viewModal');

    // Sidebar tooltips
    document.querySelectorAll('.menu-item').forEach(function (item) {
        const span = item.querySelector('span');
        if (span) item.setAttribute('data-text', span.textContent.trim());
    });

    // Sidebar toggle
    if (closeBtn)   closeBtn.onclick   = function () { sidebar.classList.add('collapsed'); };
    if (logoToggle) logoToggle.onclick = function () { sidebar.classList.toggle('collapsed'); };

    // Tab — Records
    tabNew.addEventListener('click', function () {
        tabNew.classList.add('active');
        tabPosition.classList.remove('active');
        renderTable('Active');
    });

    // Tab — Position Change Requests
    tabPosition.addEventListener('click', function () {
        tabPosition.classList.add('active');
        tabNew.classList.remove('active');
        posModal.style.display = 'flex';
    });

    // Auto-fill employee details
    document.getElementById('pcEmpName').addEventListener('blur', function () {
        autoFillEmployee(this.value);
    });

    // Save position change request
    document.getElementById('saveRequest').addEventListener('click', function () {
        var empName      = document.getElementById('pcEmpName').value.trim();
        var empId        = document.getElementById('pcEmpId').value.trim();
        var requestedPos = document.getElementById('pcRequestedPos').value;
        var effectDate   = document.getElementById('pcEffectiveDate').value;
        var reason       = document.getElementById('pcReason').value.trim();

        var valid = true;
        [
            { id: 'pcEmpName',       val: empName      },
            { id: 'pcRequestedPos',  val: requestedPos },
            { id: 'pcEffectiveDate', val: effectDate   },
            { id: 'pcReason',        val: reason       }
        ].forEach(function (field) {
            var el = document.getElementById(field.id);
            if (!field.val) {
                el.style.borderColor = '#dc3545';
                valid = false;
            } else {
                el.style.borderColor = '';
            }
        });

        if (!valid) {
            showToast('info', 'Incomplete Form', 'Please fill in all required fields.');
            return;
        }

        var currentPos = document.getElementById('pcCurrentPos').value.trim() || 'N/A';
        var dept       = document.getElementById('pcDept').value.trim()       || 'N/A';

        var newEntry = {
            id:           generatePCRId(),
            name:         empName,
            empId:        empId || 'N/A',
            dept:         dept,
            position:     currentPos,
            requestedPos: requestedPos,
            effectiveDate: effectDate,
            reason:       reason,
            submitted:    new Date().toLocaleDateString(),
            progress:     'Stage 1 of 3',
            status:       'pending-head',
            statusLabel:  'Pending - Dept. Head',
            reviewedBy:   '---',
            remarks:      'Position change request logged by ' + headName + '.',
            fileName:     'PCR_' + (positionChangeData.length + 1) + '.pdf'
        };

        positionChangeData.push(newEntry);
        appData.push(newEntry);

        posModal.style.display = 'none';
        resetPositionForm();
        tabNew.classList.add('active');
        tabPosition.classList.remove('active');
        renderTable('Active');

        showToast('info', 'Request Saved',
            'Position change request for ' + empName + ' has been logged successfully.');
    });

    // Modal approve / reject buttons
    document.getElementById('modalApproveBtn').addEventListener('click', function () {
        processApp(activeAppId, 'Approved');
    });
    document.getElementById('modalRejectBtn').addEventListener('click', function () {
        processApp(activeAppId, 'Rejected');
    });

    // Modal close
    document.getElementById('modalCloseBtn').addEventListener('click', closeViewModal);

    // Cancel position-change modal
    document.getElementById('cancelRequest').addEventListener('click', function () {
        posModal.style.display = 'none';
        resetPositionForm();
        tabNew.classList.add('active');
        tabPosition.classList.remove('active');
        renderTable('Active');
    });

    // Click outside modal to close
    window.addEventListener('click', function (e) {
        if (e.target === viewModal) closeViewModal();
        if (e.target === posModal) {
            posModal.style.display = 'none';
            resetPositionForm();
            tabNew.classList.add('active');
            tabPosition.classList.remove('active');
            renderTable('Active');
        }
    });

    // ESC key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeViewModal();
            posModal.style.display = 'none';
            resetPositionForm();
            tabNew.classList.add('active');
            tabPosition.classList.remove('active');
            renderTable('Active');
        }
    });

    // Live search
    document.getElementById('tableSearch').addEventListener('keyup', function (e) {
        const val = e.target.value.toLowerCase();
        document.querySelectorAll('#applicationTableBody tr').forEach(function (row) {
            row.style.display = row.innerText.toLowerCase().includes(val) ? '' : 'none';
        });
    });

    // Initial render
    renderTable('Active');
});