/* =================================
   User Management JavaScript
   ================================= */

let currentEditingUserId = null;
let selectedUsers = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeUserManagement();
});

function initializeUserManagement() {
    setupEventListeners();
    setupFilterListeners();
    setupTableCheckboxes();
}

function setupEventListeners() {
    // Create User Button
    document.getElementById('createUserBtn')?.addEventListener('click', openUserModal);

    // Edit User Links
    document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.dataset.userId;
            editUser(userId);
        });
    });

    // Assign Role Links
    document.querySelectorAll('.assign-role').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.dataset.userId;
            openAssignRoleModal(userId);
        });
    });

    // Reset Password Links
    document.querySelectorAll('.reset-password').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.dataset.userId;
            openResetPasswordModal(userId);
        });
    });

    // Activate/Deactivate User
    document.querySelectorAll('.deactivate-user, .activate-user').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.dataset.userId;
            const action = this.classList.contains('deactivate-user') ? 'deactivate' : 'activate';
            confirmUserStatusChange(userId, action);
        });
    });

    // Delete User
    document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.dataset.userId;
            confirmDeleteUser(userId);
        });
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal .close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('show');
        });
    });

    // Form Submissions
    document.getElementById('userForm')?.addEventListener('submit', handleUserFormSubmit);
    document.getElementById('assignRoleForm')?.addEventListener('submit', handleAssignRoleSubmit);
    document.getElementById('resetPasswordForm')?.addEventListener('submit', handleResetPasswordSubmit);

    // Password strength indicator
    document.getElementById('newPassword')?.addEventListener('input', updatePasswordStrength);

    // Department filter for role assignment
    document.getElementById('newRole')?.addEventListener('change', function() {
        const deptGroup = document.getElementById('departmentSelectGroup');
        if (this.value === 'head') {
            deptGroup.style.display = 'block';
            document.getElementById('newDepartment').required = true;
        } else {
            deptGroup.style.display = 'none';
            document.getElementById('newDepartment').required = false;
        }
    });

    // Bulk Actions
    document.getElementById('bulkDeactivate')?.addEventListener('click', bulkDeactivateUsers);
    document.getElementById('bulkActivate')?.addEventListener('click', bulkActivateUsers);
    document.getElementById('bulkDelete')?.addEventListener('click', bulkDeleteUsers);

    // Confirm Modal Button
    document.getElementById('confirmBtn')?.addEventListener('click', executeConfirmedAction);
}

function setupFilterListeners() {
    document.getElementById('userSearch')?.addEventListener('keyup', filterUsers);
    document.getElementById('roleFilter')?.addEventListener('change', filterUsers);
    document.getElementById('statusFilter')?.addEventListener('change', filterUsers);
    document.getElementById('departmentFilter')?.addEventListener('change', filterUsers);
}

function setupTableCheckboxes() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');

    selectAllCheckbox?.addEventListener('change', function() {
        userCheckboxes.forEach(cb => {
            cb.checked = this.checked;
        });
        updateSelectedUsers();
    });

    userCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateSelectedUsers);
    });
}

function updateSelectedUsers() {
    const checkboxes = document.querySelectorAll('.user-checkbox:checked');
    selectedUsers = Array.from(checkboxes).map(cb => 
        cb.closest('tr').dataset.userId
    );

    const bulkActionsDiv = document.getElementById('bulkActions');
    if (selectedUsers.length > 0) {
        bulkActionsDiv.style.display = 'flex';
        document.getElementById('selectedCount').textContent = 
            `${selectedUsers.length} selected`;
    } else {
        bulkActionsDiv.style.display = 'none';
    }
}

function openUserModal() {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    
    document.getElementById('modalTitle').textContent = 'Create New User';
    document.getElementById('password').required = true;
    form.reset();
    currentEditingUserId = null;
    
    modal.classList.add('show');
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('show');
}

function editUser(userId) {
    currentEditingUserId = userId;
    
    // Fetch user data and populate form
    const row = document.querySelector(`tr[data-user-id="${userId}"]`);
    if (!row) return;

    const cells = row.querySelectorAll('td');
    document.getElementById('firstName').value = cells[2].textContent.split('(')[0].trim().split(' ')[0];
    document.getElementById('lastName').value = cells[2].textContent.split('(')[0].trim().split(' ')[1];
    document.getElementById('email').value = cells[3].textContent.trim();
    document.getElementById('password').required = false;

    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userModal').classList.add('show');
}

function openAssignRoleModal(userId) {
    const row = document.querySelector(`tr[data-user-id="${userId}"]`);
    const userName = row.querySelector('.user-cell span').textContent;
    
    document.getElementById('assignRoleUserId').value = userId;
    document.getElementById('userNameDisplay').textContent = `User: ${userName}`;
    document.getElementById('assignRoleModal').classList.add('show');
}

function closeAssignRoleModal() {
    document.getElementById('assignRoleModal').classList.remove('show');
}

function openResetPasswordModal(userId) {
    const row = document.querySelector(`tr[data-user-id="${userId}"]`);
    const userName = row.querySelector('.user-cell span').textContent;
    
    document.getElementById('resetUserId').value = userId;
    document.getElementById('resetUserDisplay').textContent = `User: ${userName}`;
    document.getElementById('resetPasswordForm').reset();
    document.getElementById('resetPasswordModal').classList.add('show');
}

function closeResetPasswordModal() {
    document.getElementById('resetPasswordModal').classList.remove('show');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('show');
}

