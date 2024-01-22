import formatTemperature from "../utils/formatTemp.js"

class WeatherWidget {
  constructor(app, container) {
    this.app = app
    this.container = container
    this.isLoading = true
    this.error = null
    this.weatherData = null
    this.unit = null

    this.createStructure()
    this.render()
  }

  createStructure() {
    this.widgetElement = document.createElement('section')
    this.widgetElement.classList.add('weather-card')
    this.container.appendChild(this.widgetElement)

  }

  updateWeatherData(state) {
    const { weather, user } = state
    console.log('weatherWidget received:', weather)
    if (!weather | !user) {
      console.log('failed race condition at weather')
      setTimeout(() => { this.render() }, 1000)
      return
    }

    this.unit = user.unit

    const { cityName, temperature, minTemperature, maxTemperature, weatherIconURL, isLoading, error } = weather

    this.weatherData = {
      cityName,
      temperature,
      minTemperature,
      maxTemperature,
      weatherIconURL,
    }

    this.isLoading = isLoading
    this.error = error

    this.render()
  }


  render() {
    this.widgetElement.innerHTML = ''

    if (this.isLoading) {
      const spinner = document.createElement('div')
      spinner.classList.add('loading-spinner')
      this.widgetElement.appendChild(spinner)

      this.updateWeatherData(this.app.state)
    }
    else if (this.error) {
      const errorElement = document.createElement('div')
      errorElement.textContent = `Error: ${this.error}`
      this.widgetElement.appendChild(errorElement)
    }
    else if (!this.weatherData.cityName || !this.weatherData.temperature) {

      const errorElement = document.createElement('div')
      errorElement.textContent = `Error: não foi possivel carregar algumas informações`
      this.widgetElement.appendChild(errorElement)

    } else {
      const weatherInfoElement = document.createElement('div')
      weatherInfoElement.classList.add('weather-info')

      const cityNameElement = document.createElement('div')
      cityNameElement.classList.add('city-name')
      cityNameElement.textContent = this.weatherData.cityName

      const tempElement = document.createElement('div')
      tempElement.classList.add('temp')
      tempElement.textContent = formatTemperature(this.weatherData.temperature, this.unit)

      const weatherTagsElement = document.createElement('span')
      weatherTagsElement.classList.add('weather-tags')

      const minTemperatureSpan = document.createElement('span')
      minTemperatureSpan.textContent = `min `
      const minTemperatureValueSpan = document.createElement('span')
      minTemperatureValueSpan.classList.add('min-span')
      minTemperatureValueSpan.textContent = formatTemperature(this.weatherData.minTemperature, this.unit)

      minTemperatureSpan.appendChild(minTemperatureValueSpan)
      weatherTagsElement.appendChild(minTemperatureSpan)

      const maxTemperatureSpan = document.createElement('span')
      maxTemperatureSpan.textContent = `max `
      const maxTemperatureValueSpan = document.createElement('span')
      maxTemperatureValueSpan.classList.add('max-span')
      maxTemperatureValueSpan.textContent = formatTemperature(this.weatherData.maxTemperature, this.unit)

      maxTemperatureSpan.appendChild(maxTemperatureValueSpan)
      weatherTagsElement.appendChild(maxTemperatureSpan)

      weatherInfoElement.appendChild(cityNameElement)
      weatherInfoElement.appendChild(tempElement)
      weatherInfoElement.appendChild(weatherTagsElement)

      const weatherIconElement = document.createElement('img')
      weatherIconElement.alt = 'weather icon'
      weatherIconElement.classList.add('weather-icon')
      weatherIconElement.src = this.weatherData.weatherIconURL

      this.widgetElement.appendChild(weatherInfoElement)
      this.widgetElement.appendChild(weatherIconElement)
    }
  }
}

export default WeatherWidget
