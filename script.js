// Selects the USGS feed for magnitude 2.5+ earthquakes in the past day.
let apiURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

// Stores the latest earthquake time from the API in milliseconds.
let eventTime = null;

// Calculates and displays how much time has passed since the latest earthquake.
function updateTime() {
    // Skips the timer until an earthquake time has been received.
    if (eventTime === null) {
        return;
    }

    // Converts the time difference from milliseconds into whole seconds.
    let seconds = Math.max(0, Math.floor((Date.now() - eventTime) / 1000));
    // Splits the elapsed seconds into hours, minutes and seconds.
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remaining = seconds % 60;

    // Shows the updated time on the webpage.
    document.querySelector("#elapsed").textContent = hours + "h " + minutes + "m " + remaining + "s";
}

// Requests recent earthquake records and updates the page with the returned data.
async function getEarthquake() {
    // Shows a loading message and disables Refresh during the request.
    document.querySelector("#status").textContent = "Updating USGS records...";
    document.querySelector("#refresh").disabled = true;

    try {
        // Sends a request to the USGS public API.
        const response = await fetch(apiURL);

        // Sends unsuccessful HTTP responses to the error handler.
        if (!response.ok) {
            throw new Error("Request failed");
        }

        // Converts the response into JSON and reads the earthquake records array.
        const data = await response.json();
        let earthquakes = data.features;

        // Clears event information and hides all five rows if the feed is empty.
        if (earthquakes.length === 0) {
            eventTime = null;
            document.querySelector("#status").textContent = "No M2.5+ events found in the past 24 hours.";
            document.querySelector("#elapsed").textContent = "--";
            document.querySelector("#count").textContent = "0";
            document.querySelector("#strongest").textContent = "--";
            document.querySelector("#large-count").textContent = "0";
            document.querySelector("#magnitude").textContent = "M --";
            document.querySelector("#location").textContent = "No recent events found";
            document.querySelector("#depth").textContent = "--";
            document.querySelector("#coordinates").textContent = "--";
            document.querySelector("#event-date").textContent = "--";
            document.querySelector("#record-status").textContent = "--";
            document.querySelector("#pulse").className = "pulse";
            for (let i = 0; i < 5; i++) {
                document.querySelector("#row-" + i).style.display = "none";
            }
            document.querySelector("#refresh").disabled = false;
            return;
        }

        // Checks each earthquake to find the strongest magnitude and count M4.5+ events.
        let strongest = 0;
        let largeCount = 0;

        for (let i = 0; i < earthquakes.length; i++) {
            let mag = earthquakes[i].properties.mag;
            if (mag > strongest) {
                strongest = mag;
            }
            if (mag >= 4.5) {
                largeCount++;
            }
        }

        // Displays the total number of events, highest magnitude and M4.5+ count.
        document.querySelector("#count").textContent = earthquakes.length;
        document.querySelector("#strongest").textContent = "M " + strongest.toFixed(1);
        document.querySelector("#large-count").textContent = largeCount;

        // Selects the newest record and saves its magnitude and event time.
        let latest = earthquakes[0];
        let magnitude = latest.properties.mag;
        eventTime = latest.properties.time;
        document.querySelector("#magnitude").textContent = "M " + magnitude.toFixed(1);
        document.querySelector("#location").textContent = latest.properties.place || "Location unavailable";
        // Reads depth, latitude and longitude from the USGS coordinates array.
        document.querySelector("#depth").textContent = latest.geometry.coordinates[2].toFixed(1) + " km";
        document.querySelector("#coordinates").textContent = latest.geometry.coordinates[1].toFixed(2) + "°, " + latest.geometry.coordinates[0].toFixed(2) + "°";
        // Displays the event time in the visitor's local timezone and links to USGS.
        document.querySelector("#event-date").textContent = new Date(eventTime).toLocaleString();
        document.querySelector("#record-status").textContent = latest.properties.status;
        document.querySelector("#event-link").href = latest.properties.url;
        updateTime();

        // Uses three magnitude ranges to set the circle colour and range label.
        if (magnitude < 4) {
            document.querySelector("#pulse").className = "pulse low";
            document.querySelector("#range").textContent = "BELOW M4.0";
        } else if (magnitude < 5) {
            document.querySelector("#pulse").className = "pulse medium";
            document.querySelector("#range").textContent = "M4.0 TO M4.9";
        } else {
            document.querySelector("#pulse").className = "pulse high";
            document.querySelector("#range").textContent = "M5.0 OR ABOVE";
        }

        // Fills up to five rows with recent events and scales each bar to the strongest event.
        for (let i = 0; i < 5; i++) {
            if (i < earthquakes.length) {
                let item = earthquakes[i];
                document.querySelector("#row-" + i).style.display = "block";
                document.querySelector("#mag-" + i).textContent = "M " + item.properties.mag.toFixed(1);
                document.querySelector("#place-" + i).textContent = item.properties.place || "Unknown location";
                // Converts magnitude into a percentage of the strongest event for the bar.
                document.querySelector("#bar-" + i).style.width = (item.properties.mag / strongest * 100) + "%";
            } else {
                document.querySelector("#row-" + i).style.display = "none";
            }
        }

        // Shows the update time and enables Refresh after a successful request.
        document.querySelector("#status").textContent = "Feed updated: " + new Date().toLocaleTimeString();
        document.querySelector("#refresh").disabled = false;

    } catch (error) {
        // Displays an error message and re-enables Refresh when the request fails.
        console.error("Error:", error);
        document.querySelector("#status").textContent = "Unable to reach USGS. Try refreshing.";
        document.querySelector("#refresh").disabled = false;
    }
}

// Runs the API request when the visitor clicks Refresh.
document.querySelector("#refresh").addEventListener("click", getEarthquake);

// Loads the latest earthquake data as soon as the page opens.
getEarthquake();

// Recalculates the elapsed time every 1000 milliseconds (one second).
setInterval(updateTime, 1000);

// Requests updated USGS records every 60000 milliseconds (one minute).
setInterval(getEarthquake, 60000);
