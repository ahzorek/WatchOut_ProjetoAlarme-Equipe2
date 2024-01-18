import DateTimeWidget from "../widgets/DateTimeWidget.js"
import WeatherWidget from "../widgets/WeatherWidget.js"
import Screen from './Screen.js'

class DashboardScreen extends Screen {
  constructor(app) {
    super(app)
    this.container = document.createElement('section')
    this.container.classList.add('screen', 'dashboard-screen', 'active')

    this.render()
  }

  render() {

    if (this.loading) {
      this.container.innerHTML = `
        <div class="loading-spinner"></div>
      `
    } else {
      this.container.innerHTML = ''
      new WeatherWidget(this.app, this.container)
      new DateTimeWidget(this.app, this.container)
    }

    this.app.appendScreen(this.container)
  }

  loadData() {
    setTimeout(() => {
      this.loading = false

      this.render()
    }, 500)
  }

}

export default DashboardScreen 
