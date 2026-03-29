/**
 * Save Employee Function (Rectangle Toast)
 */
function saveEmployee() {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 2000,
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
        title: 'Employee Added!',
        text: 'The new record has been successfully created.'
    }).then(() => {
        // Redirect back to the list after the toast
        window.location.href = 'hr_employeelist.html';
    });
}

/**
 * Cancel Function (Rectangle Warning Modal)
 */
function confirmCancel() {
    Swal.fire({
        title: 'Stop adding employee?',
        text: "Any data you've entered will be cleared.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4a1d1d',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, stop',
        cancelButtonText: 'No, stay',
        width: '400px',
        padding: '1rem'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'hr_employeelist.html';
        }
    });
}

// Sidebar logic (Keep this so the toggle works on this page too)
const sidebar = document.getElementById('sidebar');
const logoToggle = document.getElementById('logoToggle');

if (logoToggle) {
    logoToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
}