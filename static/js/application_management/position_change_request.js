/* ============================================================
   position_change_request.js
   ============================================================ */

// ── Mock employee lookup ──
const employeeDirectory = {
    'dela cruz, juan':   { id: 'EMP-001', email: 'jdelacruz@uphsd.edu', phone: '+63-2-8891-5000', position: 'Instructor',         dept: 'CCS' },
    'santos, maria':     { id: 'EMP-002', email: 'msantos@uphsd.edu', phone: '+63-2-8891-5001', position: 'Professor',           dept: 'CBA' },
    'reyes, ricardo':    { id: 'EMP-003', email: 'rreyes@uphsd.edu', phone: '+63-2-8891-5002', position: 'Registrar',           dept: 'COE' },
    'gomez, patricia':   { id: 'EMP-004', email: 'pgomez@uphsd.edu', phone: '+63-2-8891-5003', position: 'Assistant Professor', dept: 'CAS' },
    'torres, miguel':    { id: 'EMP-005', email: 'mtorres@uphsd.edu', phone: '+63-2-8891-5004', position: 'Clinical Instructor', dept: 'CON' },
    'johnson, alice':    { id: 'EMP-006', email: 'ajohnson@uphsd.edu', phone: '+63-2-8891-5005', position: 'Senior Instructor',   dept: 'CAS' }
};

let positionChangeRequests = [];

// ── Helper Functions ──
function generatePCRId() {
    return 'PCR-' + new Date().getFullYear() + '-' + String(positionChangeRequests.length + 1).padStart(4, '0');
}

function autoFillEmployee(name) {
    const key = name.trim().toLowerCase();
    const emp = employeeDirectory[key];
    const idEl = document.getElementById('empId');
    const deptEl = document.getElementById('currentDept');
    const posEl = document.getElementById('currentPos');

    if (emp) {
        idEl.value = emp.id;
        deptEl.value = emp.dept;
        posEl.value = emp.position;
    } else {
        idEl.value = '';
        deptEl.value = '';
        posEl.value = '';
    }
}

function resetForm() {
    document.getElementById('empName').value = '';
    document.getElementById('empId').value = '';
    document.getElementById('currentDept').value = '';
    document.getElementById('currentPos').value = '';
    document.getElementById('requestedPos').value = '';
    document.getElementById('effectiveDate').value = '';
    document.getElementById('reason').value = '';

    // Clear validation highlights
    ['empName', 'requestedPos', 'effectiveDate', 'reason'].forEach(function (id) {
        document.getElementById(id).style.borderColor = '';
        document.getElementById(id).style.boxShadow = '';
    });
}

function validateForm() {
    const empName = document.getElementById('empName').value.trim();
    const requestedPos = document.getElementById('requestedPos').value.trim();
    const effectiveDate = document.getElementById('effectiveDate').value;
    const reason = document.getElementById('reason').value.trim();

    const errors = [];
    const errorFields = [];

    if (!empName) {
        errors.push('Please enter employee name.');
        errorFields.push('empName');
    }

    if (!requestedPos) {
        errors.push('Please select a requested position.');
        errorFields.push('requestedPos');
    }

    if (!effectiveDate) {
        errors.push('Please select an effective date.');
        errorFields.push('effectiveDate');
    }

    if (!reason) {
        errors.push('Please provide a reason for the position change.');
        errorFields.push('reason');
    }

    if (errors.length > 0) {
        errorFields.forEach(function (id) {
            document.getElementById(id).style.borderColor = '#dc3545';
            document.getElementById(id).style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
        });
        showToast('error', 'Validation Error', errors.join(' '));
        return false;
    }

    return true;
}

