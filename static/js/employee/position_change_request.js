/* position_change_request.js */
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const logoToggle = document.getElementById('logoToggle');
    const closeBtn = document.getElementById('closeBtn');
    const menuItems = document.querySelectorAll('.menu-item');

    const tabNewRequest = document.getElementById('tabNewRequest');
    const recordsBtn = document.getElementById('recordsBtn');
    const newRequestContainer = document.getElementById('newRequestContainer');
    const recordsContainer = document.getElementById('recordsContainer');

    const positionForm = document.getElementById('positionForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const submitBtn = document.getElementById('submitBtn');

    const cancelModal = document.getElementById('cancelModal');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const stayBtn = document.getElementById('stayBtn');

    menuItems.forEach((item) => {
        const span = item.querySelector('span');
        if (span) {
            item.setAttribute('data-text', span.innerText);
        }
    });

    if (closeBtn) {
        closeBtn.onclick = () => sidebar.classList.add('collapsed');
    }

    if (logoToggle) {
        logoToggle.onclick = () => sidebar.classList.toggle('collapsed');
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

    if (cancelBtn && cancelModal) {
        cancelBtn.addEventListener('click', () => {
            cancelModal.classList.add('active');
        });
    }

    if (confirmCancelBtn && cancelModal && positionForm) {
        confirmCancelBtn.addEventListener('click', () => {
            cancelModal.classList.remove('active');
            positionForm.reset();
        });
    }

    if (stayBtn && cancelModal) {
        stayBtn.addEventListener('click', () => {
            cancelModal.classList.remove('active');
        });
    }

    if (cancelModal) {
        cancelModal.addEventListener('click', (event) => {
            if (event.target === cancelModal) {
                cancelModal.classList.remove('active');
            }
        });
    }

    if (positionForm) {
        // FIX: Keep native Django form POST flow (no preventDefault/localStorage mock submission).
        positionForm.addEventListener('submit', () => {
            if (submitBtn) {
                submitBtn.disabled = true;
            }
        });
    }
});