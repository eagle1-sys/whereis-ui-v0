/**
 * This script fetches shipment tracking data from the Eagle1 API and displays it on a webpage.
 *
 * Flow:
 * 1. Gets tracking number from URL parameter
 * 2. Makes API request to Eagle1 whereis endpoint
 * 3. Processes response and renders tracking timeline
 *
 * The timeline includes:
 * - Current shipment status
 * - Tracking number
 * - Origin and destination (if available)
 * - Exception alerts (if any)
 * - Chronological event history with:
 *   - Date/time
 *   - Location
 *   - Status
 *   - Notes
 */

// Get DOM elements first
const mainContent = document.getElementById("main-content");
const loadingElement = document.getElementById("loading");

// Helper functions
function displayError(message) {
  loadingElement.style.display = "none";
  mainContent.style.display = "block";
  mainContent.innerHTML = `
    <div class="mb-12 space-y-6">
      <p class="text-red-600">${message}</p>
    </div>
  `;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Get tracking number from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const rawTrackingId = urlParams.get("trackingid");

// Redirect if prefix contains uppercase
if (rawTrackingId && rawTrackingId.includes("-")) {
  const [prefix, ...rest] = rawTrackingId.split("-");
  if (prefix.toLowerCase() !== prefix) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set(
      "trackingid",
      prefix.toLowerCase() + "-" + rest.join("-"),
    );
    window.location.href = newUrl.toString();
    throw new Error("Redirecting to lowercase prefix");
  }
}

const trackingNumber = rawTrackingId;

// Update page title if tracking number exists
if (trackingNumber) {
  document.title = `→ ${trackingNumber.split("?")[0]}`;
}

if (!trackingNumber) {
  displayError(
    "No tracking number provided. Please add ?trackingid=xxx to the URL.",
  );
  throw new Error("No tracking number provided");
}

// Fetch with retry logic
async function fetchWithRetry(url, options, retries = 5) {
  try {
    const response = await fetch(url, options);
    if (response.ok) return response;

    // Only retry on 500-series errors
    if (response.status >= 500 && retries > 0) {
      await delay(100);
      return fetchWithRetry(url, options, retries - 1);
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  } catch (error) {
    throw error;
  }
}

// Show loading state
loadingElement.style.display = "block";
mainContent.style.display = "none";

// Call Eagle1 whereis API with retry logic
fetchWithRetry(`https://api.eg1.io/v0/whereis/${trackingNumber}`, {
  method: "GET",
  headers: {
    Accept: "application/json",
    Authorization: "Bearer eagle1",
  },
})
  .then((response) => response.json())
  .then((data) => {
    if (!data) {
      throw new Error("No data returned from API");
    }
    loadingElement.style.display = "none";
    mainContent.style.display = "block";
    renderTrackingData(data);
  })
  .catch((error) => {
    console.error("Error loading JSON data:", error);
    displayError("Error loading tracking data: " + error.message);
  });

// Function to render tracking data
function renderTrackingData(data) {
  // Get the latest event and status
  const latestEvent = data.events[data.events.length - 1];
  const latestStatus = latestEvent.what;
  document.getElementById("status").textContent = latestStatus;

  // Display header info
  document.getElementById("tracking-num").textContent = data.entity.id;

  // Only show origin if it exists
  const originElement = document.getElementById("origin-container");
  if (data.entity.additional?.origin) {
    originElement.style.display = "block";
    document.getElementById("origin").textContent =
      data.entity.additional.origin;
  } else {
    originElement.style.display = "none";
  }

  // Only show destination if it exists
  const destinationElement = document.getElementById("destination-container");
  if (data.entity.additional?.destination) {
    destinationElement.style.display = "block";
    document.getElementById("destination").textContent =
      data.entity.additional.destination;
  } else {
    destinationElement.style.display = "none";
  }

  // Check if last event has an exception
  if (latestEvent.additional?.exceptionCode) {
    const exceptionBlock = document.createElement("div");
    exceptionBlock.className = "mb-12 p-4 bg-red-50 text-sm";
    exceptionBlock.innerHTML = `
            <div class="text-red-600 uppercase mb-2">${latestEvent.additional.exceptionDesc}</div>
            <div class="text-red-600">${latestEvent.notes}</div>
        `;

    // Insert exception block after the header section and before the timeline
    const timelineElement = document.getElementById("timeline");
    timelineElement.parentNode.insertBefore(exceptionBlock, timelineElement);
  }

  // Display events in reverse chronological order
  const timeline = document.getElementById("timeline");
  data.events.forEach((event, index) => {
    const eventDiv = document.createElement("div");
    eventDiv.className = "relative pl-8 pb-12";

    const date = new Intl.DateTimeFormat(undefined, {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(event.when));

    const notes = event.notes
      ? `<div class="text-sm ${event.additional?.exceptionCode ? "text-red-600" : "text-black"} mt-1 text-xs italic">${event.notes}</div>`
      : "";

    eventDiv.innerHTML += `
            <div class="relative">
                  <div class="absolute -left-8 -ml-[4px] top-1/2 w-[7px] h-[7px] -translate-y-1/2 rounded-full bg-black"></div>
                  <div class="text-xs text-black/60">${date}</div>
            </div>
            <div class="mt-1 text-xs text-black/60">${event.where}</div>
            <div class="mt-4 text-base">${event.what}</div>
            ${notes}
        `;

    timeline.appendChild(eventDiv);
  });
}
