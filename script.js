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

        // --- Chart Data Preparation (Example: Count by Type) ---
        const countsByType = entries.reduce((acc, entry) => {
            acc[entry.type] = (acc[entry.type] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(countsByType);
        const data = Object.values(countsByType);

        // --- Calculate and display text summary ---
        const totalEntries = data.reduce((sum, count) => sum + count, 0);
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

        // Create new chart
        try {
             chartInstance = new Chart(ctx, {
                type: 'bar', // Example: Bar chart
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Ahdistuspainallusten määrä tyypeittäin',
                        data: data,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)', // Reddish bars
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                // Ensure only whole numbers are shown on the y-axis
                                stepSize: 1
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: true // Adjust as needed
                }
            });
            console.log("Chart rendered successfully.");
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
