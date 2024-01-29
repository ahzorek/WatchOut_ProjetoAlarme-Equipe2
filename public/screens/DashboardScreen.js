import DateTimeWidget from "../components/DateTimeWidget.js"
import WeatherWidget from "../components/WeatherWidget.js"
import Screen from './Screen.js'

class DashboardScreen extends Screen {
  constructor(app) {
    super(app)
    this.container = document.createElement('section')
    this.container.classList.add('screen', 'dashboard-screen', 'active')
    this.render()

    this.weatherWidget = new WeatherWidget(this.app)
    this.dateTimeWidget = new DateTimeWidget(this.app)
  }

  refresh() {
    if (this.weatherWidget && typeof this.weatherWidget.refresh === 'function') {
      this.weatherWidget.refresh()
      this.dateTimeWidget.refresh()
    }
  }

  render() {
    if (this.app.isLoading) {
      this.container.innerHTML = `
        <div class="loading-spinner"></div>
      `
      this.loadData()
    }
    else {
      this.container.innerHTML = ''
      this.container.appendChild(this.weatherWidget.render())
      this.container.appendChild(this.dateTimeWidget.render())
    }
    this.app.appendScreen(this.container)
  }

  loadData() {
    setTimeout(() => {
      this.render()
      this.loading = false
    }, 500)
  }

}

export default DashboardScreen 
