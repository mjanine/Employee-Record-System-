const sidebar = document.getElementById('sidebar');
const logoToggle = document.getElementById('logoToggle');
const closeBtn = document.getElementById('closeBtn');
const deleteUserBtn = document.getElementById('deleteUserBtn'); // Reference to maroon button
const menuItems = document.querySelectorAll('.menu-item');

// --- FIX: This loop puts the text into the tooltips so they aren't black/empty ---
menuItems.forEach(item => {
    const span = item.querySelector('span');
    if (span) {
        item.setAttribute('data-text', span.innerText.trim());
    }
});

if (logoToggle) {
    logoToggle.addEventListener('click', () => sidebar.classList.toggle('close'));
}
if (closeBtn) {
    closeBtn.addEventListener('click', () => sidebar.classList.add('close'));
}

// --- NEW: Delete User Logic ---
if (deleteUserBtn) {
    deleteUserBtn.addEventListener('click', function() {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to delete this user? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#800000', // Maroon
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete user',
            cancelButtonText: 'No, keep user',
            width: '400px',
            customClass: {
                title: 'small-swal-title',
                htmlContainer: 'small-swal-text'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The user has been successfully removed.',
                    icon: 'success',
                    confirmButtonColor: '#4a1d1d'
                }).then(() => {
                    // Redirect to the list after deletion
                    window.location.href = 'hr_employeelist.html';
                });
            }
        });
    });
}

function updateHRProfile() {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
        width: '450px',
        background: '#fff',
        color: '#4a1d1d',
        iconColor: '#4a1d1d',
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    Toast.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Employee profile has been updated.'
    }).then(() => {
        window.location.href = 'hr_employee_view.html';
    });
}

function cancelHREdit() {
    Swal.fire({
        title: 'Discard changes?',
        text: "Any unsaved information will be lost.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4a1d1d',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, discard',
        cancelButtonText: 'No',
        width: '400px',
        padding: '1rem',
        customClass: {
            title: 'small-swal-title',
            htmlContainer: 'small-swal-text'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'hr_employee_view.html';
        }
    });
}