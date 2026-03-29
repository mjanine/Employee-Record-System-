document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {

        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content-item').forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

/* SIDEBAR */
const sidebar = document.getElementById('sidebar');
document.getElementById('closeBtn').onclick = () => sidebar.classList.toggle('close');
document.getElementById('logoToggle').onclick = () => sidebar.classList.toggle('close');