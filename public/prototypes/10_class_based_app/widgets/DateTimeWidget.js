import printTime from "../utils/printTime.js"

class DateTimeWidget {
  constructor(app, container) {
    this.app = app
    this.container = container
    this.mainElement = this.createStructure()

    // Retrieve references to individual elements
    this.greetingMessage = this.mainElement.querySelector('.greeting-message')
    this.timeElement = this.mainElement.querySelector('.time')
    this.dateElement = this.mainElement.querySelector('.date')

    // Append the main element to the container
    this.container.appendChild(this.mainElement)

    this.renderClock()
  }

  timeFormatted() {
    return printTime(
      this.app.state.timeNow,
      this.app.state.user.is12Hour,
      this.app.state.user.hideSec,
    )
  }

  renderClock() {
    setInterval(() => {
      //roda todo segundo
      this.timeElement.innerHTML = this.timeFormatted()

      this.render()
      // console.log(this.timeStringUpdated())
    }, 1000)
  }

  createStructure() {
    const main = document.createElement('main')
    main.classList.add('time-date-container', 'animate')

    const greetingMessage = document.createElement('p')
    greetingMessage.classList.add('greeting-message', 'title3')

    const timeElement = document.createElement('time')
    timeElement.classList.add('time')
    timeElement.innerHTML = this.timeFormatted()

    const dateElement = document.createElement('p')
    dateElement.classList.add('date')
    dateElement.textContent = this.app.state.currDate

    main.appendChild(greetingMessage)
    main.appendChild(timeElement)
    main.appendChild(dateElement)

    return main
  }

  render() {
    if (this.app.isLoading) {
      return `<div class="loading-spinner"></div>`
    } else {
      // Update individual elements
      // this.updateGreetingMessage()
      // this.updateTime()
      // this.updateDate()

      return this.mainElement
    }
  }

}

export default DateTimeWidget