// ── Toast System ──
function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML =
        '<i class="' + icons[type] + ' toast-icon"></i>' +
        '<div class="toast-body">' +
            '<div class="toast-title">' + title + '</div>' +
            '<div class="toast-msg">' + message + '</div>' +
        '</div>' +
        '<button class="toast-close" id="toastCloseBtn"><i class="fas fa-times"></i></button>';

    toast.querySelector('#toastCloseBtn').addEventListener('click', function () {
        removeToast(toast);
    });

    container.appendChild(toast);
    setTimeout(function () { removeToast(toast); }, 4000);
}

function removeToast(el) {
    if (!el || !el.parentElement) return;
    el.style.animation = 'toastOut 0.35s ease forwards';
    setTimeout(function () { el.remove(); }, 350);
}

// ── Render Table ──
function renderTable() {
    const tbody = document.getElementById('tableBody');
    
    if (positionChangeRequests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-records">No position change requests yet. Click "New Request" to create one.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    positionChangeRequests.forEach(function (req) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${req.id}</strong></td>
            <td>${req.empName}</td>
            <td>${req.currentDept}</td>
            <td>${req.currentPos}</td>
            <td>${req.requestedPos}</td>
            <td>${req.effectiveDate}</td>
            <td>${req.submittedDate}</td>
            <td><span class="status-pill pending">${req.status}</span></td>
            <td><a class="action-link" onclick="openModal('${req.id}')">View</a></td>
        `;
        tbody.appendChild(row);
    });
}

// ── Modal Functions ──
function openModal() {
    const modal = document.getElementById('requestModal');
    modal.classList.add('active');
    resetForm();
}

function closeModal() {
    const modal = document.getElementById('requestModal');
    modal.classList.remove('active');
}

// ── Form Submission ──
function submitRequest() {
    if (!validateForm()) {
        return;
    }

    const empName = document.getElementById('empName').value.trim();
    const empId = document.getElementById('empId').value;
    const currentPos = document.getElementById('currentPos').value;
    const currentDept = document.getElementById('currentDept').value;
    const requestedPos = document.getElementById('requestedPos').value;
    const effectiveDate = document.getElementById('effectiveDate').value;
    const reason = document.getElementById('reason').value.trim();

    const newRequest = {
        id: generatePCRId(),
        empName: empName,
        empId: empId,
        currentPos: currentPos,
        currentDept: currentDept,
        requestedPos: requestedPos,
        effectiveDate: effectiveDate,
        reason: reason,
        submittedDate: new Date().toLocaleDateString(),
        status: 'Pending'
    };

    positionChangeRequests.push(newRequest);

    showToast('success', 'Request Submitted',
        'Position change request ' + newRequest.id + ' has been submitted successfully.');

    renderTable();
    setTimeout(function () {
        closeModal();
    }, 1500);
}

// ── DOM Ready ──
document.addEventListener('DOMContentLoaded', function () {
    const empNameEl = document.getElementById('empName');
    const cancelBtn = document.getElementById('cancelRequest');
    const submitBtn = document.getElementById('submitRequest');
    const newRequestBtn = document.getElementById('newRequestBtn');
    const modal = document.getElementById('requestModal');

    // Open modal on new request
    if (newRequestBtn) {
        newRequestBtn.addEventListener('click', openModal);
    }

    // Close modal on cancel
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    // Close modal on overlay click
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Auto-fill employee details
    empNameEl.addEventListener('blur', function () {
        autoFillEmployee(empNameEl.value);
    });

    // Clear validation error styling on input
    ['empName', 'requestedPos', 'effectiveDate', 'reason'].forEach(function (id) {
        document.getElementById(id).addEventListener('input', function () {
            this.style.borderColor = '';
            this.style.boxShadow = '';
        });
        document.getElementById(id).addEventListener('change', function () {
            this.style.borderColor = '';
            this.style.boxShadow = '';
        });
    });

    // Submit button
    if (submitBtn) {
        submitBtn.addEventListener('click', submitRequest);
    }

    // Allow Enter key to submit in reason textarea
    document.getElementById('reason').addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') {
            submitRequest();
        }
    });

    // Initial render
    renderTable();
});
