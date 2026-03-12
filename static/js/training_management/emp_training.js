document.addEventListener("DOMContentLoaded", () => {

    // --- Element Selectors ---
    const sidebar = document.getElementById("sidebar");
    const logoToggle = document.getElementById("logoToggle");
    const closeBtn = document.getElementById("closeBtn");
    const mainContent = document.getElementById("mainContent");
    const searchInput = document.getElementById("trainingSearch");
    const trainingCards = document.querySelectorAll(".training-card");
    
    // Modal Elements
    const modal = document.getElementById("trainingModal");
    const closeModalBtn = document.getElementById("closeModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");

    // --- 1. Sidebar Toggle Logic ---
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
            if (mainContent) mainContent.style.marginLeft = "110px";
        });
    }

    if (logoToggle) {
        logoToggle.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
                if (mainContent) mainContent.style.marginLeft = "340px";
            }
        });
    }

    // --- 2. Search Filter Logic ---
    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const filter = searchInput.value.toLowerCase();
            trainingCards.forEach(card => {
                const text = card.innerText.toLowerCase();
                card.style.display = text.includes(filter) ? "" : "none";
            });
        });
    }

    // --- 3. Modal Functionality ---

    /**
     * Opens the modal and populates the header with card data
     * @param {HTMLElement} card - The clicked training card element
     */
    const openModal = (card) => {
        const title = card.querySelector(".training-card-title").innerText;
        const category = card.querySelector(".training-card-category").innerText;
        const date = card.querySelector(".training-card-date").innerText;

        // Update Modal Header
        if (modalTitle) modalTitle.innerText = title;
        if (modalSubtitle) modalSubtitle.innerText = `${category} | Onsite | ${date}`;

        modal.classList.add("active");
    };

    // Card Click Event
    trainingCards.forEach(card => {
        card.addEventListener("click", (e) => {
            // If the user clicks the "Register" button specifically, do not open the modal
            if (e.target.classList.contains("btn-register")) {
                handleRegistration(card);
                return;
            }
            openModal(card);
        });
    });

    // Registration Handler
    const handleRegistration = (card) => {
        const title = card.querySelector(".training-card-title").innerText;
        alert(`Registration request submitted for: ${title}`);
    };

    // --- 4. Close Modal Logic ---

    // Close via "Close" button
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            modal.classList.remove("active");
        });
    }

    // Close via clicking the darkened overlay
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });

    // Close via "Escape" key
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            modal.classList.remove("active");
        }
    });

    // --- 5. Action Buttons (Edit/Cancel) ---
    const editBtn = document.querySelector(".btn-grey:nth-child(1)");
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            console.log("Edit mode triggered for:", modalTitle.innerText);
            // Future logic: Toggle contentEditable on table cells
        });
    }
});