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

    // Activate/Deactivate Department
    document.querySelectorAll('.delete-dept, .deactivate-dept, .activate-dept').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const deptId = this.dataset.deptId;
            const action = this.dataset.action || (this.classList.contains('activate-dept') ? 'activate' : 'deactivate');
            confirmDepartmentStatusChange(deptId, action);
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

    // Head search floating menu behavior
    const headSearch = document.getElementById('headSearch');
    const headList = document.getElementById('headList');
    
    if (headSearch) {
        headSearch.addEventListener('keyup', searchHeads);
        headSearch.addEventListener('focus', function() {
            if (headList) headList.style.display = 'block';
        });
    }

    // Update search input when an option is selected
    document.querySelectorAll('.head-option input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked && headSearch) {
                const nameSpan = this.nextElementSibling.querySelector('.head-name');
                if (nameSpan) {
                    headSearch.value = nameSpan.textContent;
                }
                if (headList) headList.style.display = 'none';
            }
        });
    });

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
    updateDepartmentHeadAvailabilityInfo();
    
    modal.classList.add('show');
}

function updateDepartmentHeadAvailabilityInfo() {
    const headGroup = document.getElementById('headGroup');
    const headSelect = document.getElementById('deptHead');
    const infoElement = document.getElementById('deptHeadAvailabilityInfo');

    if (!headGroup || !headSelect || !infoElement) {
        return;
    }

    const totalUsers = Number(headGroup.dataset.totalUsers || 0);
    const eligibleUsers = Number(headGroup.dataset.eligibleUsers || 0);
    const availableHeads = Math.max(
        eligibleUsers,
        Array.from(headSelect.options).filter(option => option.value).length,
    );

    if (availableHeads > 0) {
        infoElement.style.display = 'none';
        infoElement.textContent = '';
        return;
    }

    if (totalUsers === 0) {
        infoElement.textContent = 'No users are available to assign as Department Head yet.';
    } else {
        infoElement.textContent = 'All eligible users are already assigned as Department Head.';
    }
    infoElement.style.display = 'block';
}

function closeDepartmentModal() {
    document.getElementById('departmentModal').classList.remove('show');
}

async function editDepartment(deptId) {
    currentEditingDeptId = deptId;
    try {
        const response = await fetch(`/accounts/get-department-data/${deptId}/`);
        
        if (!response.ok) {
            console.error("Server Error:", response.status);
            throw new Error('Failed to fetch department data.');
        }
        
        const data = await response.json();
        console.log("Success! Data received:", data);

        // 2. The ACTUAL Null-Safe DOM checks
        const titleLabel = document.getElementById('deptModalTitle');
        if (titleLabel) titleLabel.textContent = 'Edit Department';
        
        const idField = document.getElementById('deptId');
        if (idField) idField.value = deptId;
        
        const nameField = document.getElementById('deptName');
        if (nameField) nameField.value = data.name || '';
        
        // This fixes your teammate's buggy patch
        const collegeField = document.getElementById('deptCollege');
        if (collegeField) collegeField.value = data.college || '';
        
        const headField = document.getElementById('deptHead');
        if (headField) {
            if (data.head_id && !Array.from(headField.options).some(option => option.value === String(data.head_id))) {
                const preserved = document.createElement('option');
                preserved.value = data.head_id;
                preserved.textContent = 'Current head (already assigned)';
                headField.appendChild(preserved);
            }
            headField.value = data.head_id || '';
        }

        updateDepartmentHeadAvailabilityInfo();

        document.getElementById('departmentModal').classList.add('show');
        
    } catch (error) {
        // Now it will actually tell us WHY it failed in the console
        console.error("Edit Department Error:", error);
        showAlert('Error opening edit modal. Check console.', 'danger');
    }
}

