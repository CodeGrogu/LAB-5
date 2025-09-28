// =================================================================================
// INITIALIZATION
// =================================================================================
document.addEventListener("DOMContentLoaded", function () {
    initializeSliders();
    initializeChipCloseButtons();
    initializeClock();
    generateCalendar(currentCalendarDate); // Use the global state here
    initializePagination();
    initializeBreadcrumbs();
    initializeForms();
    initializeCustomizationPanel();
});


// =================================================================================
// GENERIC UI COMPONENTS
// =================================================================================

/**
 * Manages the accordion component, allowing only one item to be open at a time.
 * @param {HTMLElement} headerElement - The accordion header that was clicked.
 */
function toggleAccordion(headerElement) {
    const content = headerElement.nextElementSibling;
    const icon = headerElement.querySelector('i');
    const isActive = content.classList.contains("active");

    // Close all other accordion items first
    document.querySelectorAll(".accordion-content.active").forEach((item) => {
        if (item !== content) {
            item.classList.remove("active");
            item.previousElementSibling.classList.remove("active");
            item.previousElementSibling.querySelector('i').textContent = "expand_more";
        }
    });

    // Toggle the clicked item
    content.classList.toggle("active");
    headerElement.classList.toggle("active");
    icon.textContent = isActive ? "expand_more" : "expand_less";
}


/**
 * Toggles the visibility of a dropdown menu.
 * @param {HTMLElement} button - The button that toggles the dropdown.
 */
function toggleDropdown(button) {
    const dropdownMenu = button.nextElementSibling;
    const isShowing = dropdownMenu.classList.contains("show");
    
    // Close all other open dropdowns
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        if(menu !== dropdownMenu) {
            menu.classList.remove('show');
        }
    });

    // Toggle the current one
    dropdownMenu.classList.toggle("show");
}

// Close dropdowns when clicking elsewhere on the page
window.addEventListener('click', function (e) {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => menu.classList.remove('show'));
    }
});


/**
 * Toggles the active state of a chip component.
 * @param {HTMLElement} chip - The chip element to toggle.
 */
function toggleChip(chip) {
    chip.classList.toggle("active");
    const isActive = chip.classList.contains("active");
    showToast(`Chip ${isActive ? "activated" : "deactivated"}`, isActive ? "success" : "info");
}

/**
 * Removes a chip element from the DOM.
 * @param {Event} event - The click event.
 * @param {HTMLElement} chip - The chip element to remove.
 */
function removeChip(event, chip) {
    event.stopPropagation(); // Prevent toggleChip from firing
    chip.style.display = "none";
    showToast("Chip removed", "info");
}

/**
 * Displays a toast notification for switch state changes.
 * @param {string} name - The name of the setting being toggled.
 * @param {boolean} isChecked - The new state of the switch.
 */
function toggleSwitch(name, isChecked) {
    showToast(`${name} ${isChecked ? "enabled" : "disabled"}`, isChecked ? "success" : "info");
}

/**
 * Highlights a selected list item.
 * @param {HTMLElement} item - The list item that was clicked.
 */
function selectListItem(item) {
    document.querySelectorAll(".list-item").forEach((li) => {
        li.style.backgroundColor = "";
    });
    item.style.backgroundColor = "rgba(67, 97, 238, 0.1)";
    showToast(`Selected: ${item.querySelector("span").textContent}`, "success");
}

/**
 * Displays a toast notification for alert buttons.
 * @param {string} type - The type of alert ('success', 'warning', 'info').
 */
function showAlert(type) {
    let message = "";
    switch (type) {
        case "success": message = "This is a success message!"; break;
        case "warning": message = "This is a warning message!"; break;
        case "info": message = "This is an info message!"; break;
    }
    showToast(message, type);
}

/**
 * Closes an alert element.
 * @param {HTMLElement} alert - The alert element to close.
 */
function closeAlert(alert) {
    alert.style.display = "none";
}

