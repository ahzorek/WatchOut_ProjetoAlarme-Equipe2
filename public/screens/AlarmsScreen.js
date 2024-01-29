import Screen from './Screen.js'
import EditScreen from './EditScreen.js'

import getTheme from "../utils/getTheme.js"
import printTime from "../utils/printTime.js"
import displayDaysTags from "../utils/displayDaysTags.js"
import handleAlarmStatus from '../utils/handleAlarmStatus.js'

import autoAnimate from '../utils/autoAnimate.js'

import { closeIcon, editIcon, repeatIcon, snoozeIcon, emptyAlarmsListIcon, trashIcon } from '../icons/index.js'

class AlarmsScreen extends Screen {
  constructor(app) {
    super(app)
    this.container = document.createElement('section')
    this.container.classList.add('screen', 'alarms-screen')
    this.alarms = null
    this.user = null

    this.render()
  }

  goToEditAlarmScreen(id) {
    console.log('called')
    this.app.activateScreen(new EditScreen(this.app, id))
  }

  createStructure(alarms, user) {
    const structure = document.createElement("div")
    structure.classList.add('frame')
    structure.style.display = 'contents'

    const header = document.createElement("header")
    header.classList.add("top-nav", "side-screen")

    const title = document.createElement("h2")
    title.classList.add("title1")
    title.textContent = "Alarmes"

    const closeButton = document.createElement("button")
    closeButton.classList.add("nav-btn", "back-btn")
    closeButton.innerHTML = closeIcon

    closeButton.addEventListener('click', () => this.app.goBack())

    header.appendChild(title)
    header.appendChild(closeButton)

    if (alarms.length <= 0) {

      const emptyAlarmList = document.createElement('div')
      emptyAlarmList.classList.add('empty-list')
      emptyAlarmList.innerHTML = emptyAlarmsListIcon

      structure.appendChild(header)
      structure.appendChild(emptyAlarmList)

      return structure

    } else {

      const alarmsList = document.createElement('ul')
      alarmsList.classList.add('alarms-list')
      autoAnimate(alarmsList)

      alarms.forEach(async ({ id, alarmTime, description, isActive, days, isRepeating }) => {
        const alarmCard = document.createElement('li')
        const [h, m, s] = alarmTime.split(':')
        const theme = await getTheme(alarmTime)

        alarmCard.classList.add('settings-card')
        alarmCard.classList.add(theme)

        alarmCard.setAttribute('title', description)
        alarmCard.setAttribute('data-attribute-id', id)

        const section_1 = document.createElement('section')

        const alarmTimeSpan = document.createElement('span')
        alarmTimeSpan.classList.add('alarm-time')
        const dateEl = document.createElement('date')
        dateEl.innerHTML = printTime({ h, m, s }, user.is12Hour)

        alarmTimeSpan.appendChild(dateEl)

        const alarmIcons = document.createElement('span')
        alarmIcons.classList.add('alarm-icons')
        if (isRepeating) alarmIcons.innerHTML = repeatIcon

        const alarmToggle = document.createElement('span')
        alarmToggle.classList.add('alarm-toggle')

        const alarmToggleInput = document.createElement('input')
        alarmToggleInput.classList.add('switch')
        alarmToggleInput.setAttribute('type', 'checkbox')
        alarmToggleInput.setAttribute('id', id)
        if (isActive) alarmToggleInput.setAttribute('checked', 'true')
        alarmToggleInput.addEventListener('change', () => this.toggleAlarm(id))

        alarmToggle.appendChild(alarmToggleInput)

        section_1.appendChild(alarmTimeSpan)
        section_1.appendChild(alarmIcons)
        section_1.appendChild(alarmToggle)

        const section_2 = document.createElement('section')
        const h3Title = document.createElement('h3')
        h3Title.classList.add('alarm-title')
        h3Title.setAttribute('title', description)
        h3Title.textContent = description

        section_2.appendChild(h3Title)

        const section_3 = document.createElement('section')
        const alarmDays = document.createElement('span')
        alarmDays.classList.add('alarm-days')
        alarmDays.innerHTML = displayDaysTags(days)

        const alarmEditBtn = document.createElement('span')
        alarmEditBtn.classList.add('alarm-edit-btn')
        alarmEditBtn.setAttribute('title', `Editar alarme: ${description}`)
        alarmEditBtn.innerHTML = editIcon
        alarmEditBtn.addEventListener('click', () => this.goToEditAlarmScreen(id))

        // const alarmDelBtn = document.createElement('span')
        // alarmDelBtn.classList.add('alarm-edit-btn', 'del-btn')
        // alarmDelBtn.setAttribute('title', `Apagar alarme: ${description}`)
        // alarmDelBtn.innerHTML = trashIcon
        // alarmDelBtn.addEventListener('click', () => {
        //   alarmCard.remove() //provisorio
        // })



        section_3.appendChild(alarmDays)
        //section_3.appendChild(alarmDelBtn)
        section_3.appendChild(alarmEditBtn)

        alarmCard.appendChild(section_1)
        alarmCard.appendChild(section_2)
        alarmCard.appendChild(section_3)

        alarmCard.addEventListener('mousedown', (e) => {
          if (e.target.type !== 'checkbox') {
            const longpress = setTimeout(() => {
              this.goToEditAlarmScreen(id)
            }, 800)
            alarmCard.addEventListener('mouseup', () => {
              clearTimeout(longpress)
            })
          }
        })

        alarmCard.addEventListener('touchstart', (e) => {
          if (e.target.type !== 'checkbox') {
            navigator.vibrate([0, 100, 200, 300, 600]) //adiciona resposta haptica
            const longpress = setTimeout(() => {
              this.goToEditAlarmScreen(id)
            }, 900)
            alarmCard.addEventListener('touchend', () => {
              navigator.vibrate([0]) //cancela a resposta haptica anterior
              clearTimeout(longpress)
            })
          }
        })


        alarmsList.appendChild(alarmCard)
      })

      structure.appendChild(header)
      structure.appendChild(alarmsList)

      return structure
    }

  }

  goToEditAlarmScreen(id) {
    this.app.activateScreen(new EditScreen(this.app, id))
  }

  async toggleAlarm(id) {
    try {
      const res = await fetch(`/alarm/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!res.ok) {
        throw new Error(`${res.status}`)
      }
      const { message, alarm } = await res.json()

      console.log(message)

      this.app.updateLocalAlarmData(id, alarm)

    } catch (err) {
      console.error('Error:', err)
    }
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

  async loadData() {
    this.alarms = this.app.state.alarms
    this.user = this.app.state.user
    this.loading = false
    this.render()
  }

}

export default AlarmsScreen