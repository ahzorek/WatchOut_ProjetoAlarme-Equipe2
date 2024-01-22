const getWeatherData = async (cityName) => {
  try {
    const res = await fetch(`/weather?city=${cityName}`)

    if (!res.ok) {
      throw new Error(`Erro ao comunicar com Api. Status: ${res.status}`)
    }

    const { results } = await res.json()
    const { city, temp, condition_slug, forecast } = results
    const [today] = forecast

    const weatherObj = {
      cityName: city,
      temperature: temp,
      minTemperature: today.min,
      maxTemperature: today.max,
      weatherIconURL: `https://assets.hgbrasil.com/weather/icons/conditions/${condition_slug}.svg`,
      isLoading: false,
      error: null
    }

    return weatherObj

  } catch (err) {
    return {
      error: err
    }
  }
}

export default getWeatherData