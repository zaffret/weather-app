import "./App.css";
import { useState } from "react";

const API_key = process.env.REACT_APP_API_KEY;
const API_key2 = process.env.REACT_APP_API_KEY2;

function App() {
  const [temp, setTemp] = useState(null);
  const [city, setCity] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [name, setName] = useState(null);
  const [time, setTime] = useState(null);
  const [current, setCurrent] = useState(null);
  const [sunrise, setSunrise] = useState(null);
  const [sunset, setSunset] = useState(null);
  const [noInput, setNoInput] = useState(false);

  function getCurrentTimeInZone(timeZoneName) {
    const now = new Date();
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timeZoneName,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(now);
  }

  return (
    <div className="container">
      <form
        className="search-bar"
        onSubmit={async (e) => {
          e.preventDefault();
          if (city === null || city.trim() === "") {
            setError(null);
            setNoInput(true);
            return;
          }

          try {
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`
            );
            if (!response.ok) {
              throw new Error("City not found");
            }
            const data = await response.json();
            setTemp(data.main.temp.toFixed(2));
            setWeather(data.weather[0]);
            setName(data.name);
            setCurrent(data.dt);
            setSunrise(data.sys.sunrise);
            setSunset(data.sys.sunset);

            try {
              const timeZone = await fetch(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${data.coord.lat}&lon=${data.coord.lon}&format=json&apiKey=${API_key2}`
              );
              if (!timeZone.ok) {
                throw new Error("Timezone data not found");
              }
              const timeZoneData = await timeZone.json();
              console.log(timeZoneData);

              setTime(
                getCurrentTimeInZone(timeZoneData.results[0].timezone.name)
              );
            } catch (err) {
              setError(err.message);
            }

            setError(null);
          } catch (err) {
            setNoInput(false);
            setError(err.message);
            setTemp(null);
            setWeather(null);
          } finally {
            setLoading(false);
          }
        }}
      >
        <input
          type="text"
          placeholder="Enter city"
          value={city || ""}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>
      <div className="weather-box">
        {((loading && !temp && !error) || noInput) && (
          <div className="loading-placeholder">
            <img
              src="/images/4066.jpg"
              alt="Search illustration"
              className="placeholder-img"
            />
          </div>
        )}
        {error && (
          <div className="error-card">
            <img
              src="/images/vecteezy_no-weather-icon-sign-vector_35281372.jpg"
              alt="Error illustration"
              className="error-img"
            />

            <p>{error}</p>
          </div>
        )}
        {temp && (
          <div className="weather-info">
            <div
              className="weather-hero"
              style={{
                backgroundImage: `url(${
                  current &&
                  sunrise &&
                  sunset &&
                  current >= sunrise &&
                  current < sunset
                    ? "/images/2-fcb4ad10.png"
                    : "/images/1-fcb4ad10.png"
                })`,
              }}
            >
              <div className="weather-top-text">
                <h2>{name}</h2>
                <p>{temp} °C</p>
              </div>
            </div>

            <div className="weather-middle">
              <div className="weather-icon-circle">
                <img
                  className="weather-icon"
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.description}
                />
              </div>
            </div>

            <div className="weather-bottom">
              <p className="description">{weather.description}</p>
              <p className="time">{time}</p>
            </div>
          </div>
        )}

        <footer>
          <p>Weather data provided by OpenWeatherMap</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