function openAssignHeadModal(deptId) {
    const card = document.querySelector(`[data-dept-id="${deptId}"]`);
    const deptName = card?.querySelector('h3')?.textContent || 'this department';
    
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
    const headList = document.getElementById('headList');
    
    if (headList) headList.style.display = 'block';
    
    document.querySelectorAll('.head-option').forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

async function handleDepartmentFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const deptId = document.getElementById('deptId').value;
    const url = deptId ? `/accounts/edit-department/${deptId}/` : '/accounts/create-department/';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        const data = await response.json();
        if (response.ok) {
            showAlert(data.message, 'success');
            location.reload();
        } else {
            showAlert(data.message || 'Error saving department.', 'danger');
        }
    } catch (error) {
        showAlert('An unexpected error occurred.', 'danger');
    }
}

async function handleAssignHeadSubmit(e) {
    e.preventDefault();
    const deptId = document.getElementById('assignHeadDeptId').value;
    const headId = document.querySelector('input[name="head"]:checked')?.value;

    if (!headId) {
        showAlert('Please select a department head!', 'danger');
        return;
    }

    const formData = new FormData();
    formData.append('head', headId);
    const card = document.querySelector(`.department-card[data-dept-id="${deptId}"]`);
    const deptName = card.querySelector('h3').textContent;
    formData.append('name', deptName);

    try {
        const response = await fetch(`/accounts/edit-department/${deptId}/`, {
            method: 'POST',
            body: formData,
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        const data = await response.json();
        if (response.ok) {
            showAlert('Head assigned successfully!', 'success');
            location.reload();
        } else {
            showAlert('Error assigning head.', 'danger');
        }
    } catch (error) {
        showAlert('An unexpected error occurred.', 'danger');
    }
}

function filterDepartments(searchTerm) {
    // Filter Grid View
    document.querySelectorAll('#departmentsGrid .department-card[data-dept-id]').forEach(card => {
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
        document.querySelectorAll('#departmentsGrid .department-card[data-dept-id], .dept-row').forEach(el => {
            el.style.display = '';
        });
        return;
    }

    // Filter Grid View
    document.querySelectorAll('#departmentsGrid .department-card[data-dept-id]').forEach(card => {
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

function confirmDepartmentStatusChange(deptId, action = 'deactivate') {
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('confirmMessage');

    const isActivate = action === 'activate';
    message.textContent = isActivate
        ? 'Are you sure you want to activate this department? It will be available for new assignments again.'
        : 'Are you sure you want to deactivate this department? This will preserve existing records but prevent new assignments.';

    document.getElementById('confirmBtn').onclick = function() {
        toggleDepartmentStatus(deptId);
        closeConfirmModal();
    };

    modal.classList.add('show');
}

async function toggleDepartmentStatus(deptId) {
    try {
        const response = await fetch(`/accounts/deactivate-department/${deptId}/`, {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        const data = await response.json();
        if (response.ok) {
            showAlert(data.message, 'success');
            location.reload();
        } else {
            showAlert('Error updating department status.', 'danger');
        }
    } catch (error) {
        showAlert('An unexpected error occurred.', 'danger');
    }
}

// Backward-compatible wrapper for any older calls
function confirmDeleteDepartment(deptId) {
    confirmDepartmentStatusChange(deptId, 'deactivate');
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function executeConfirmedAction() {
    if (typeof confirmedAction !== 'undefined' && confirmedAction) {
        // Implementation logic if needed for this specific page
    }
}

function toggleDropdown(button) {
    const dropdown = button.closest('.action-cell');
    
    // Close all other dropdowns
    document.querySelectorAll('.action-cell.open').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
    });

    dropdown.classList.toggle('open');
}

function toggleCardDropdown(button) {
    const card = button.closest('.department-card');
    const dropdown = card?.querySelector('.dropdown-menu');
    
    // Close all other dropdowns
    document.querySelectorAll('.department-card .dropdown-menu').forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
    });

    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.action-cell') && 
        !e.target.closest('.department-card')) {
        document.querySelectorAll('.action-cell.open').forEach(d => d.classList.remove('open'));
        document.querySelectorAll('.department-card .dropdown-menu').forEach(d => {
            d.style.display = 'none';
        });
    }

    // Also close the custom head search dropdown when clicking outside
    const headList = document.getElementById('headList');
    if (headList && !e.target.closest('.head-selection')) {
        headList.style.display = 'none';
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
