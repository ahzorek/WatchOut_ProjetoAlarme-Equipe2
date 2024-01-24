import DateTimeWidget from "../widgets/DateTimeWidget.js"
import WeatherWidget from "../widgets/WeatherWidget.js"
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

  render() {

    if (this.loading) {
      this.container.innerHTML = `
        <div class="loading-spinner"></div>
      `
    } else {
      this.container.innerHTML = ''
      this.container.appendChild(this.weatherWidget.render())
      this.container.appendChild(this.dateTimeWidget.render())
    }
    this.app.appendScreen(this.container)
  }

  loadData() {
    this.weatherWidget.refresh()
    // this.dateTimeWidget.refresh()

    setTimeout(() => {
      this.loading = false

      this.render()
    }, 500)
  }

}

export default DashboardScreen 
