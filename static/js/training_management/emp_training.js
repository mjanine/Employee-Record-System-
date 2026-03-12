const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");
const menuItems = document.querySelectorAll(".menu-item");
const modalOverlay = document.getElementById("modalOverlay");
const modalBox = document.getElementById("modalBox");
const btnCloseModal = document.getElementById("btnCloseModal");

// Sidebar: close button
closeBtn.addEventListener("click", () => {
    sidebar.classList.add("collapsed");
});

// Sidebar: open via logo click when collapsed
logoToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
    }
});

// Sidebar: tooltip text + active state
menuItems.forEach(item => {
    const text = item.querySelector("span")?.innerText;
    if (text) item.setAttribute("data-text", text);

    item.addEventListener("click", () => {
        document.querySelector(".menu-item.active")?.classList.remove("active");
        item.classList.add("active");
    });
});

// Training cards: open modal on card click, but not on register button
document.querySelectorAll(".training-card").forEach(card => {
    card.addEventListener("click", (e) => {
        if (e.target.classList.contains("register-btn")) return;

        const data = card.dataset;
        openModal(data);
    });
});

// Open modal and populate with card data
function openModal(data) {
    document.getElementById("modal-title").textContent = data.title;
    document.getElementById("modal-meta").innerHTML =
        `${data.category} <span>|</span> ${data.type} <span>|</span> ${data.date}`;
    document.getElementById("modal-status").textContent = data.status;
    document.getElementById("modal-description").textContent = data.description;
    document.getElementById("modal-provider").textContent = data.provider;
    document.getElementById("modal-location").textContent = data.location;
    document.getElementById("modal-contact").textContent = data.contact;
    document.getElementById("modal-slots").textContent = data.slots;

    modalOverlay.classList.add("active");
}

// Close modal via Close button
btnCloseModal.addEventListener("click", () => {
    modalOverlay.classList.remove("active");
});

// Close modal by clicking outside (on overlay)
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove("active");
    }
});