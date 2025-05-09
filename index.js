const countryGrid = document.getElementById("countryGrid");
const modal = document.getElementById("countryModal");
const modalCountryName = document.getElementById("modalCountryName");
const modalCountryDetails = document.getElementById("modalCountryDetails");
const modalWeatherDetails = document.getElementById("modalWeatherDetails");

async function fetchCountryData() {
  const countryInput = document.getElementById("countryInput").value;
  if (!countryInput) {
    alert("Please enter a country name.");
    return;
  }

  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${countryInput}`);
    const countries = await response.json();
    countryGrid.innerHTML = "";

    countries.forEach(country => {
      const card = document.createElement("div");
      card.className = "country-card";

      card.innerHTML = `
        <img src="${country.flags.svg}" alt="${country.name.common} flag">
        <h3>${country.name.common}</h3>
        <button class="details-btn">More Details</button>
      `;

      const button = card.querySelector(".details-btn");
      button.addEventListener("click", () => {
        showMoreDetails(country, country.latlng[0], country.latlng[1]);
      });

      countryGrid.appendChild(card);
    });
  } catch (error) {
    alert("Error fetching country data. Please check your input.");
    console.error(error);
  }
}

async function showMoreDetails(country, lat, lon) {
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

  modalCountryDetails.innerHTML = `
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