/**
 * Opens the modal dialog.
 */
function openModal() {
    document.getElementById("modal").style.display = "flex";
}

/**
 * Closes the modal dialog.
 */
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Close modal when clicking on the background overlay
window.addEventListener('click', function (event) {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
        closeModal();
    }
});


/**
 * Displays a toast notification message.
 * @param {string} message - The message to display.
 * @param {string} [type='info'] - The type of toast ('success', 'warning', 'info').
 */
function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div>${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.add("show");
    }, 10);

    // Automatically remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.remove("show");
            toast.addEventListener('transitionend', () => {
                if(toast.parentElement) toastContainer.removeChild(toast);
            });
        }
    }, 5000);
}


// =================================================================================
// NAVIGATION & TABS
// =================================================================================

/**
 * Switches between content tabs.
 * @param {Event} evt - The click event.
 * @param {string} tabId - The ID of the tab pane to show.
 */
function openTab(evt, tabId) {
    document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove('active'));
    document.querySelectorAll(".tab-link").forEach(link => link.classList.remove("active"));
    document.getElementById(tabId).classList.add('active');
    evt.currentTarget.classList.add("active");
}

/**
 * Sets the active state for the main navigation.
 * @param {HTMLElement} item - The nav item that was clicked.
 */
function setActiveNav(item) {
    // Normalise items
    document.querySelectorAll(".nav-item").forEach(navItem => navItem.classList.remove("active"));
    item.classList.add("active");

    const desired = String(item.textContent || '').trim().toLowerCase();
    let handled = false;

    // Try to activate a matching tab
    const tabLinks = Array.from(document.querySelectorAll('.tab-link'));
    const matchTab = tabLinks.find(t => t.textContent.trim().toLowerCase() === desired);
    if (matchTab) {
        // Trigger the click so openTab receives an event and handles content switching
        matchTab.click();
        handled = true;
    }

    // If no tab matched, try to scroll to a section whose id or class matches the nav text
    if (!handled) {
        // Special-case Home -> scroll to header/top
        if (desired === 'home') {
            const header = document.querySelector('header') || document.querySelector('.container');
            if (header) {
                try { header.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { header.scrollIntoView(); }
                handled = true;
            }
        }

        // Try matching section headings (H2) text to the nav label (e.g., 'Buttons', 'Forms')
        if (!handled) {
            const headings = Array.from(document.querySelectorAll('.section h2'));
            const matchHeading = headings.find(h => h.textContent.trim().toLowerCase() === desired);
            if (matchHeading) {
                const section = matchHeading.closest('.section');
                if (section) {
                    try { section.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { section.scrollIntoView(); }
                    handled = true;
                }
            }
        }

        // Last-resort: try id, data-section, or class selectors
        if (!handled) {
            let target = null;
            try {
                target = document.getElementById(desired)
                    || document.querySelector(`[data-section="${desired}"]`)
                    || document.querySelector(`.${CSS && CSS.escape ? CSS.escape(desired) : desired}`);
            } catch (e) {
                // ignore selector errors
                target = document.getElementById(desired) || document.querySelector(`[data-section="${desired}"]`);
            }
            if (target) {
                try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(e) { target.scrollIntoView(); }
                handled = true;
            }
        }
    }

    // Only show a toast if no other navigation occurred
    if (!handled) showToast(`Navigating to ${item.textContent}`, "info");
}

/**
 * Simulates breadcrumb navigation.
 * @param {string} page - The name of the page in the breadcrumb.
 */
function navigateBreadcrumb(page) {
    if (!page) return;

    const desired = String(page).trim().toLowerCase();
    let handled = false;

    // 1) Try to activate the main nav item that matches the breadcrumb
    const navItems = Array.from(document.querySelectorAll('.nav-item'));
    const matchNav = navItems.find(n => n.textContent.trim().toLowerCase() === desired);
    if (matchNav) {
        // Use existing helper to set active state and fire any side-effects
        setActiveNav(matchNav);
        // Ensure it's visible
        try { matchNav.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
        handled = true;
    }

    // 2) If there is a tab with the same label, trigger it (delegates to openTab)
    const tabLinks = Array.from(document.querySelectorAll('.tab-link'));
    const matchTab = tabLinks.find(t => t.textContent.trim().toLowerCase() === desired);
    if (matchTab) {
        // If the tab has an onclick handler that expects an event, fire a click so it receives a proper event
        matchTab.click();
        handled = true;
    }

    // 3) Update breadcrumb active class so the UI reflects the current location
    document.querySelectorAll('.breadcrumb-item').forEach((li) => {
        li.classList.remove('active');
        const link = li.querySelector('.breadcrumb-link');
        if (link && link.textContent.trim().toLowerCase() === desired) {
            li.classList.add('active');
        }
    });

    // Only show a toast if no other handler produced one
    if (!handled) showToast(`Navigating to ${page}`, "info");
}

/**
 * Simulates pagination.
 * @param {string|number} page - The page to navigate to ('prev', 'next', or a number).
 */
function changePage(page) {
    // Find pagination container and items
    const pagination = document.querySelector('.pagination');
    if (!pagination) {
        showToast(`Navigating to page ${page}`, "info");
        return;
    }
    const items = Array.from(pagination.querySelectorAll('.page-item'));
    if (items.length === 0) {
        showToast(`Navigating to page ${page}`, "info");
        return;
    }

    // Helper: filter numeric page items (exclude prev/next or other controls)
    const numericItems = items.filter(li => {
        const link = li.querySelector('.page-link');
        if (!link) return false;
        const text = link.textContent.trim().toLowerCase();
        // treat anything that is a plain number as a page
        return !isNaN(Number(text)) && text !== '';
    });

    if (numericItems.length === 0) {
        // fallback: treat all items as pages
        numericItems.push(...items);
    }

    // Find currently active numeric index
    let activeNumericIndex = numericItems.findIndex(li => li.classList.contains('active'));
    if (activeNumericIndex === -1) {
        // If no numeric is active, try to find any active and map to numeric list
        const anyActive = items.findIndex(li => li.classList.contains('active'));
        if (anyActive !== -1) {
            activeNumericIndex = Math.max(0, numericItems.findIndex((nli) => items.indexOf(nli) >= anyActive));
        }
    }
    if (activeNumericIndex === -1) activeNumericIndex = 0;

    // Compute target numeric index
    let targetNumericIndex = activeNumericIndex;
    if (page === 'prev') {
        targetNumericIndex = Math.max(0, activeNumericIndex - 1);
    } else if (page === 'next') {
        targetNumericIndex = Math.min(numericItems.length - 1, activeNumericIndex + 1);
    } else {
        const num = Number(page);
        if (!Number.isNaN(num)) {
            // num is 1-based; find matching numeric item whose link text equals num
            const matchIndex = numericItems.findIndex(li => Number(li.querySelector('.page-link').textContent.trim()) === num);
            if (matchIndex !== -1) targetNumericIndex = matchIndex;
            else targetNumericIndex = Math.max(0, Math.min(numericItems.length - 1, num - 1));
        }
    }

    // Clear active on all items, set active only on the chosen numeric item
    items.forEach(li => li.classList.remove('active'));
    const chosenItem = numericItems[targetNumericIndex];
    if (chosenItem) chosenItem.classList.add('active');

    // Update aria-current for accessibility on page links
    items.forEach(li => {
        const link = li.querySelector('.page-link');
        if (!link) return;
        if (li.classList.contains('active')) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });

    // Enable/disable prev and next buttons based on bounds
    const prevItem = items.find(li => {
        const t = (li.querySelector('.page-link') || {}).textContent || '';
        return /prev|previous|‹|<|«/i.test(t.trim());
    });
    const nextItem = items.find(li => {
        const t = (li.querySelector('.page-link') || {}).textContent || '';
        return /next|›|>|»/i.test(t.trim());
    });

    if (prevItem) {
        const isDisabled = targetNumericIndex <= 0;
        prevItem.classList.toggle('disabled', isDisabled);
        const plink = prevItem.querySelector('.page-link');
        if (plink) plink.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
    }
    if (nextItem) {
        const isDisabled = targetNumericIndex >= numericItems.length - 1;
        nextItem.classList.toggle('disabled', isDisabled);
        const nlink = nextItem.querySelector('.page-link');
        if (nlink) nlink.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
    }

    // Notify the user
    const pageLabel = chosenItem ? (chosenItem.querySelector('.page-link').textContent.trim() || (targetNumericIndex + 1).toString()) : (targetNumericIndex + 1).toString();
    showToast(`Navigated to page ${pageLabel}`, 'info');
}

/**
 * Sets up click delegation for pagination so clicks on page links trigger changePage.
 */
function initializePagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    pagination.addEventListener('click', function (e) {
        const link = e.target.closest('.page-link');
        if (!link) return;
        // If the link already defines an inline onclick handler, don't duplicate handling here.
        // The inline handler will run on the click event; skip delegated handling to avoid double updates.
        // If a data-page attribute is present, delegation should handle it. If not and an inline onclick exists, skip.
        if (!link.hasAttribute('data-page') && link.hasAttribute && link.hasAttribute('onclick')) return;
        e.preventDefault();

        const textRaw = link.textContent || '';
        const text = textRaw.trim().toLowerCase();

        if (/^\s*(previous|prev|‹|<|«)\s*$/i.test(textRaw)) {
            changePage('prev');
            return;
        }
        if (/^\s*(next|›|>|»)\s*$/i.test(textRaw)) {
            changePage('next');
            return;
        }

        const num = Number(text);
        if (!Number.isNaN(num)) changePage(num);
        else changePage(text);
    });
}

/**
 * Delegates breadcrumb clicks to navigateBreadcrumb using data-page attributes.
 */
function initializeBreadcrumbs() {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;

    breadcrumb.addEventListener('click', function (e) {
        const link = e.target.closest('.breadcrumb-link');
        if (!link) return;
        e.preventDefault();
        const page = link.getAttribute('data-page') || link.textContent;
        if (page) navigateBreadcrumb(page);
    });
}


// =================================================================================
// FORMS, TABLES, AND DATA
// =================================================================================

/**
 * Handles form submission.
 * @param {Event} event - The submit event.
 */
function handleFormSubmit(event) {
    event.preventDefault();
    showToast("Form submitted successfully!", "success");
    event.target.reset();
}

/**
 * Attach submit handlers to forms to avoid inline attributes and duplicate handling.
 */
function initializeForms() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // If an inline onsubmit exists, remove it (we prefer JS binding)
    if (form.hasAttribute && form.hasAttribute('onsubmit')) {
        form.removeAttribute('onsubmit');
    }

    form.addEventListener('submit', function (e) {
        // Prevent bubbling double-invocations if other handlers exist
        e.stopImmediatePropagation();
        handleFormSubmit(e);
    });
}

/**
 * Simulates editing a table row.
 * @param {HTMLElement} button - The edit button that was clicked.
 */
function editItem(button) {
    const row = button.closest('tr');
    const name = row.cells[0].textContent;
    showToast(`Editing: ${name}`, "info");
}

/**
 * Simulates deleting a table row.
 * @param {HTMLElement} button - The delete button that was clicked.
 */
function deleteItem(button) {
    const row = button.closest('tr');
    const name = row.cells[0].textContent;
    row.style.opacity = "0.5";
    showToast(`Deleted: ${name}`, "warning");
}

/**
 * Simulates sorting a table.
 * @param {number} columnIndex - The index of the column to sort by.
 */
function sortTable(columnIndex) {
    // Find the first table on the page
    const table = document.querySelector('.table');
    if (!table) {
        showToast('No table found to sort', 'warning');
        return;
    }

    const tbody = table.tBodies[0];
    if (!tbody) {
        showToast('Table has no body to sort', 'warning');
        return;
    }

    // Determine current sort state stored on the table
    const currentCol = Number(table.getAttribute('data-sort-col'));
    let direction = table.getAttribute('data-sort-dir') || 'asc';

    if (!Number.isNaN(currentCol) && currentCol === columnIndex) {
        // toggle direction
        direction = direction === 'asc' ? 'desc' : 'asc';
    } else {
        direction = 'asc';
    }

    // Collect rows
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Helper to get cell text and coerce to number when appropriate
    const getCellValue = (row, idx) => {
        const cell = row.cells[idx];
        if (!cell) return '';
        const text = cell.textContent.trim();
        const num = Number(text.replace(/[^0-9.\-]/g, ''));
        return (!Number.isNaN(num) && text.match(/[0-9]/)) ? num : text.toLowerCase();
    };

    rows.sort((a, b) => {
        const av = getCellValue(a, columnIndex);
        const bv = getCellValue(b, columnIndex);

        if (typeof av === 'number' && typeof bv === 'number') {
            return direction === 'asc' ? av - bv : bv - av;
        }

        if (av < bv) return direction === 'asc' ? -1 : 1;
        if (av > bv) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Remove existing rows and append in sorted order
    rows.forEach(r => tbody.appendChild(r));

    // Store current sort state
    table.setAttribute('data-sort-col', columnIndex);
    table.setAttribute('data-sort-dir', direction);

    // Update header visuals: clear previous indicators and set on current TH
    const headers = table.querySelectorAll('th');
    headers.forEach((th, idx) => {
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (idx === columnIndex) th.classList.add(direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
    });

    showToast(`Sorted by column ${columnIndex + 1} (${direction})`, 'info');
}

/**
 * Animates a progress bar to a target width.
 * @param {string} id - The ID of the progress bar element.
 * @param {number} targetWidth - The target width in percentage.
 */
function animateProgress(id, targetWidth) {
    const progressBar = document.getElementById(id);
    progressBar.style.width = targetWidth + "%";
    showToast(`Progress updated to ${targetWidth}%`, "success");
}

/**
 * Initializes all slider components on the page.
 */
function initializeSliders() {
    document.querySelectorAll(".range-input").forEach((slider) => {
        const valueDisplay = slider.parentElement.querySelector(".range-value");
        if (valueDisplay) {
            valueDisplay.textContent = slider.value;
            slider.oninput = function () {
                valueDisplay.textContent = this.value;
            };
        }
    });
}

function updateSliderValue(slider, valueId) {
    const valueDisplay = document.getElementById(valueId);
    if (valueDisplay) {
        const unit = (valueId.toLowerCase().includes('font') || valueId.toLowerCase().includes('radius')) ? 'px' : '%';
        valueDisplay.textContent = slider.value + unit;
    }
}

function updateOpacity(value) {
    document.body.style.setProperty('--opacity-demo', value / 100);
}


/**
 * Initializes close buttons for chips.
 */
function initializeChipCloseButtons() {
    document.querySelectorAll(".chip-close").forEach((button) => {
        button.onclick = function () {
            this.closest(".chip").remove();
        };
    });
}


// =================================================================================
// CUSTOMIZATION PANEL
// =================================================================================
function initializeCustomizationPanel() {
    // Setup for demonstration purposes
    const panel = document.getElementById("customPanel");
    if (panel) {
        // Simple logic for demonstrating panel state
    }
}

function togglePanel() {
    document.getElementById("customPanel").classList.toggle("open");
}

function changeColor(variable, color) {
    document.documentElement.style.setProperty(`--${variable}`, color);
    document.querySelectorAll(".color-option").forEach(option => option.classList.remove("active"));
    event.target.classList.add("active");
    showToast(`Primary color changed`, "success");
}

function changeTheme(theme) {
    const root = document.documentElement;
    document.body.classList.remove('dark-theme');

    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (theme === 'blue') {
        root.style.setProperty('--primary', '#0077b6');
        root.style.setProperty('--secondary', '#00b4d8');
    } else if (theme === 'green') {
        root.style.setProperty('--primary', '#2a9d8f');
        root.style.setProperty('--secondary', '#e9c46a');
    } else { // light / default
        resetStyles();
    }

    showToast(`Theme changed to ${theme}`, "success");
}

function changeFontSize(size) {
    document.documentElement.style.fontSize = size + "px";
}

function changeBorderRadius(radius) {
    const rad = radius + 'px';
    const root = document.documentElement;
    root.style.setProperty('--card-border-radius', rad);
    root.style.setProperty('--btn-border-radius', rad);
    // You can add more variables here to control more elements
}

function resetStyles() {
    const root = document.documentElement;
    document.body.classList.remove('dark-theme');
    root.style.setProperty('--primary', '#4361ee');
    root.style.setProperty('--secondary', '#3a0ca3');
    root.style.fontSize = '16px';
    document.getElementById('fontSize').value = 16;
    document.getElementById('fontSizeValue').textContent = '16px';
    document.getElementById('themeSelect').value = 'light';
    showToast("Styles reset to default", "success");
}


// =================================================================================
// INTERACTIVE WIDGETS (Clock, Calendar, Mood)
// =================================================================================

let clockType = "digital";

function initializeClock() {
    // Try multiple ID fallbacks so the script works with different HTML versions
    const clockElement = document.getElementById("current-time") || document.getElementById("clock");
    const dateElement = document.getElementById("current-date") || document.getElementById("date");

    if (!clockElement && !dateElement) {
        console.warn("Clock/date elements not found. Skipping clock initialization.");
        return;
    }

    function updateClock() {
        const now = new Date();

        // Time format: HH:MM:SS (24-hour, British English standard)
        const timeString = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        // Date format: Weekday, Day Month Year
        const dateString = now.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (clockElement) clockElement.textContent = timeString;
        if (dateElement) dateElement.textContent = dateString;
    }

    updateClock(); // Initial call to display immediately
    setInterval(updateClock, 1000); // Update every second
}

/**
 * Sets the clock type (digital or analog) and updates UI accordingly.
 * Buttons in the HTML call this: setClockType('digital') or setClockType('analog')
 */
function setClockType(type) {
    clockType = type;
    const digitalToggle = document.getElementById("digitalToggle");
    const analogToggle = document.getElementById("analogToggle");
    const analogContainer = document.getElementById("analog-clock-container");
    const clockEl = document.getElementById("clock") || document.getElementById("current-time");

    if (digitalToggle) digitalToggle.classList.toggle("active", type === "digital");
    if (analogToggle) analogToggle.classList.toggle("active", type === "analog");
    if (analogContainer) analogContainer.style.display = type === "analog" ? "flex" : "none";
    if (clockEl) clockEl.style.display = type === "digital" ? "block" : "none";

    if (type === 'analog' && typeof drawAnalogClock === 'function') {
        drawAnalogClock();
    }
}

/**
 * Draws a simple analog clock on the canvas with id 'analog-clock' if present.
 */
function drawAnalogClock() {
    const canvas = document.getElementById("analog-clock");
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const radius = Math.min(canvas.width, canvas.height) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    const scaledRadius = radius * 0.90;

    // Face
    ctx.beginPath();
    ctx.arc(0, 0, scaledRadius, 0, 2 * Math.PI);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--card-bg') || '#fff';
    ctx.fill();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#4361ee';
    ctx.lineWidth = Math.max(2, scaledRadius * 0.03);
    ctx.stroke();

    // Ticks
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#333';
    for (let num = 0; num < 12; num++) {
        const ang = num * Math.PI / 6;
        const x = Math.cos(ang) * (scaledRadius * 0.85);
        const y = Math.sin(ang) * (scaledRadius * 0.85);
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, scaledRadius * 0.02), 0, 2 * Math.PI);
        ctx.fill();
    }

    // Hands
    const now = new Date();
    const hour = now.getHours() % 12;
    const minute = now.getMinutes();
    const second = now.getSeconds();

    const hourAngle = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
    drawHand(ctx, hourAngle, scaledRadius * 0.5, scaledRadius * 0.07);

    const minuteAngle = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    drawHand(ctx, minuteAngle, scaledRadius * 0.8, scaledRadius * 0.05);

    const secondAngle = (second * Math.PI / 30);
    drawHand(ctx, secondAngle, scaledRadius * 0.9, scaledRadius * 0.02, 'red');

    ctx.restore();
}

function drawHand(ctx, angle, length, width, color) {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color || (getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#333');
    ctx.rotate(angle);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.restore();
}

// Global state to track the currently viewed month in the calendar
let currentCalendarDate = new Date();

/**
 * Generates the calendar grid for a specific month.
 * @param {Date} date - The date object representing the month to display.
 */
function generateCalendar(date) {
    // Support multiple container IDs used across different HTML variants
    const calendarElement = document.getElementById("calendar-days") || document.getElementById("mini-calendar");
    const monthTitleElement = document.getElementById("current-month");

    if (!calendarElement || !monthTitleElement) {
        console.warn("Calendar elements not found. Skipping calendar generation.");
        return;
    }

    calendarElement.innerHTML = ''; // Clear existing days

    const year = date.getFullYear();
    const month = date.getMonth();
    const now = new Date(); // Used only to determine the current day for highlighting
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Set the month title (e.g., "September 2025")
    monthTitleElement.textContent = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    // 1. Add Day Names (Su, Mo, Tu, etc.)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayNames.forEach(day => {
        const dayNameEl = document.createElement('div');
        dayNameEl.className = 'calendar-day day-name';
        dayNameEl.textContent = day;
        calendarElement.appendChild(dayNameEl);
    });

    // 2. Determine start and end of the month
    // getDay() returns 0 for Sunday, 1 for Monday...
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    // Setting day to 0 gets the last day of the previous month.
    const daysInMonth = new Date(year, month + 1, 0).getDate(); 

    // 3. Create placeholders for preceding days
    for (let i = 0; i < firstDayOfMonth; i++) {
        const placeholder = document.createElement('div');
        placeholder.className = 'calendar-day empty';
        calendarElement.appendChild(placeholder);
    }

    // 4. Create day elements
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        // Highlight the current day if we are viewing the current month/year
        if (day === currentDay && month === currentMonth && year === currentYear) {
            dayEl.classList.add('current');
        }
        
        calendarElement.appendChild(dayEl);
    }
}

/**
 * Navigates the calendar to the previous month.
 */
function prevMonth() {
    // Set date to the 1st of the previous month to avoid issues with short months (e.g., setting Feb 31st)
    currentCalendarDate.setDate(1); 
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    generateCalendar(currentCalendarDate);
}

/**
 * Navigates the calendar to the next month.
 */
function nextMonth() {
    // Set date to the 1st of the next month
    currentCalendarDate.setDate(1);
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    generateCalendar(currentCalendarDate);
}

function trackMood(emoji) {
    const responses = {
        "😄": "Glad you're feeling great!",
        "🙂": "Have a wonderful day!",
        "😐": "Hope things look up soon.",
        "😢": "Sending positive vibes your way.",
        "😤": "Take a deep breath. You've got this.",
    };
    document.getElementById("mood-response").textContent = responses[emoji];
    showToast(`Mood logged: ${emoji}`, "success");
}
