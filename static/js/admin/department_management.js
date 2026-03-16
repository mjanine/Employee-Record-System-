/* =================================
   Department Management JavaScript
   ================================= */

let currentEditingDeptId = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeDepartmentManagement();
});

function initializeDepartmentManagement() {
    setupEventListeners();
    setupViewToggle();
    setupSearchAndFilters();
}

function setupEventListeners() {
    // Add Department Button
    document.getElementById('addDepartmentBtn')?.addEventListener('click', openDepartmentModal);

    // Edit Department Links
    document.querySelectorAll('.edit-dept').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const deptId = this.dataset.deptId;
            editDepartment(deptId);
        });
    });

    // Assign Head Links
    document.querySelectorAll('.assign-head').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const deptId = this.dataset.deptId;
            openAssignHeadModal(deptId);
        });
    });

    // Delete Department
    document.querySelectorAll('.delete-dept').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const deptId = this.dataset.deptId;
            confirmDeleteDepartment(deptId);
        });
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal .close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('show');
        });
    });

    // Form Submissions
    document.getElementById('departmentForm')?.addEventListener('submit', handleDepartmentFormSubmit);
    document.getElementById('assignHeadForm')?.addEventListener('submit', handleAssignHeadSubmit);

    // Head search
    document.getElementById('headSearch')?.addEventListener('keyup', searchHeads);

    // Confirm Modal Button
    document.getElementById('confirmBtn')?.addEventListener('click', executeConfirmedAction);
}

function setupViewToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            
            // Update active state
            toggleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Toggle views
            if (view === 'grid') {
                document.getElementById('departmentsGrid').style.display = 'grid';
                document.getElementById('departmentsTable').style.display = 'none';
            } else {
                document.getElementById('departmentsGrid').style.display = 'none';
                document.getElementById('departmentsTable').style.display = 'block';
            }
        });
    });
}

function setupSearchAndFilters() {
    document.getElementById('departmentSearch')?.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase();
        filterDepartments(searchTerm);
    });

    document.getElementById('headFilter')?.addEventListener('change', function() {
        const filterValue = this.value;
        filterDepartmentsByHead(filterValue);
    });
}

function openDepartmentModal() {
    const modal = document.getElementById('departmentModal');
    const form = document.getElementById('departmentForm');
    
    document.getElementById('deptModalTitle').textContent = 'Add Department';
    document.getElementById('deptId').value = '';
    form.reset();
    currentEditingDeptId = null;
    
    modal.classList.add('show');
}

function closeDepartmentModal() {
    document.getElementById('departmentModal').classList.remove('show');
}

function editDepartment(deptId) {
    currentEditingDeptId = deptId;
    
    const card = document.querySelector(`[data-dept-id="${deptId}"]`);
    const deptName = card?.querySelector('h3')?.textContent || '';

    document.getElementById('deptModalTitle').textContent = 'Edit Department';
    document.getElementById('deptId').value = deptId;
    document.getElementById('deptName').value = deptName;

    document.getElementById('departmentModal').classList.add('show');
}

function openAssignHeadModal(deptId) {
    const card = document.querySelector(`[data-dept-id="${deptId}"]`);
    const deptName = card?.querySelector('h3')?.textContent || '';
    
    document.getElementById('assignHeadDeptId').value = deptId;
    document.getElementById('deptNameDisplay').textContent = `Department: ${deptName}`;
    document.getElementById('assignHeadForm').reset();
    document.getElementById('headSearch').value = '';
    
    document.getElementById('assignHeadModal').classList.add('show');
}

function closeAssignHeadModal() {
    document.getElementById('assignHeadModal').classList.remove('show');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('show');
}

