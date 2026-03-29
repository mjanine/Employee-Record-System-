/**
 * Sidebar Toggle Logic
 */
const sidebar = document.getElementById('sidebar');
const logoToggle = document.getElementById('logoToggle');
const closeBtn = document.getElementById('closeBtn');

if (logoToggle) {
    logoToggle.addEventListener('click', () => sidebar.classList.toggle('close'));
}
if (closeBtn) {
    closeBtn.addEventListener('click', () => sidebar.classList.add('close'));
}

/**
 * Update Changes Function (HR Version)
 */
function updateHRProfile() { // Pinalitan ang pangalan para mag-match sa HTML
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
        text: 'Employee profile has been updated.' // Custom message para sa HR
    }).then(() => {
        // Siguraduhin na tama ang path papunta sa view page
        window.location.href = 'hr_employee_view.html';
    });
}

/**
 * Cancel Function (HR Version)
 */
function cancelHREdit() { // Pinalitan ang pangalan para mag-match sa HTML
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