import printTime from "../utils/printTime.js"

class DateTimeWidget {
  constructor(app) {
    this.app = app
    this.isLoading = true
    this.mainElement = this.createStructure()

    this.greetingMessage = this.mainElement.querySelector('.greeting-message')
    this.timeElement = this.mainElement.querySelector('.time')
    this.dateElement = this.mainElement.querySelector('.date')

    this.initializeWidget()
    this.render()
  }

  refresh() {
    this.renderDate()
    this.renderMessage()
  }

  timeFormatted() {
    if (this.app.state.timeNow) {
      return printTime(
        this.app.state.timeNow,
        this.app.state.user.is12Hour,
        this.app.state.user.hideSec,
      )
    }
  }

  initializeWidget() {
    if (!this.app.state.timeNow | !this.app.state.currDate) {
      setTimeout(() => {
        this.initializeWidget()
      }, 500)
    }
    else {
      this.isLoading = false
      this.renderDate()
      this.renderMessage()
      this.runClock()
    }
  }

  runClock() {
    if (this.app.state.timeNow) {
      this.app.incrementClock(this.app.state.timeNow)
      this.app.checkForAlarms()
      this.renderClock()

      setTimeout(() => {
        //console.log('clockwork')
        this.runClock()
      }, 1000)
    }
    else {
      this.isLoading = true
      this.render()
    }
  }

  renderClock() {
    if (this.app.state.timeNow) {
      this.timeElement.innerHTML = this.timeFormatted()
    }
  }

  renderDate() {
    if (this.app.state.currDate) {
      this.dateElement.textContent = this.app.state.currDate
    }
  }

  renderMessage() {
    if (this.app.state.greetingMessage) {
      this.greetingMessage.textContent = this.app.state.greetingMessage
    }
  }

  createStructure() {
    const main = document.createElement('main')
    main.classList.add('time-date-container', 'animate')

    const greetingMessage = document.createElement('p')
    greetingMessage.classList.add('greeting-message', 'title3')

    const timeElement = document.createElement('time')
    timeElement.classList.add('time')

    const dateElement = document.createElement('p')
    dateElement.classList.add('date')

    main.appendChild(greetingMessage)
    main.appendChild(timeElement)
    main.appendChild(dateElement)

    return main
  }

  render() {
    if (this.isLoading) {
      const spinner = document.createElement('div')
      spinner.classList.add('loading-spinner')

      return spinner

    } else {
      return this.mainElement
    }
  }

}

export default DateTimeWidget