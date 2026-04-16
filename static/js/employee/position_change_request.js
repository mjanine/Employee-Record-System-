/* position_change_request.js */
const empInfo = { name: "John Smith" };

// ── Mock employee directory ──
const employeeDirectory = {
    'dela cruz, juan': { id: 'EMP-001', position: 'Instructor',          dept: 'CCS' },
    'santos, maria':   { id: 'EMP-002', position: 'Professor',            dept: 'CBA' },
    'reyes, ricardo':  { id: 'EMP-003', position: 'Registrar',            dept: 'COE' },
    'gomez, patricia': { id: 'EMP-004', position: 'Assistant Professor',  dept: 'CAS' },
    'torres, miguel':  { id: 'EMP-005', position: 'Clinical Instructor',  dept: 'CON' },
    'johnson, alice':  { id: 'EMP-006', position: 'Senior Instructor',    dept: 'CAS' }
};

document.addEventListener('DOMContentLoaded', () => {
    const sidebar        = document.getElementById('sidebar');
    const logoToggle     = document.getElementById('logoToggle');
    const closeBtn       = document.getElementById('closeBtn');
    const menuItems      = document.querySelectorAll('.menu-item');
    const tabNewRequest  = document.getElementById('tabNewRequest');
    const positionForm   = document.getElementById('positionForm');
    const empNameInput   = document.getElementById('empName');
    const cancelBtn      = document.getElementById('cancelBtn');
    const submitBtn      = document.getElementById('submitBtn');
    const recordsBtn     = document.getElementById('recordsBtn');
    const newRequestContainer = document.getElementById('newRequestContainer');
    const recordsContainer    = document.getElementById('recordsContainer');

    // ── Static modal elements (defined in HTML) ──
    const cancelModal      = document.getElementById('cancelModal');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const stayBtn          = document.getElementById('stayBtn');

    // Initialize tooltip labels for collapsed sidebar
    menuItems.forEach(item => {
        const span = item.querySelector('span');
        if (span) item.setAttribute('data-text', span.innerText);
    });

    // Sidebar toggle
    if (closeBtn)   closeBtn.onclick   = () => sidebar.classList.add('collapsed');
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle('collapsed');

    // Auto-fill employee details on blur
    empNameInput.addEventListener('blur', () => {
        const key = empNameInput.value.trim().toLowerCase();
        const emp = employeeDirectory[key];

        document.getElementById('empId').value      = emp ? emp.id       : '';
        document.getElementById('currentPos').value = emp ? emp.position : '';
        document.getElementById('currentDept').value = emp ? emp.dept    : '';
    });

    // ── Cancel button → show static modal ──
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            cancelModal.classList.add('active');
        });
    }

    // "YES, CANCEL" → reset form and close modal
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', () => {
            cancelModal.classList.remove('active');
            resetForm();
        });
    }

    // "NO, STAY" → just close modal
    if (stayBtn) {
        stayBtn.addEventListener('click', () => {
            cancelModal.classList.remove('active');
        });
    }

    if (tabNewRequest && recordsBtn && newRequestContainer && recordsContainer) {
        const showNewRequest = () => {
            newRequestContainer.style.display = '';
            recordsContainer.style.display = 'none';
            tabNewRequest.classList.add('active');
            recordsBtn.classList.remove('active');
        };

        const showRecords = () => {
            newRequestContainer.style.display = 'none';
            recordsContainer.style.display = '';
            tabNewRequest.classList.remove('active');
            recordsBtn.classList.add('active');
        };

        tabNewRequest.addEventListener('click', showNewRequest);
        recordsBtn.addEventListener('click', showRecords);
    }

    // Close modal on backdrop click
    cancelModal.addEventListener('click', (e) => {
        if (e.target === cancelModal) {
            cancelModal.classList.remove('active');
        }
    });

    // ── Submit form ──
    if (positionForm) {
        positionForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(positionForm);

            // Basic client-side validation based on your Django form fields
            if (!formData.get('target_position') || !formData.get('target_department') || !formData.get('applicant_info')) {
                showToast('Please fill in all required fields.');
                return;
            }

            try {
                // The form's 'action' attribute should point to the Django URL.
                // The CSRF token should be in a hidden input within the form.
                const response = await fetch(positionForm.action, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    showSuccessNotification('Your position change request has been successfully submitted.');
                    // Reload the page after a short delay to see the success message from Django.
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast('An error occurred on the server. Please try again.');
                    console.error('Server responded with an error:', response.statusText);
                }
            } catch (error) {
                showToast('A network error occurred. Please check your connection.');
                console.error('Fetch error:', error);
            }
        });
    }

    function resetForm() {
        document.getElementById('positionForm').reset();
        document.getElementById('empId').value       = '';
        document.getElementById('currentPos').value  = '';
        document.getElementById('currentDept').value = '';
    }
});

// ── Success Notification (toast) ──
function showSuccessNotification(message) {
    const container = getToastContainer();

    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `
        <i class="fas fa-check-circle toast-icon"></i>
        <div class="toast-content">
            <h4>Position Change Request Submitted</h4>
            <p>${message}</p>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    attachToastClose(toast);
    container.appendChild(toast);
    autoRemoveToast(toast);
}

// ── Error Toast ──
function showToast(message) {
    const container = getToastContainer();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = '#ef4444';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle toast-icon" style="color:#ef4444;"></i>
        <div class="toast-content">
            <h4>Validation Error</h4>
            <p>${message}</p>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    attachToastClose(toast);
    container.appendChild(toast);
    autoRemoveToast(toast);
}

function getToastContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
        c = document.createElement('div');
        c.id = 'toast-container';
        document.body.appendChild(c);
    }
    return c;
}

function attachToastClose(toast) {
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'toastExit 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    });
}

function autoRemoveToast(toast) {
    setTimeout(() => {
        toast.style.animation = 'toastExit 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}