function searchHeads(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    document.querySelectorAll('.head-option').forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function handleDepartmentFormSubmit(e) {
    e.preventDefault();

    const deptName = document.getElementById('deptName').value.trim();

    if (!deptName) {
        showAlert('Department name is required!', 'danger');
        return;
    }

    // Submit form (in real app, would send to backend)
    console.log('Submitting department form:', new FormData(this));
    showAlert(currentEditingDeptId ? 'Department updated successfully!' : 'Department created successfully!', 'success');
    closeDepartmentModal();
}

function handleAssignHeadSubmit(e) {
    e.preventDefault();

    const deptId = document.getElementById('assignHeadDeptId').value;
    const headId = document.querySelector('input[name="head_id"]:checked')?.value;

    if (!headId) {
        showAlert('Please select a department head!', 'danger');
        return;
    }

    // Submit head assignment (in real app, would send to backend)
    console.log('Assigning head:', {deptId, headId});
    showAlert('Department head assigned successfully!', 'success');
    closeAssignHeadModal();
}

function filterDepartments(searchTerm) {
    // Filter Grid View
    document.querySelectorAll('.department-card').forEach(card => {
        const deptName = card.querySelector('h3')?.textContent.toLowerCase() || '';
        card.style.display = deptName.includes(searchTerm) ? '' : 'none';
    });

    // Filter Table View
    document.querySelectorAll('.dept-row').forEach(row => {
        const rowText = row.textContent.toLowerCase();
        row.style.display = rowText.includes(searchTerm) ? '' : 'none';
    });
}

function filterDepartmentsByHead(filterValue) {
    if (filterValue === '') {
        // Show all
        document.querySelectorAll('.department-card, .dept-row').forEach(el => {
            el.style.display = '';
        });
        return;
    }

    // Filter Grid View
    document.querySelectorAll('.department-card').forEach(card => {
        const hasHead = !card.querySelector('.unassigned');
        const show = (filterValue === 'assigned' && hasHead) || 
                     (filterValue === 'unassigned' && !hasHead);
        card.style.display = show ? '' : 'none';
    });

    // Filter Table View
    document.querySelectorAll('.dept-row').forEach(row => {
        const hasUnassigned = row.textContent.includes('Not Assigned');
        const show = (filterValue === 'assigned' && !hasUnassigned) || 
                     (filterValue === 'unassigned' && hasUnassigned);
        row.style.display = show ? '' : 'none';
    });
}

function confirmDeleteDepartment(deptId) {
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('confirmMessage');
    
    message.textContent = 'Are you sure you want to delete this department? This action cannot be undone.';
    
    document.getElementById('confirmBtn').onclick = function() {
        deleteDepartment(deptId);
        closeConfirmModal();
    };

    modal.classList.add('show');
}

function deleteDepartment(deptId) {
    // Remove from grid view
    const card = document.querySelector(`[data-dept-id="${deptId}"]`);
    card?.remove();

    // Remove from table view
    const row = document.querySelector(`tr[data-dept-id="${deptId}"]`);
    row?.remove();

    console.log(`Deleting department ${deptId}`);
    showAlert('Department deleted successfully!', 'success');
}

function executeConfirmedAction() {
    // This is handled by individual action handlers
}

function toggleDropdown(button) {
    const dropdown = button.closest('.action-dropdown');
    
    // Close all other dropdowns
    document.querySelectorAll('.action-dropdown.open').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
    });

    dropdown.classList.toggle('open');
}

function toggleCardDropdown(button) {
    const cardMenu = button.closest('.card-menu');
    const dropdown = cardMenu?.querySelector('.dropdown-menu');
    
    // Close all other dropdowns
    document.querySelectorAll('.card-menu .dropdown-menu').forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
    });

    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.action-dropdown') && 
        !e.target.closest('.card-menu')) {
        document.querySelectorAll('.action-dropdown.open, .card-menu .dropdown-menu').forEach(d => {
            d.classList.remove('open');
            if (d.classList.contains('dropdown-menu')) {
                d.style.display = 'none';
            }
        });
    }
});

function showAlert(message, type = 'info') {
    // Create a simple alert (in real app, would use a toast notification library)
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.innerHTML = `<i class="fas fa-info-circle"></i> <span>${message}</span>`;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '2000';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}
