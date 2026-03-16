/* =================================
   Admin Sidebar Toggle
   ================================= */

document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');

    closeBtn?.addEventListener('click', function () {
        sidebar.classList.add('collapsed');
    });

    logoToggle?.addEventListener('click', function () {
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
        }
    });
});
