/* head_training.js - sidebar interactions for head training page */

const sidebar = document.getElementById('sidebar');
const logoToggle = document.getElementById('logoToggle');
const closeBtn = document.getElementById('closeBtn');
const menuItems = document.querySelectorAll('.menu-item');

if (closeBtn) {
    closeBtn.addEventListener('click', function () {
        sidebar.classList.add('collapsed');
    });
}

if (logoToggle) {
    logoToggle.addEventListener('click', function () {
        sidebar.classList.toggle('collapsed');
    });
}

menuItems.forEach(function (item) {
    const text = item.querySelector('span') ? item.querySelector('span').innerText : '';
    if (text) item.setAttribute('data-text', text);
});