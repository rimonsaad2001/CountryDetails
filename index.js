const countryGrid = document.getElementById("countryGrid");
const modal = document.getElementById("countryModal");
const modalCountryName = document.getElementById("modalCountryName");
const modalCountryDetails = document.getElementById("modalCountryDetails");
const modalWeatherDetails = document.getElementById("modalWeatherDetails");

async function fetchCountryData() {
  const countryInputField = document.getElementById("countryInput");
  const countryInput = countryInputField.value.trim();
  if (!countryInput) {
    alert("Please enter a country name.");
    return;
  }

  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${countryInput}`);
    const countries = await response.json();

    // Clear previous results
    countryGrid.innerHTML = "";
    window.scrollTo({ top: 0, behavior: "smooth" });

    countries.forEach(country => {
      // Show details for the first country
      showCountryDetails(country);
    });

    // Clear input after search
    countryInputField.value = ""; 
  } catch (error) {
    alert("Error fetching country data. Please check your input.");
    console.error(error);
  }
}

async function showCountryDetails(country) {
  modal.style.display = "flex";
  modalCountryName.textContent = country.name.common;

  const now = new Date();
  const formattedDateTime = now.toLocaleString();

  const currencies = country.currencies 
    ? Object.values(country.currencies).map(cur => `${cur.name} (${cur.symbol})`).join(", ") 
    : "N/A";

  const languages = country.languages 
    ? Object.values(country.languages).join(", ") 
    : "N/A";

  const lat = country.latlng[0];
  const lon = country.latlng[1];

  // Set country details in modal
  modalCountryDetails.innerHTML = `
    <h4>Location Map</h4>
    <iframe
      src="https://maps.google.com/maps?q=${lat},${lon}&z=5&output=embed"
      width="100%"
      height="250"
      style="border:0; margin-bottom:15px;"
      allowfullscreen
      loading="lazy"
    ></iframe>

    <img src="${country.flags.svg}" width="100">
    <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : "N/A"}</p>
    <p><strong>Region:</strong> ${country.region}</p>
    <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
    <p><strong>Currency:</strong> ${currencies}</p>
    <p><strong>Languages:</strong> ${languages}</p>
    <p><strong>Current Date & Time:</strong> ${formattedDateTime}</p>
  `;

  try {
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m`);
    const weatherData = await weatherRes.json();

    const weather = weatherData.current_weather;
    const futureTemps = weatherData.hourly.temperature_2m.slice(0, 5);
    const futureHumidity = weatherData.hourly.relative_humidity_2m.slice(0, 5);
    const futureTimes = weatherData.hourly.time.slice(0, 5);

    modalWeatherDetails.innerHTML = `
      <h4>Current Weather</h4>
      <p><strong>Temperature:</strong> ${weather.temperature}°C</p>
      <p><strong>Wind Speed:</strong> ${weather.windspeed} km/h</p>
      <p><strong>Humidity:</strong> ${futureHumidity[0]}%</p>

      <h4>Future Predictions</h4>
      ${futureTimes.map((time, index) => `
        <p><strong>${new Date(time).toLocaleString()}</strong> - Temp: ${futureTemps[index]}°C, Humidity: ${futureHumidity[index]}%</p>
      `).join('')}
    `;
  } catch (error) {
    modalWeatherDetails.innerHTML = "<p>Weather data unavailable.</p>";
    console.error(error);
  }
}

function closeModal() {
  modal.style.display = "none";
  modalCountryName.textContent = "";
  modalCountryDetails.innerHTML = "";
  modalWeatherDetails.innerHTML = "";
}
