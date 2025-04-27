document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY_PRESSES = 'anxietyPresses';
    const STORAGE_KEY_USERNAME = 'anxietyUsername';
    const STORAGE_KEY_BUTTONS = 'anxietyButtons';

    const buttonView = document.getElementById('button-view');
    const statsView = document.getElementById('stats-view');
    const settingsView = document.getElementById('settings-view');
    const navButtonsBtn = document.getElementById('nav-buttons');
    const navStatsBtn = document.getElementById('nav-stats');
    const navSettingsBtn = document.getElementById('nav-settings');
    const usernamePlaceholder = document.getElementById('username-placeholder');
    const lastPressInfo = document.getElementById('last-press-info');
    const anxietyButtonsContainer = document.getElementById('anxiety-buttons-container');
    const buttonEditor = document.getElementById('button-editor');
    const newButtonLabelInput = document.getElementById('new-button-label');
    const addButtonBtn = document.getElementById('add-button');
    const changeNameBtn = document.getElementById('change-name-button');

    let anxietyPresses = JSON.parse(localStorage.getItem(STORAGE_KEY_PRESSES) || '[]');
    let username = localStorage.getItem(STORAGE_KEY_USERNAME);
    let anxietyButtons = JSON.parse(localStorage.getItem(STORAGE_KEY_BUTTONS) || JSON.stringify([
        // Default buttons if none are stored
        { id: 'KOULU', label: 'KOULU AHDISTAA' },
        { id: 'VANHEMMAT', label: 'VANHEMMAT AHDISTAA' },
        { id: 'KAVERIT', label: 'KAVERIT AHDISTAA' },
        { id: 'AIKATAULUT', label: 'AIKATAULUT AHDISTAA' },
        { id: 'SIIVOAMINEN', label: 'SIIVOAMINEN AHDISTAA' },
        { id: 'MUU', label: 'MUU SYY AHDISTAA' }
    ]));

    let anxietyChart = null; // Chart instance
    let currentFilterRange = 'all'; // '7', '30', 'all'
    let currentChartType = 'timeline'; // 'timeline', 'byType'

    // --- Initialization ---

    function init() {
        checkUsername();
        setupNavigation();
        renderButtonView();
        renderSettingsView(); // Render settings view initially to populate editor
        updateLastPressInfo();
        setupChartFilterListeners();
        setupChartTypeListeners();
        setupSettingsListeners();
        showView('button-view'); // Show button view by default
    }

    // --- Personalization ---

    function checkUsername() {
        if (!username) {
            askForUsername();
        } else {
            updateGreeting();
        }
    }

    function askForUsername(force = false) {
        const newName = prompt(force ? "Syötä uusi nimesi:" : "Hei! Mikä sinun nimesi on?");
        if (newName && newName.trim() !== '') {
            username = newName.trim();
            localStorage.setItem(STORAGE_KEY_USERNAME, username);
            updateGreeting();
        } else if (!username) {
            // Handle case where user cancels initial prompt
            username = "siellä"; // Default fallback
            updateGreeting();
        }
    }

    function updateGreeting() {
        if (usernamePlaceholder) {
            usernamePlaceholder.textContent = username;
        }
    }

    changeNameBtn.addEventListener('click', () => askForUsername(true));

    // --- Navigation ---

    function setupNavigation() {
        const navLinks = [
            { btn: navButtonsBtn, viewId: 'button-view' },
            { btn: navStatsBtn, viewId: 'stats-view' },
            { btn: navSettingsBtn, viewId: 'settings-view' }
        ];

        navLinks.forEach(link => {
            link.btn.addEventListener('click', () => {
                showView(link.viewId);
                // Update active class on nav buttons
                navLinks.forEach(l => l.btn.classList.remove('active'));
                link.btn.classList.add('active');
            });
        });
    }

    function showView(viewId) {
        [buttonView, statsView, settingsView].forEach(view => {
            view.style.display = view.id === viewId ? 'block' : 'none';
        });
        // Special actions when showing specific views
        if (viewId === 'stats-view') {
            renderChart(); // Render chart when stats view is shown
        }
        if (viewId === 'button-view') {
            renderButtonView(); // Re-render buttons if they were changed
        }
         if (viewId === 'settings-view') {
            renderSettingsView(); // Re-render settings if buttons were changed
        }
    }

    // --- Button Rendering and Handling ---

    function renderButtonView() {
        anxietyButtonsContainer.innerHTML = ''; // Clear existing buttons

        // Remove any existing cat overlays first
        document.querySelectorAll('.cat-overlay').forEach(cat => cat.remove());

        // Separate the 'MUU' button
        const otherButtons = anxietyButtons.filter(button => button.id !== 'MUU');
        const muuButtonData = anxietyButtons.find(button => button.id === 'MUU');

        // Render other buttons
        otherButtons.forEach(buttonData => {
            createAndAppendButton(buttonData);
        });

        // Render the 'MUU' button last if it exists
        if (muuButtonData) {
            createAndAppendButton(muuButtonData);
        }

        // --- Add Cat Logic --- (remains the same, runs after all buttons are in DOM)
        if (anxietyPresses.length > 0) {
            // Calculate frequencies only for currently existing buttons
            const existingButtonIds = new Set(anxietyButtons.map(b => b.id));
            const counts = anxietyPresses.reduce((acc, press) => {
                if (existingButtonIds.has(press.type)) { // Only count presses for buttons that still exist
                    acc[press.type] = (acc[press.type] || 0) + 1;
                }
                return acc;
            }, {});

            let mostFrequentType = null;
            let maxCount = 0;

            // Ensure 'MUU' isn't counted for cat placement if desired, or handle tie-breaking
            for (const type in counts) {
                 // Optional: Exclude 'MUU' from getting the cat
                 // if (type === 'MUU') continue;

                if (counts[type] > maxCount) {
                    maxCount = counts[type];
                    mostFrequentType = type;
                }
                // Simple tie-breaking: keep the first one found with maxCount
            }

            // Find the button element and add the cat
            if (mostFrequentType) {
                const targetButton = anxietyButtonsContainer.querySelector(`.anxiety-button[data-type="${mostFrequentType}"]`);
                if (targetButton) {
                    addCatToButton(targetButton);
                }
            }
        }
        // --- End Cat Logic ---
    }

    // Helper function to create and append a single button
    function createAndAppendButton(buttonData) {
        const button = document.createElement('button');
        button.className = 'anxiety-button';
        button.dataset.type = buttonData.id; // Use ID as type
        button.textContent = buttonData.label;
        // Add specific class or style if it's the MUU button for CSS targeting
        if (buttonData.id === 'MUU') {
            button.classList.add('muu-button'); // Add a class for easier styling
        }
        button.addEventListener('click', handleAnxietyButtonClick);
        anxietyButtonsContainer.appendChild(button);
    }

    function addCatToButton(buttonElement) {
        const catOverlay = document.createElement('div');
        catOverlay.className = 'cat-overlay';
        // Set the text content to a different cat emoji
        catOverlay.textContent = '🐱'; // Changed from 🐈

        buttonElement.appendChild(catOverlay);
    }


    function handleAnxietyButtonClick(event) {
        const type = event.target.dataset.type;
        const timestamp = new Date().toISOString();

        if (type === 'MUU') {
            const specificReason = prompt("Mikä muu syy ahdistaa?");
            if (specificReason && specificReason.trim() !== '') {
                const newLabel = specificReason.trim().toUpperCase() + " AHDISTAA"; // Standardize label
                const newId = newLabel.replace(/\s+/g, '_'); // Create ID from label

                // Check if a button with this label already exists
                const existingButton = anxietyButtons.find(btn => btn.label === newLabel || btn.id === newId);

                if (existingButton) {
                    // If button exists, log press with its ID
                    logAnxietyPress(existingButton.id, timestamp);
                    giveVisualFeedback(event.target); // Give feedback on the 'MUU' button still
                    alert(`Ahdistus kirjattu olemassa olevalle napille: "${existingButton.label}"`);
                } else {
                    // If button doesn't exist, create it
                    const newButtonData = { id: newId, label: newLabel };
                    anxietyButtons.push(newButtonData);
                    saveButtons(); // Save the updated button list
                    logAnxietyPress(newId, timestamp); // Log press with the NEW ID
                    renderButtonView(); // Re-render buttons to show the new one
                    // Find the newly added button element for feedback (optional)
                    const newButtonElement = anxietyButtonsContainer.querySelector(`[data-type="${newId}"]`);
                    if (newButtonElement) {
                         giveVisualFeedback(newButtonElement);
                    } else {
                         giveVisualFeedback(event.target); // Fallback feedback on 'MUU' button
                    }
                    alert(`Uusi nappi "${newLabel}" lisätty ja ahdistus kirjattu.`);
                }
            } else {
                // User cancelled or entered empty reason, do nothing.
                console.log("MUU press cancelled or no reason given.");
                return; // Don't log 'MUU' if no specific reason is provided
            }
        } else {
            // Original logic for non-'MUU' buttons
            logAnxietyPress(type, timestamp);
            giveVisualFeedback(event.target);
        }
    }

    // Extracted logging and feedback logic into separate functions
    function logAnxietyPress(type, timestamp) {
        anxietyPresses.push({ type, timestamp });
        localStorage.setItem(STORAGE_KEY_PRESSES, JSON.stringify(anxietyPresses));
        console.log(`Button pressed: ${type} at ${timestamp}`);
        updateLastPressInfo(); // Update info based on the actual logged press
    }

    function giveVisualFeedback(buttonElement) {
         if (!buttonElement) return;
         // Use CSS variables for colors
         const feedbackColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();

         // Apply styles directly for the feedback effect
         buttonElement.style.backgroundColor = feedbackColor;
         buttonElement.style.transform = 'scale(0.92)'; // Match CSS active scale

         // Revert styles after the animation duration
         setTimeout(() => {
            buttonElement.style.backgroundColor = ''; // Revert color (back to CSS rule)
            buttonElement.style.transform = ''; // Revert transform
        }, 300); // Match the updated CSS transition duration (0.3s = 300ms)
    }


    function updateLastPressInfo() {
        if (anxietyPresses.length > 0) {
            const lastPress = anxietyPresses[anxietyPresses.length - 1];
            const time = new Date(lastPress.timestamp);
            const formattedTime = time.toLocaleString('fi-FI');
            const buttonLabel = anxietyButtons.find(b => b.id === lastPress.type)?.label || lastPress.type;
            lastPressInfo.textContent = `Viimeksi painettu: ${buttonLabel} (${formattedTime})`;
        } else {
            lastPressInfo.textContent = 'Ei painalluksia vielä.';
        }
    }

    // --- Settings View ---

    function renderSettingsView() {
        buttonEditor.innerHTML = ''; // Clear current editor items
        anxietyButtons.forEach((buttonData, index) => {
            const item = document.createElement('div');
            item.className = 'button-editor-item';
            item.dataset.index = index; // Store index for editing/deleting

            const labelSpan = document.createElement('span');
            labelSpan.textContent = buttonData.label;

            const editButton = document.createElement('button');
            editButton.className = 'edit-button';
            editButton.textContent = 'Muokkaa';
            editButton.addEventListener('click', () => editButtonLabel(index));

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.textContent = 'Poista';
            deleteButton.addEventListener('click', () => deleteButtonByIndex(index));

            item.appendChild(labelSpan);
            item.appendChild(editButton);
            item.appendChild(deleteButton);
            buttonEditor.appendChild(item);
        });
    }

     function editButtonLabel(index) {
        const item = buttonEditor.querySelector(`.button-editor-item[data-index="${index}"]`);
        if (!item) return;

        const currentLabel = anxietyButtons[index].label;
        const labelSpan = item.querySelector('span');
        const editButton = item.querySelector('.edit-button');
        const deleteButton = item.querySelector('.delete-button');

        // Hide span and original buttons
        labelSpan.style.display = 'none';
        editButton.style.display = 'none';
        deleteButton.style.display = 'none';

        // Create input field
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = currentLabel;

        // Create save button
        const saveButton = document.createElement('button');
        saveButton.className = 'save-button';
        saveButton.textContent = 'Tallenna';
        saveButton.addEventListener('click', () => {
            const newLabel = inputField.value.trim();
            if (newLabel) {
                // Simple ID generation (can be improved for uniqueness)
                const newId = newLabel.toUpperCase().replace(/\s+/g, '_');
                anxietyButtons[index] = { id: newId, label: newLabel };
                saveButtons();
                renderSettingsView(); // Re-render the editor
            } else {
                // If label is empty, revert
                 cancelEdit(index);
            }
        });

        // Create cancel button
        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel-button';
        cancelButton.textContent = 'Peruuta';
        cancelButton.addEventListener('click', () => cancelEdit(index));

        // Add new elements
        item.insertBefore(inputField, item.firstChild); // Add input first
        item.appendChild(saveButton);
        item.appendChild(cancelButton);
        inputField.focus(); // Focus the input field
    }

    function cancelEdit(index) {
         // Simply re-render the settings view to discard changes
         renderSettingsView();
    }


    function deleteButtonByIndex(index) {
        if (confirm(`Haluatko varmasti poistaa napin "${anxietyButtons[index].label}"?`)) {
            anxietyButtons.splice(index, 1);
            saveButtons();
            renderSettingsView(); // Update editor view
            // Note: Button view will update next time it's shown
        }
    }

    function setupSettingsListeners() {
        addButtonBtn.addEventListener('click', () => {
            const newLabel = newButtonLabelInput.value.trim();
            if (newLabel) {
                // Simple ID generation (can be improved for uniqueness)
                const newId = newLabel.toUpperCase().replace(/\s+/g, '_');
                // Check if ID already exists (optional but good practice)
                if (anxietyButtons.some(b => b.id === newId)) {
                    alert('Tämän niminen nappula on jo olemassa (eriytä nimellä).');
                    return;
                }
                anxietyButtons.push({ id: newId, label: newLabel });
                saveButtons();
                newButtonLabelInput.value = ''; // Clear input
                renderSettingsView(); // Update editor view
                 // Note: Button view will update next time it's shown
            } else {
                alert('Anna napille teksti.');
            }
        });
    }

    function saveButtons() {
        localStorage.setItem(STORAGE_KEY_BUTTONS, JSON.stringify(anxietyButtons));
        console.log('Buttons saved:', anxietyButtons);
         // If stats view is active, re-render chart with potentially new types
        if (statsView.style.display === 'block') {
            renderChart();
        }
        // Also re-render settings view if it's active
        if (settingsView.style.display === 'block') {
            renderSettingsView();
        }
    }


    // --- Stats View & Chart ---

    function setupChartFilterListeners() {
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', (e) => {
                currentFilterRange = e.target.dataset.range;
                document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                renderChart();
            });
        });
    }

     function setupChartTypeListeners() {
        document.querySelectorAll('.chart-type-button').forEach(button => {
            button.addEventListener('click', (e) => {
                currentChartType = e.target.dataset.chartType;
                document.querySelectorAll('.chart-type-button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                renderChart();
            });
        });
    }

    function getFilteredData() {
        const now = new Date();
        let cutoffDate = new Date(0); // Beginning of time for 'all'

        if (currentFilterRange === '7') {
            cutoffDate = new Date(now.setDate(now.getDate() - 7));
        } else if (currentFilterRange === '30') {
            cutoffDate = new Date(now.setDate(now.getDate() - 30));
        }
        cutoffDate.setHours(0, 0, 0, 0); // Start of the day

        return anxietyPresses.filter(press => new Date(press.timestamp) >= cutoffDate);
    }

    function renderChart() {
        const ctx = document.getElementById('anxietyChart').getContext('2d');
        const filteredData = getFilteredData();

        // Get computed styles for chart colors
        const computedStyle = getComputedStyle(document.documentElement);
        const textColor = computedStyle.getPropertyValue('--text-color').trim();
        const borderColor = computedStyle.getPropertyValue('--border-color').trim();


        if (anxietyChart) {
            anxietyChart.destroy(); // Destroy previous chart instance
        }

        if (currentChartType === 'timeline') {
            // Pass colors to the rendering function
            renderTimelineChart(ctx, filteredData, textColor, borderColor);
        } else { // 'byType'
            // Pass colors to the rendering function
            renderByTypeChart(ctx, filteredData, textColor, borderColor);
        }
    }

    // Modify renderTimelineChart to accept textColor and borderColor
    function renderTimelineChart(ctx, data, textColor, borderColor) {
         // Group data by day and type for timeline view
        const datasets = {};
        const buttonLabels = anxietyButtons.reduce((acc, btn) => {
            acc[btn.id] = btn.label;
            return acc;
        }, {});

        // Initialize datasets for all current button types
        anxietyButtons.forEach(btn => {
            datasets[btn.id] = {
                label: btn.label,
                data: {}, // Use object for sparse dates { 'YYYY-MM-DD': count }
                borderColor: getRandomColor(), // Assign a color per type
                backgroundColor: getRandomColor(0.5), // Semi-transparent fill
                tension: 0.1,
                fill: false,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            };
        });


        data.forEach(press => {
            const dateStr = press.timestamp.substring(0, 10); // YYYY-MM-DD
            if (datasets[press.type]) { // Only include presses for existing button types
                 datasets[press.type].data[dateStr] = (datasets[press.type].data[dateStr] || 0) + 1;
            }
        });

        // Convert data objects to arrays of {x, y} for Chart.js
        const chartDatasets = Object.values(datasets).map(ds => ({
            ...ds,
            data: Object.entries(ds.data).map(([date, count]) => ({ x: date, y: count })).sort((a, b) => a.x.localeCompare(b.x)) // Sort data points by date
        })).filter(ds => ds.data.length > 0); // Only include datasets with data


        anxietyChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: chartDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                 scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: determineTimeUnit(data), // Auto-determine unit (day, week, month)
                            tooltipFormat: 'PPp', // Format for tooltips (e.g., Sep 4, 2024, 2:30 PM)
                             displayFormats: {
                                day: 'MMM d', // e.g., Sep 4
                                week: 'MMM d',
                                month: 'MMM yyyy' // e.g., Sep 2024
                            }
                        },
                        title: {
                            display: true,
                            text: 'Aika',
                            color: textColor // Use parameter
                        },
                        ticks: { color: textColor }, // Use parameter
                        grid: { color: borderColor } // Use parameter
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Painallusten määrä',
                            color: textColor // Use parameter
                        },
                         ticks: {
                            color: textColor, // Use parameter
                            stepSize: 1 // Ensure integer steps for counts
                        },
                        grid: { color: borderColor } // Use parameter
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: textColor } // Use parameter
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                             title: function(tooltipItems) {
                                // Format title based on the first item's parsed date
                                if (tooltipItems.length > 0) {
                                    const date = new Date(tooltipItems[0].parsed.x);
                                    return date.toLocaleDateString('fi-FI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                }
                                return '';
                            }
                        },
                        titleColor: textColor, // Use parameter
                        bodyColor: textColor, // Use parameter
                    }
                },
                 interaction: { // Improve hover interaction
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

     function determineTimeUnit(data) {
        if (!data || data.length === 0) return 'day';
        const firstDate = new Date(data[0].timestamp);
        const lastDate = new Date(data[data.length - 1].timestamp);
        const diffDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24);

        if (diffDays > 90) return 'month';
        if (diffDays > 14) return 'week';
        return 'day';
    }

    // Modify renderByTypeChart to accept textColor and borderColor
    function renderByTypeChart(ctx, data, textColor, borderColor) {
        const counts = {};
        const labels = [];
        const chartData = [];
        const backgroundColors = [];
        const borderColors = []; // Add array for border colors

        // Initialize counts for all defined button types to ensure they appear even with 0 count
        anxietyButtons.forEach(btn => {
            counts[btn.id] = { count: 0, label: btn.label };
        });

        // Count presses for existing types
        data.forEach(press => {
            if (counts[press.type]) { // Check if the type still exists
                counts[press.type].count++;
            }
            // Optional: Handle presses of types that were deleted later?
            // else { // Handle presses of deleted button types
            //     if (!counts['deleted']) counts['deleted'] = { count: 0, label: 'Poistettu tyyppi' };
            //     counts['deleted'].count++;
            // }
        });

        // Prepare data for the chart, only include types with counts > 0 or all types if needed
        Object.entries(counts).forEach(([typeId, dataObj]) => {
            // if (dataObj.count > 0) { // Uncomment to only show types with presses
                labels.push(dataObj.label);
                chartData.push(dataObj.count);
                const bgColor = getRandomColor(0.7); // Use semi-transparent colors
                backgroundColors.push(bgColor);
                borderColors.push(bgColor.replace('0.7', '1')); // Make border opaque based on bg
            // }
        });


        anxietyChart = new Chart(ctx, {
            type: 'pie', // Or 'doughnut' or 'bar'
            data: {
                labels: labels,
                datasets: [{
                    label: 'Painallukset tyypeittäin',
                    data: chartData,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors, // Use generated border colors
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                         labels: { color: textColor } // Use parameter
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed;
                                }
                                const total = context.dataset.data.reduce((acc, value) => acc + value, 0);
                                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) + '%' : '0%';
                                label += ` (${percentage})`;
                                return label;
                            }
                        },
                        titleColor: textColor, // Use parameter
                        bodyColor: textColor, // Use parameter
                    }
                }
            }
        });
    }

    // Helper function for random colors
    function getRandomColor(alpha = 1) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // --- Start the application ---
    init();
});
