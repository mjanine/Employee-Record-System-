document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const logoToggle = document.getElementById('logoToggle');
    const closeBtn = document.getElementById('closeBtn');
    const menuItems = document.querySelectorAll('.menu-item');

    // 1. Tooltip Fix: Automatically set labels
    menuItems.forEach(item => {
        const span = item.querySelector('span');
        if (span) {
            item.setAttribute('data-text', span.innerText.trim());
        }
    });

    // 2. Sidebar Toggle Logic
    if (logoToggle) {
        logoToggle.onclick = () => sidebar.classList.toggle('close');
    }
    if (closeBtn) {
        closeBtn.onclick = () => sidebar.classList.add('close');
    }

    // --- Keep your existing Tabs, Upload, and Modal code below ---
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content-item');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(c => c.classList.remove('active'));
            document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
        });
    });
});