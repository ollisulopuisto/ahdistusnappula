console.log("Ahdistusnappula script loaded.");

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const anxietyButtons = document.querySelectorAll('.anxiety-button');
    const storageKey = 'anxietyEntries';
    const navButtons = document.getElementById('nav-buttons');
    const navStats = document.getElementById('nav-stats');
    const buttonView = document.getElementById('button-view');
    const statsView = document.getElementById('stats-view');
    const anxietyChartCanvas = document.getElementById('anxietyChart');
    let chartInstance = null; // To hold the chart object
    const filterButtons = document.querySelectorAll('.filter-button');
    const chartTypeButtons = document.querySelectorAll('.chart-type-button'); // Get chart type buttons
    let currentFilterRange = 'all'; // Default filter
    let currentChartType = 'timeline'; // Default chart type

    // Function to save entry to Local Storage
    const saveEntry = (type) => {
        const timestamp = new Date().toISOString();
        const newEntry = { type, timestamp };

        // Get existing entries or initialize an empty array
        let entries = [];
        const storedEntries = localStorage.getItem(storageKey);
        if (storedEntries) {
            try {
                entries = JSON.parse(storedEntries);
                // Ensure it's an array
                if (!Array.isArray(entries)) {
                    console.error("Stored data is not an array, resetting.");
                    entries = [];
                }
            } catch (e) {
                console.error("Error parsing stored data:", e);
                // Reset to empty array if parsing fails
                entries = [];
            }
        }

        // Add the new entry
        entries.push(newEntry);

        // Save back to Local Storage
        try {
            localStorage.setItem(storageKey, JSON.stringify(entries));
            console.log(`Entry saved: Type=${type}, Timestamp=${timestamp}`);
            // Optional: Add visual feedback here later
        } catch (e) {
            console.error("Error saving data to Local Storage:", e);
            alert("Tallennus Local Storageen epäonnistui. Selain saattaa olla täynnä tai yksityisyysasetukset estävät tallennuksen.");
        }
    };

    // Add event listeners to buttons
    anxietyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.getAttribute('data-type');
            if (type) {
                saveEntry(type);
                // Simple visual feedback: temporary class change
                button.classList.add('clicked');
                setTimeout(() => button.classList.remove('clicked'), 200); // Remove after 200ms
            } else {
                console.error("Button is missing data-type attribute:", button);
            }
        });
    });

    // Function to load data and render the chart
    const renderChart = () => {
        console.log(`Rendering chart: Type=${currentChartType}, Filter=${currentFilterRange}`);
        const storedEntries = localStorage.getItem(storageKey);
        let allEntries = [];
        if (storedEntries) {
            try {
                allEntries = JSON.parse(storedEntries);
                if (!Array.isArray(allEntries)) allEntries = [];
                allEntries.forEach(entry => entry.timestamp = new Date(entry.timestamp));
            } catch (e) {
                console.error("Error parsing stored data for chart:", e);
                allEntries = [];
            }
        }

        // --- Filter entries based on currentFilterRange ---
        const now = new Date();
        const filteredEntries = allEntries.filter(entry => {
            if (currentFilterRange === 'all') {
                return true;
            }
            const days = parseInt(currentFilterRange, 10);
            const cutoffDate = new Date(now);
            cutoffDate.setDate(now.getDate() - days);
            return entry.timestamp instanceof Date && !isNaN(entry.timestamp) && entry.timestamp >= cutoffDate;
        });
        // Sort only if needed (e.g., for timeline, though Chart.js might handle it)
        // filteredEntries.sort((a, b) => a.timestamp - b.timestamp);
        // --- End filtering ---

        if (!anxietyChartCanvas) {
            console.error("Canvas element not found!");
            return;
        }
        const ctx = anxietyChartCanvas.getContext('2d');
        if (!ctx) {
             console.error("Failed to get canvas context!");
            return;
        }

        // --- Chart Data Preparation (Conditional based on currentChartType) ---
        let chartConfig; // Will hold the specific config for the chart type

        if (currentChartType === 'timeline') {
            // --- Timeline Data Prep ---
            const countsPerDay = filteredEntries.reduce((acc, entry) => {
                const day = entry.timestamp.toISOString().split('T')[0]; // Get YYYY-MM-DD
                acc[day] = (acc[day] || 0) + 1;
                return acc;
            }, {});

            // Prepare data points for the chart {x: date, y: count}
            const dataPoints = Object.keys(countsPerDay).map(day => ({
                x: day, // Keep as string 'YYYY-MM-DD' for Chart.js time scale
                y: countsPerDay[day]
            }));

            // Sort data points by date (important for line chart)
            dataPoints.sort((a, b) => new Date(a.x) - new Date(b.x));


            chartConfig = {
                type: 'line', // Change to line chart
                data: {
                    // labels are not needed when data is {x, y} objects
                    datasets: [{
                        label: `Ahdistuspainallusten määrä päivittäin (${currentFilterRange === 'all' ? 'Kaikki' : 'Viim. ' + currentFilterRange + ' pv'})`, // Update label
                        data: dataPoints, // Use the processed data points
                        fill: false, // Just the line
                        borderColor: 'rgb(255, 99, 132)', // Red line
                        tension: 0.1 // Slight curve to the line
                    }]
                },
                options: {
                    scales: {
                        x: {
                            type: 'time', // Use time scale
                            time: {
                                unit: 'day', // Display units in days
                                tooltipFormat: 'PP', // Format for tooltips (requires date-fns adapter) e.g., "Aug 2, 2023"
                                displayFormats: {
                                    day: 'MMM d' // Format for axis labels e.g., "Aug 2"
                                }
                            },
                            title: {
                                display: true,
                                text: 'Päivämäärä'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1 // Ensure only whole numbers are shown
                            },
                            title: {
                                display: true,
                                text: 'Painallusten määrä'
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: true // Adjust as needed
                }
            };
            // --- End Timeline Data Prep ---
        } else { // 'byType'
            // --- By Type Data Prep ---
            const countsByType = filteredEntries.reduce((acc, entry) => {
                acc[entry.type] = (acc[entry.type] || 0) + 1;
                return acc;
            }, {});

            const labels = Object.keys(countsByType);
            const data = Object.values(countsByType);

            chartConfig = {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Ahdistuspainallusten määrä tyypeittäin (${currentFilterRange === 'all' ? 'Kaikki' : 'Viim. ' + currentFilterRange + ' pv'})`,
                        data: data,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        x: { // Optional: Add title for type axis if needed
                             title: { display: true, text: 'Ahdistuksen tyyppi' }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1 // Ensure only whole numbers are shown
                            },
                            title: {
                                display: true,
                                text: 'Painallusten määrä'
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: true // Adjust as needed
                }
            };
            // --- End By Type Data Prep ---
        }


        // --- Calculate and display text summary (using filtered entries) ---
        const totalFilteredEntries = filteredEntries.length;
        const statsSummaryDiv = document.getElementById('stats-summary');
        if (statsSummaryDiv) {
            let filterText = "Kaikki";
            if (currentFilterRange !== 'all') {
                filterText = `Viimeiset ${currentFilterRange} päivää`;
            }
            statsSummaryDiv.textContent = `Yhteensä ${totalFilteredEntries} ahdistuspainallusta aikavälillä "${filterText}".`;
        } else {
            console.warn("Stats summary div not found.");
        }
        // --- End of text summary ---


        // Destroy previous chart instance if it exists
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Create new chart using the generated chartConfig
        try {
             chartInstance = new Chart(ctx, chartConfig); // Use the dynamic config
            console.log(`Chart rendered successfully: Type=${currentChartType}, Filter=${currentFilterRange}`);
        } catch(e) {
            console.error("Error creating chart:", e);
        }
    };

    // --- Filter Button Logic ---
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to the clicked button
            button.classList.add('active');
            // Update the current filter range
            currentFilterRange = button.getAttribute('data-range');
            // Re-render the chart with the new filter
            renderChart();
        });
    });

    // --- Chart Type Button Logic ---
    chartTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            chartTypeButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to the clicked button
            button.classList.add('active');
            // Update the current chart type
            currentChartType = button.getAttribute('data-chart-type');
            // Re-render the chart with the new chart type
            renderChart();
        });
    });


    // Navigation Logic
    if (navButtons && navStats && buttonView && statsView) {
        navButtons.addEventListener('click', () => {
            buttonView.style.display = 'block';
            statsView.style.display = 'none';
        });

        navStats.addEventListener('click', () => {
            buttonView.style.display = 'none';
            statsView.style.display = 'block';
            // Load/render stats when the view is shown (will use current filter)
            renderChart();
        });
    } else {
        console.error("Navigation elements or views not found.");
    }

    // Initial setup: Ensure default buttons are marked active (already done in HTML)

}); // End of DOMContentLoaded
