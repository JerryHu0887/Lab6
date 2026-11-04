let apiURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";
let eventTime = null;

// Updates the time elapsed since the earthquake.
function updateTime() {
    if (eventTime === null) {
        return;
    }

    let seconds = Math.max(0, Math.floor((Date.now() - eventTime) / 1000));
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    document.querySelector("#elapsed").textContent =
        hours + "h " + minutes + "m " + remainingSeconds + "s";
}

// Gets the latest earthquake data from the API.
async function getEarthquake() {
    document.querySelector("#status").textContent = "Loading earthquake data...";

    try {
        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error("Request failed");
        }

        // Converts the API response into JSON.
        const data = await response.json();

        // Checks if the API returned any earthquakes.
        if (data.features.length === 0) {
            eventTime = null;
            document.querySelector("#elapsed").textContent = "--";
            document.querySelector("#status").textContent = "No earthquakes found.";
            return;
        }

        // Reads the magnitude and location of the first earthquake.
        let magnitude = data.features[0].properties.mag;
        let location = data.features[0].properties.place;
        eventTime = data.features[0].properties.time;
        updateTime();

        // Displays the earthquake information on the page.
        document.querySelector("#magnitude").textContent = "M " + magnitude;
        document.querySelector("#location").textContent = location;
        document.querySelector("#status").textContent = "Data loaded from USGS.";

        // Changes the circle colour based on the magnitude.
        if (magnitude < 4) {
            document.querySelector("#pulse").className = "pulse low";
        } else if (magnitude < 5) {
            document.querySelector("#pulse").className = "pulse medium";
        } else {
            document.querySelector("#pulse").className = "pulse high";
        }

    } catch (error) {
        // Displays an error message when the request fails.
        console.error("Error:", error);
        document.querySelector("#status").textContent = "Unable to load earthquake data.";
    }
}

// Refreshes the data when the button is clicked.
document.querySelector("#refresh").addEventListener("click", getEarthquake);

// Loads earthquake data when the page opens.
getEarthquake();

// Updates the elapsed time every second.
setInterval(updateTime, 1000);

// Refreshes the USGS data every minute.
setInterval(getEarthquake, 60000);
