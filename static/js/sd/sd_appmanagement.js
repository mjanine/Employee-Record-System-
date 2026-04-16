/* sd_appmanagement.js */

document.addEventListener('DOMContentLoaded', function () {
    var sidebar = document.getElementById('sidebar');
    var logoToggle = document.getElementById('logoToggle');
    var closeBtn = document.getElementById('closeBtn');

    var tabNew = document.getElementById('tab-new');
    var tabPosition = document.getElementById('tab-position');
    var paneNew = document.getElementById('pane-new');
    var panePosition = document.getElementById('pane-position');

    document.querySelectorAll('.menu-item').forEach(function (item) {
        var span = item.querySelector('span');
        if (span) {
            item.setAttribute('data-text', span.innerText);
        }
    });

    if (closeBtn) {
        closeBtn.onclick = function () {
            sidebar.classList.add('collapsed');
        };
    }

    if (logoToggle) {
        logoToggle.onclick = function () {
            sidebar.classList.toggle('collapsed');
        };
    }

    function setTab(which) {
        var showNew = which === 'new';

        if (tabNew) {
            tabNew.classList.toggle('active', showNew);
        }
        if (tabPosition) {
            tabPosition.classList.toggle('active', !showNew);
        }
        if (paneNew) {
            paneNew.classList.toggle('active', showNew);
        }
        if (panePosition) {
            panePosition.classList.toggle('active', !showNew);
        }
    }

    // FIX: Server-rendered table rows are now the single source of truth (no mock/localStorage data).
    if (tabNew) {
        tabNew.addEventListener('click', function () {
            setTab('new');
        });
    }

    if (tabPosition) {
        tabPosition.addEventListener('click', function () {
            setTab('position');
        });
    }
});