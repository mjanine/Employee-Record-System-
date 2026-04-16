/* hr_appmanagement.js */

const HR_ACTIONABLE_STATUSES = new Set(['Pending', 'Head Approved']);
let activeMainTab = 'new';

function getCookie(name) {
    const cookieValue = document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith(name + '='));
    return cookieValue ? decodeURIComponent(cookieValue.split('=')[1]) : '';
}

function getCsrfToken() {
    const hiddenToken = document.getElementById('csrf-token-value');
    if (hiddenToken && hiddenToken.value) {
        return hiddenToken.value;
    }
    return getCookie('csrftoken');
}

function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const logoToggle = document.getElementById('logoToggle');
    const closeBtn = document.getElementById('closeBtn');

    document.querySelectorAll('.menu-item').forEach((item) => {
        const span = item.querySelector('span');
        if (span) {
            item.setAttribute('data-text', span.textContent.trim());
        }
    });

    if (closeBtn) {
        closeBtn.onclick = () => sidebar.classList.add('collapsed');
    }

    if (logoToggle) {
        logoToggle.onclick = () => sidebar.classList.toggle('collapsed');
    }
}

function closeFilterMenu() {
    const menu = document.getElementById('filterMenu');
    const btn = document.getElementById('filterBtn');
    if (!menu || !btn) return;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
}

function syncFilterChip(activeLabel) {
    const row = document.getElementById('activeFilterRow');
    const label = document.getElementById('activeFilterLabel');
    if (!row || !label) return;

    if (!activeLabel) {
        row.hidden = true;
        row.style.display = 'none';
        label.innerText = '';
        return;
    }

    label.innerText = activeLabel;
    row.hidden = false;
    row.style.display = 'flex';
}

function applyRowFilters(activeStatus, searchText) {
    const rows = document.querySelectorAll('#applicationTableBody tr[data-application-id]');
    let visibleCount = 0;

    rows.forEach((row) => {
        const statusText = (row.dataset.status || '').trim();
        const applicationType = (row.dataset.applicationType || '').trim();
        const rowText = row.innerText.toLowerCase();
        const tabMatch = activeMainTab === 'position'
            ? applicationType === 'Position Change Request'
            : applicationType === 'New Employee Application';

        const statusMatch = !activeStatus || statusText === activeStatus;
        const searchMatch = !searchText || rowText.includes(searchText);
        const visible = statusMatch && searchMatch && tabMatch;

        row.style.display = visible ? '' : 'none';
        if (visible) {
            visibleCount += 1;
        }
    });

    const emptyRow = document.getElementById('js-empty-row');
    if (emptyRow) {
        emptyRow.remove();
    }

    const tbody = document.getElementById('applicationTableBody');
    if (tbody && visibleCount === 0) {
        const tr = document.createElement('tr');
        tr.id = 'js-empty-row';
        tr.innerHTML = '<td colspan="6" class="no-records">No records found.</td>';
        tbody.appendChild(tr);
    }
}

async function submitDecision(button) {
    const row = button.closest('tr[data-application-id]');
    if (!row) return;

    const status = (row.dataset.status || '').trim();
    if (!HR_ACTIONABLE_STATUSES.has(status)) {
        alert('This application is not currently actionable by HR.');
        return;
    }

    const actionUrl = row.dataset.actionUrl;
    const decision = button.dataset.decision;
    const remarksInput = row.querySelector('.js-remarks');
    const remarks = remarksInput ? remarksInput.value.trim() : '';
    const csrfToken = getCsrfToken();

    if (!actionUrl || !decision || !csrfToken) {
        alert('Unable to submit this action right now.');
        return;
    }

    const body = new URLSearchParams({
        decision: decision,
        remarks: remarks,
    });

    button.disabled = true;

    try {
        // FIX: Submit real review decision to Django endpoint with CSRF header.
        const response = await fetch(actionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: body.toString(),
        });

        if (!response.ok) {
            throw new Error('Request failed');
        }

        window.location.reload();
    } catch (error) {
        alert('Failed to submit the action. Please try again.');
    } finally {
        button.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupSidebar();

    // FIX: Use backend status vocabulary exactly as stored in Django.
    let activeStatus = '';
    let activeFilterLabel = '';

    const filterBtn = document.getElementById('filterBtn');
    const filterMenu = document.getElementById('filterMenu');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    const searchInput = document.getElementById('tableSearch');
    const tabNew = document.getElementById('tab-new');
    const tabPosition = document.getElementById('tab-position');

    const applyCurrentFilters = () => {
        const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
        applyRowFilters(activeStatus, searchValue);
    };

    // FIX: Keep HR tab switching tied to server-rendered application type rows.
    const setMainTab = (tabName) => {
        activeMainTab = tabName === 'position' ? 'position' : 'new';

        if (tabNew) {
            tabNew.classList.toggle('active', activeMainTab === 'new');
        }
        if (tabPosition) {
            tabPosition.classList.toggle('active', activeMainTab === 'position');
        }

        applyCurrentFilters();
    };

    if (tabNew) {
        tabNew.addEventListener('click', () => {
            setMainTab('new');
        });
    }

    if (tabPosition) {
        tabPosition.addEventListener('click', () => {
            setMainTab('position');
        });
    }

    if (filterBtn && filterMenu) {
        filterBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = filterMenu.classList.contains('open');
            filterMenu.classList.toggle('open', !isOpen);
            filterMenu.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
            filterBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        });
    }

    if (filterMenu) {
        filterMenu.querySelectorAll('.filter-option').forEach((option) => {
            option.addEventListener('click', () => {
                if (option.dataset.filterClear === 'true') {
                    activeStatus = '';
                    activeFilterLabel = '';
                } else {
                    activeStatus = option.dataset.filterValue || '';
                    activeFilterLabel = option.innerText.trim();
                }

                syncFilterChip(activeFilterLabel);
                closeFilterMenu();
                applyCurrentFilters();
            });
        });
    }

    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            activeStatus = '';
            activeFilterLabel = '';
            syncFilterChip(activeFilterLabel);
            closeFilterMenu();
            applyCurrentFilters();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyCurrentFilters);
    }

    document.addEventListener('click', (event) => {
        const clickedInsideFilter = event.target.closest('.filter-dropdown');
        if (!clickedInsideFilter) {
            closeFilterMenu();
        }
    });

    document.querySelectorAll('.js-app-action').forEach((button) => {
        button.addEventListener('click', () => {
            submitDecision(button);
        });
    });

    syncFilterChip('');
    setMainTab('new');
});