function handleUserFormSubmit(e) {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password && password !== confirmPassword) {
        showAlert('Passwords do not match!', 'danger');
        return;
    }

    // Validate password requirements
    if (password && password.length < 8) {
        showAlert('Password must be at least 8 characters long!', 'danger');
        return;
    }

    // Submit form (in real app, would send to backend)
    console.log('Submitting user form:', new FormData(this));
    showAlert(currentEditingUserId ? 'User updated successfully!' : 'User created successfully!', 'success');
    closeUserModal();
}

function handleAssignRoleSubmit(e) {
    e.preventDefault();

    const userId = document.getElementById('assignRoleUserId').value;
    const newRole = document.getElementById('newRole').value;
    const department = document.getElementById('newDepartment')?.value;

    if (!newRole) {
        showAlert('Please select a role!', 'danger');
        return;
    }

    if (newRole === 'head' && !department) {
        showAlert('Please select a department for department heads!', 'danger');
        return;
    }

    // Submit role assignment (in real app, would send to backend)
    console.log('Assigning role:', {userId, newRole, department});
    showAlert('Role assigned successfully!', 'success');
    closeAssignRoleModal();
}

function handleResetPasswordSubmit(e) {
    e.preventDefault();

    const userId = document.getElementById('resetUserId').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmPassword) {
        showAlert('Passwords do not match!', 'danger');
        return;
    }

    if (newPassword.length < 8) {
        showAlert('Password must be at least 8 characters long!', 'danger');
        return;
    }

    // Submit password reset (in real app, would send to backend)
    console.log('Resetting password for user:', userId);
    showAlert('Password reset successfully!', 'success');
    closeResetPasswordModal();
}

function updatePasswordStrength(e) {
    const password = e.target.value;
    const indicator = document.getElementById('strengthIndicator');

    if (!password) {
        indicator.textContent = 'Weak';
        indicator.className = 'weak';
        return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    const strength = [
        password.length >= 8,
        hasUppercase,
        hasLowercase,
        hasNumbers,
        hasSpecial
    ].filter(Boolean).length;

    if (strength <= 2) {
        indicator.textContent = 'Weak';
        indicator.className = 'weak';
    } else if (strength <= 3) {
        indicator.textContent = 'Medium';
        indicator.className = 'medium';
    } else {
        indicator.textContent = 'Strong';
        indicator.className = 'strong';
    }
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const departmentFilter = document.getElementById('departmentFilter').value;

    document.querySelectorAll('tbody tr').forEach(row => {
        const userData = row.textContent.toLowerCase();
        const statusBadge = row.querySelector('.status-badge');
        const roleBadge = row.querySelector('.role-badge');

        let show = true;

        // Search filter
        if (searchTerm && !userData.includes(searchTerm)) {
            show = false;
        }

        // Role filter
        if (roleFilter && !roleBadge?.textContent.toLowerCase().includes(roleFilter)) {
            show = false;
        }

        // Status filter
        if (statusFilter && !statusBadge?.textContent.toLowerCase().includes(statusFilter)) {
            show = false;
        }

        row.style.display = show ? '' : 'none';
    });
}

function confirmUserStatusChange(userId, action) {
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('confirmMessage');
    
    message.textContent = `Are you sure you want to ${action} this user account?`;
    
    document.getElementById('confirmBtn').onclick = function() {
        updateUserStatus(userId, action);
        closeConfirmModal();
    };

    modal.classList.add('show');
}

function updateUserStatus(userId, action) {
    console.log(`${action}ing user ${userId}`);
    showAlert(`User ${action}d successfully!`, 'success');
}

function confirmDeleteUser(userId) {
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('confirmMessage');
    
    message.textContent = 'Are you sure you want to delete this user? This action cannot be undone.';
    
    document.getElementById('confirmBtn').onclick = function() {
        deleteUser(userId);
        closeConfirmModal();
    };

    modal.classList.add('show');
}

function deleteUser(userId) {
    const row = document.querySelector(`tr[data-user-id="${userId}"]`);
    row?.remove();
    console.log(`Deleting user ${userId}`);
    showAlert('User deleted successfully!', 'success');
}

function bulkDeactivateUsers() {
    if (selectedUsers.length === 0) return;
    
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('confirmMessage');
    
    message.textContent = `Are you sure you want to deactivate ${selectedUsers.length} user(s)?`;
    
    document.getElementById('confirmBtn').onclick = function() {
        performBulkAction('deactivate');
        closeConfirmModal();
    };

    modal.classList.add('show');
}

function bulkActivateUsers() {
    if (selectedUsers.length === 0) return;
    
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('confirmMessage');
    
    message.textContent = `Are you sure you want to activate ${selectedUsers.length} user(s)?`;
    
    document.getElementById('confirmBtn').onclick = function() {
        performBulkAction('activate');
        closeConfirmModal();
    };

    modal.classList.add('show');
}

function bulkDeleteUsers() {
    if (selectedUsers.length === 0) return;
    
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('confirmMessage');
    
    message.textContent = `Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`;
    
    document.getElementById('confirmBtn').onclick = function() {
        performBulkAction('delete');
        closeConfirmModal();
    };

    modal.classList.add('show');
}

function performBulkAction(action) {
    console.log(`Performing bulk ${action} on users:`, selectedUsers);
    
    if (action === 'delete') {
        selectedUsers.forEach(userId => {
            const row = document.querySelector(`tr[data-user-id="${userId}"]`);
            row?.remove();
        });
    }

    selectedUsers = [];
    document.getElementById('selectAll').checked = false;
    document.getElementById('bulkActions').style.display = 'none';
    showAlert(`Bulk ${action} completed successfully!`, 'success');
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

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.action-dropdown')) {
        document.querySelectorAll('.action-dropdown.open').forEach(d => {
            d.classList.remove('open');
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
