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
 * Update Changes Function (Rectangle Toast)
 */
function updateSDProfile() {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
        width: '450px', // Horizontal Rectangle
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
        text: 'School Director profile has been updated.'
    }).then(() => {
        window.location.href = 'sd_profile_view.html';
    });
}

/**
 * Cancel Function (Rectangle Modal)
 */
function cancelSDEdit() {
    Swal.fire({
        title: 'Discard changes?',
        text: "Any unsaved information will be lost.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4a1d1d',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, discard',
        cancelButtonText: 'No',
        width: '400px', // Rectangle shape
        padding: '1rem',
        customClass: {
            title: 'small-swal-title',
            htmlContainer: 'small-swal-text'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'sd_profile_view.html';
        }
    });
}