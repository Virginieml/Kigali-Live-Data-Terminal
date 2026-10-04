// Kigali Uplink - fetches live weather from Open-Meteo (no API key needed)
const API_URL =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=-1.95&longitude=30.06" +
  "&current=temperature_2m,wind_speed_10m,weather_code,is_day" +
  "&timezone=auto";

const button = document.getElementById("fetch-btn");
const tempDisplay = document.getElementById("temp-display");
const windDisplay = document.getElementById("wind-display");
const statusAlert = document.getElementById("status-alert");
const scene = document.getElementById("scene");
const sceneLabel = document.getElementById("scene-label");
const rainBox = document.getElementById("rain");
const updated = document.getElementById("updated");

// Turn Open-Meteo weather codes into a scene name + friendly label
function describeWeather(code, isDay) {
  if (code === 0) return isDay ? ["clear", "Sunny"] : ["night", "Clear night"];
  if (code <= 2) return isDay ? ["partly", "Partly cloudy"] : ["night", "Mostly clear night"];
  if (code === 3) return ["cloudy", "Overcast"];
  if (code === 45 || code === 48) return ["fog", "Foggy"];
  if (code >= 95) return ["storm", "Thunderstorm"];
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return ["rain", "Rain"];
  return ["cloudy", "Cloudy"];
}

// Create raindrops only when needed
function makeRain(heavy) {
  rainBox.innerHTML = "";
  const count = heavy ? 70 : 40;
  for (let i = 0; i < count; i++) {
    const drop = document.createElement("span");
    drop.className = "drop";
    drop.style.left = Math.random() * 100 + "%";
    drop.style.animationDuration = 0.6 + Math.random() * 0.6 + "s";
    drop.style.animationDelay = Math.random() * 1.2 + "s";
    rainBox.appendChild(drop);
  }
}

function setStatus(text, cls) {
  statusAlert.textContent = text;
  statusAlert.className = "value " + cls;
}

async function fetchLiveData() {
  // Show a loading state while we wait on the network
  button.disabled = true;
  button.textContent = "Connecting…";
  sceneLabel.textContent = "Contacting satellite…";

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("HTTP " + response.status);

    const data = await response.json();
    const { temperature_2m: temp, wind_speed_10m: wind, weather_code: code, is_day: isDay } = data.current;

    tempDisplay.textContent = temp + "°C";
    windDisplay.textContent = wind + " km/h";

    if (temp > 28) setStatus("Heat Advisory", "hot");
    else setStatus("Conditions Optimal", "ok");

    const [sceneName, label] = describeWeather(code, isDay);
    if (sceneName === "rain" || sceneName === "storm") makeRain(sceneName === "storm");
    scene.className = "scene " + sceneName;
    sceneLabel.textContent = label;
    updated.textContent = "Updated " + new Date().toLocaleTimeString();
  } catch (error) {
    console.error(error);
    setStatus("Network Error", "error");
    sceneLabel.textContent = "Signal lost";
  } finally {
    button.disabled = false;
    button.textContent = "Fetch Live Data";
  }
}

button.addEventListener("click", fetchLiveData);