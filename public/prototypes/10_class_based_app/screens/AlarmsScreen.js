import Screen from './Screen.js'
import getTheme from "../utils/getTheme.js"
import printTime from "../utils/printTime.js"
import displayDaysTags from "../utils/displayDaysTags.js"

class AlarmsScreen extends Screen {
  constructor(app) {
    super(app)
    this.container = document.createElement('section')
    this.container.classList.add('screen', 'alarms-screen')
    this.alarms = null
    this.user = null

    this.render()
  }

  createStructure(alarms, user) {
    const frame = document.createElement("div")
    frame.classList.add('frame')

    const header = document.createElement("header")
    header.classList.add("top-nav", "side-screen")

    const title = document.createElement("h2")
    title.classList.add("title1")
    title.textContent = "Alarms"

    const closeButton = document.createElement("button")
    closeButton.classList.add("close-screen")

    closeButton.innerHTML = closeIcon

    closeButton.addEventListener('click', () => this.app.goBack())

    header.appendChild(title)
    header.appendChild(closeButton)

    const alarmsList = document.createElement('ul')
    alarmsList.classList.add('alarms-list')

    alarms.forEach(async ({ id, alarmTime, description, isActive, days, isRepeating, isSnoozeEnabled }) => {
      const alarmCard = document.createElement('li')
      const [h, m, s] = alarmTime.split(':')
      const theme = await getTheme(alarmTime)

      alarmCard.classList.add('settings-card')
      alarmCard.classList.add(theme)

      alarmCard.setAttribute('title', description)
      alarmCard.setAttribute('data-attribute-id', id)

      alarmCard.innerHTML = `
      <section>
        <span class="alarm-time">
          <date>${printTime({ h, m, s }, user.is12Hour)}
          </date>
        </span>
        <span class="alarm-icons">
          ${isSnoozeEnabled ? snoozeIcon : ''}
          ${isRepeating ? repeatIcon : ''}
        </span>
        <span class="alarm-toggle">
          <input id="${id}" onChange="handleAlarmStatus(this)" type="checkbox" ${isActive ? 'checked' : ''} class="switch">
        </span>
      </section>

      <section>
        <h3 class="alarm-title" title="${description}">
          ${description}
        </h3>
      </section>

      <section>
        <span class="alarm-days">
          ${displayDaysTags(days)}
        </span>
        <span class="alarm-edit-btn" title="Edit alarm">
          ${editIcon}
        </span>
      </section>
    `
      alarmsList.appendChild(alarmCard)
    })


    frame.appendChild(header)
    frame.appendChild(alarmsList)

    return frame
  }

  render() {
    if (this.loading) {
      this.container.innerHTML = `
        <div class="loading-spinner"></div>
      `
    } else {
      this.container.innerHTML = ''
      this.container.appendChild(this.createStructure(
        this.alarms,
        this.user
      ))
    }
    this.app.appendScreen(this.container)
  }

  loadData() {
    this.alarms = this.app.state.alarms
    this.user = this.app.state.user

    setTimeout(() => {
      this.loading = false
      this.render()

    }, 500)
  }

}

export default AlarmsScreen

const snoozeIcon = `
  <svg fill="#000000" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M 10.4922 26.8750 L 25.3984 26.8750 C 26.5234 26.8750 27.1563 26.2656 27.1563 25.2344 C 27.1563 24.2032 26.5234 23.6172 25.3984 23.6172 L 12.8828 23.6172 L 12.8828 23.5234 L 26.0078 7.7032 C 26.7578 6.8125 26.9453 6.2734 26.9453 5.5703 C 26.9453 4.2813 26.0547 3.4844 24.5078 3.4844 L 9.9297 3.4844 C 8.8047 3.4844 8.1719 4.0703 8.1719 5.1016 C 8.1719 6.1563 8.8047 6.7422 9.9297 6.7422 L 22.4219 6.7422 L 22.4219 6.8359 L 8.9922 23.0547 C 8.4531 23.6875 8.3125 24.1563 8.3125 24.8359 C 8.3125 26.0547 9.1797 26.8750 10.4922 26.8750 Z M 34.3047 39.4844 L 46.1172 39.4844 C 47.2188 39.4844 47.8281 38.9219 47.8281 37.8906 C 47.8281 36.9297 47.2188 36.3437 46.1172 36.3437 L 36.5078 36.3437 L 36.5078 36.25 L 46.5390 24.1563 C 47.3359 23.1953 47.5937 22.6563 47.5937 22 C 47.5937 20.7344 46.75 19.9610 45.25 19.9610 L 33.7422 19.9610 C 32.6641 19.9610 32.0312 20.5469 32.0312 21.5313 C 32.0312 22.5391 32.6641 23.1016 33.7422 23.1016 L 43.3281 23.1016 L 43.3281 23.1953 L 33.0156 35.6641 C 32.4063 36.3906 32.1953 36.8594 32.1953 37.5391 C 32.1953 38.6875 33.0156 39.4844 34.3047 39.4844 Z M 17.3828 52.5156 L 26.8516 52.5156 C 27.8594 52.5156 28.4453 51.9532 28.4453 51.0391 C 28.4453 50.1016 27.8594 49.5859 26.8516 49.5859 L 19.4453 49.5859 L 19.4453 49.4922 L 27.2266 40.0234 C 27.9766 39.1094 28.2109 38.5469 28.2109 37.8672 C 28.2109 36.7422 27.4375 36.1094 26.1719 36.1094 L 16.7969 36.1094 C 15.7890 36.1094 15.2266 36.6484 15.2266 37.5625 C 15.2266 38.5 15.7890 39.0391 16.7969 39.0391 L 24.3203 39.0391 L 24.3203 39.1094 L 16.1641 48.9531 C 15.6016 49.6563 15.4141 50.0547 15.4141 50.7110 C 15.4141 51.7656 16.1875 52.5156 17.3828 52.5156 Z">
      </path>
    </g>
  </svg>
`

const repeatIcon = `
  <svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000">
  <g id="SVGRepo_iconCarrier">
    <title>Repeat-Play</title>
    <g id="Page-1" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="Repeat-Play">
        <path d="M5,18.0002 L17,18.0002 C18.6569,18.0002 20,16.657 20,15.0002 L20,14" id="Path"
          stroke-width="2" stroke-linecap="round"> </path>
        <path d="M16,2 L19.2929,5.29289 C19.6834,5.68342 19.6834,6.31658 19.2929,6.70711 L16,10" id="Path"
          stroke-width="2" stroke-linecap="round"> </path>
        <path d="M8,14 L4.70711,17.2929 C4.31658,17.6834 4.31658,18.3166 4.70711,18.7071 L8,22" id="Path"
          stroke-width="2" stroke-linecap="round"> </path>
        <path d="M19,6 L7,6 C5.34315,6 4,7.34315 4,9 L4,10" id="Path" stroke-width="2" stroke-linecap="round">
        </path>
      </g>
    </g>
  </g>
  </svg>
`

const closeIcon = `
  <svg viewBox="-0.5 0 25 25" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21.32L21 3.32001" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M3 3.32001L21 21.32" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>
`

const editIcon = `
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path
        d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z"
        stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
      <path
        d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13"
        stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </g>
  </svg>
`