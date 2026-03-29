document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');
    const logoToggle = document.getElementById('logoToggle');
    const typeButtons = document.querySelectorAll('.type-btn');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const leaveForm = document.getElementById('leaveRequestForm');
    const menuItems = document.querySelectorAll(".menu-item");

    // --- sidebar tooltips ---
    menuItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) {
            item.setAttribute("data-text", span.innerText);
        }
    });

    // sidebar toggle logic
    if (closeBtn) closeBtn.onclick = () => sidebar.classList.add('collapsed');
    if (logoToggle) logoToggle.onclick = () => sidebar.classList.toggle('collapsed');

    // leave type selection logic
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // --- file upload & filename display ---
    if (dropZone && fileInput) {
        dropZone.onclick = () => fileInput.click();

        fileInput.onchange = () => {
            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                dropZone.innerHTML = `
                    <i class="fas fa-file-alt" style="color: #4a1d1d; font-size: 24px;"></i>
                    <p>selected: <b>${fileName}</b></p>
                    <small style="color: #666;">click again to change file</small>
                `;
            }
        };
    }

    // --- submit logic (no localstorage) ---
    if (leaveForm) {
        leaveForm.onsubmit = (e) => {
            e.preventDefault();

            const toast = Swal.mixin({
                toast: true,
                position: "top",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });

            toast.fire({
                icon: "success",
                title: "Leave request submitted successfully"
            }).then(() => {
                window.location.href = 'emp_leaverequest.html';
            });
        };
    }
});