/* --- UI Elements --- */
const sidebar = document.getElementById("sidebar");
const logoToggle = document.getElementById("logoToggle");
const closeBtn = document.getElementById("closeBtn");
const modal = document.getElementById("viewModal");
const closeModal = document.getElementById("modalClose");

/* --- Slide Elements --- */
const nextBtn = document.getElementById("nextSlide");
const prevBtn = document.getElementById("prevSlide");
const slide1 = document.getElementById("slide1");
const slide2 = document.getElementById("slide2");

/**
 * Sidebar Logic
 */
closeBtn.addEventListener("click", () => {
    sidebar.classList.add("collapsed");
});

logoToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
    }
});

// Tooltip support for collapsed sidebar
document.querySelectorAll(".menu-item").forEach(item => {
    const spanText = item.querySelector("span")?.innerText || "";
    item.setAttribute("data-text", spanText);
});

/**
 * Slide Navigation (Frame View)
 * Toggles between Applicant Info and Document Preview
 */
function showSlide(slideNumber) {
    if (slideNumber === 1) {
        slide1.classList.add("active");
        slide2.classList.remove("active");
    } else {
        slide1.classList.remove("active");
        slide2.classList.add("active");
    }
}

nextBtn.addEventListener("click", () => showSlide(2));
prevBtn.addEventListener("click", () => showSlide(1));

/**
 * Modal Control
 */
document.querySelectorAll(".view-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        showSlide(1); // Always reset to Slide 1 when opening
        modal.style.display = "flex";
    });
});

const closeViewModal = () => {
    modal.style.display = "none";
};

closeModal.addEventListener("click", closeViewModal);

// Close on outside click or Escape key
window.addEventListener("click", (e) => {
    if (e.target === modal) closeViewModal();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
        closeViewModal();
    }
});

/**
 * Action Buttons (Approve/Reject)
 */
document.querySelector(".modal-approve")?.addEventListener("click", () => {
    if(confirm("Confirm approval for this applicant?")) {
        alert("Status updated to Approved.");
        closeViewModal();
    }
});

document.querySelector(".modal-reject")?.addEventListener("click", () => {
    const reason = prompt("Enter reason for rejection:");
    if (reason !== null) {
        alert("Application Rejected.");
        closeViewModal();
    }
});