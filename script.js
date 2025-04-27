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
        console.log("Attempting to render chart...");
        const storedEntries = localStorage.getItem(storageKey);
        let entries = [];
        if (storedEntries) {
            try {
                entries = JSON.parse(storedEntries);
                if (!Array.isArray(entries)) entries = [];
                // Ensure timestamps are Date objects for sorting
                entries.forEach(entry => entry.timestamp = new Date(entry.timestamp));
                // Sort entries by date
                entries.sort((a, b) => a.timestamp - b.timestamp);
            } catch (e) {
                console.error("Error parsing stored data for chart:", e);
                entries = [];
            }
        }

        if (!anxietyChartCanvas) {
            console.error("Canvas element not found!");
            return;
        }
        const ctx = anxietyChartCanvas.getContext('2d');
        if (!ctx) {
             console.error("Failed to get canvas context!");
            return;
        }

        // --- Chart Data Preparation (Timeline: Count per Day) ---
        const countsPerDay = entries.reduce((acc, entry) => {
            // Use toLocaleDateString for consistent local date formatting (YYYY-MM-DD might vary)
            // Or use a library like date-fns format(entry.timestamp, 'yyyy-MM-dd') if more precision needed
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

        // --- Calculate and display text summary ---
        const totalEntries = entries.length; // Simpler way to get total
        const statsSummaryDiv = document.getElementById('stats-summary');
        if (statsSummaryDiv) {
            statsSummaryDiv.textContent = `Yhteensä ${totalEntries} ahdistuspainallusta kirjattu.`;
        } else {
            console.warn("Stats summary div not found.");
        }
        // --- End of text summary ---


        // Destroy previous chart instance if it exists
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Create new chart (Line Chart for Timeline)
        try {
             chartInstance = new Chart(ctx, {
                type: 'line', // Change to line chart
                data: {
                    // labels are not needed when data is {x, y} objects
                    datasets: [{
                        label: 'Ahdistuspainallusten määrä päivittäin',
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
            });
            console.log("Chart rendered successfully as a timeline.");
        } catch(e) {
            console.error("Error creating chart:", e);
        }
    };


    // Navigation Logic
    if (navButtons && navStats && buttonView && statsView) {
        navButtons.addEventListener('click', () => {
            buttonView.style.display = 'block';
            statsView.style.display = 'none';
        });

        navStats.addEventListener('click', () => {
            buttonView.style.display = 'none';
            statsView.style.display = 'block';
            // Load/render stats when the view is shown
            renderChart();
        });
    } else {
        console.error("Navigation elements or views not found.");
    }

}); // End of DOMContentLoaded
