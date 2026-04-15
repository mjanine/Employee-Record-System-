/* emp_training.js - backend-connected modal + registration interactions */

let activeCardData = null;

const sidebar = document.getElementById('sidebar');
const logoToggle = document.getElementById('logoToggle');
const closeBtn = document.getElementById('closeBtn');
const menuItems = document.querySelectorAll('.menu-item');
const modalOverlay = document.getElementById('modalOverlay');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnRegister = document.getElementById('btnRegisterModal');
const registerForm = document.getElementById('registerTrainingForm');

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
    var text = item.querySelector('span') ? item.querySelector('span').innerText : '';
    if (text) item.setAttribute('data-text', text);
});

document.querySelectorAll('.training-card').forEach(function (card) {
    card.addEventListener('click', function (event) {
        if (event.target.classList.contains('register-btn')) {
            event.preventDefault();
            submitRegistration(card.dataset.registerUrl);
            return;
        }
        openModal(card.dataset, card);
    });
});

function openModal(data, card) {
    activeCardData = { data: data, card: card };
    document.getElementById('modal-title').textContent = data.title || '';
    document.getElementById('modal-meta').innerHTML =
        (data.category || '') + ' <span>|</span> ' + (data.type || '') + ' <span>|</span> ' + (data.date || '');
    document.getElementById('modal-status').textContent = data.status || '';
    document.getElementById('modal-description').textContent = data.description || '';
    document.getElementById('modal-provider').textContent = data.provider || '';
    document.getElementById('modal-location').textContent = data.location || '';
    document.getElementById('modal-contact').textContent = data.contact || '';
    document.getElementById('modal-slots').textContent = data.slots || '';

    btnRegister.disabled = false;
    btnRegister.textContent = 'Register';
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    activeCardData = null;
}

if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', function (event) {
        if (event.target === modalOverlay) closeModal();
    });
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeModal();
});

if (btnRegister) {
    btnRegister.addEventListener('click', function () {
        if (!activeCardData) return;
        submitRegistration(activeCardData.data.registerUrl);
    });
}

function submitRegistration(url) {
    if (!url || !registerForm) return;
    registerForm.action = url;
    registerForm.submit();
}