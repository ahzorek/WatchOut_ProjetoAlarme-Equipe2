import 'dotenv/config'

class WeatherRepository {
  findByCity(city_name) {
    return getWeatherByCityName(city_name)
  }
}

export default new WeatherRepository()

async function getWeatherByCityName(city_name) {
  const res = await fetch(`https://api.hgbrasil.com/weather?key=${process.env.HG_API_KEY}&city_name=${city_name}`)
  const data = await res.json()
  return data
}