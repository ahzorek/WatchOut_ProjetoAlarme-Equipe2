import Screen from './Screen.js'

import rigntonesList from '../data/ringtones.db.js'
import { closeIcon, saveIcon } from '../icons/index.js'

import createSegmentedPicker from '../utils/createSegmentedPicker.js'
import { convertTimeFrom12Hour } from '../utils/convertTime.js'

import formatTimeToString from '../utils/formatTimeToString.js'


const emptyCreatingObject = {
  days: {
    dom: false,
    seg: false,
    ter: false,
    qua: false,
    qui: false,
    sex: false,
    sab: false
  }
}

class CreateScreen extends Screen {
  constructor(app) {
    super(app)
    this.container = document.createElement('section')
    this.container.classList.add('screen', 'create-screen')
    this.creating = emptyCreatingObject
    this.daysField = null
    this.descrField = null
    this.topSaveButton = null
    this.hasEdited = false
    this.alarmTime = {
      h: null,
      m: null,
      s: 0,
      isPM: null
    }

    this.render()
  }

  createStructure(alarm) {
    const structure = document.createElement("div")
    structure.classList.add('frame')

    const header = document.createElement("header")
    header.classList.add("top-nav", "side-screen")

    const title = document.createElement("h2")
    title.classList.add("title1")
    title.textContent = "Criar"

    const closeButton = document.createElement("button")
    closeButton.classList.add("nav-btn", "back-btn")
    closeButton.innerHTML = closeIcon

    closeButton.addEventListener('click', () => {
      this.creating = emptyCreatingObject
      this.app.goBack()
    })

    const saveButton = document.createElement("button")
    saveButton.classList.add("nav-btn", "save-btn")
    saveButton.innerHTML = saveIcon

    saveButton.addEventListener('click', async () => {
      await this.processSaveNewData()
    })

    this.topSaveButton = saveButton

    header.appendChild(title)
    header.appendChild(saveButton)
    header.appendChild(closeButton)

    //fim header

    const form = document.createElement("form")
    form.classList.add("settings-form")

    const settingsItems = this.createFields(alarm)
    settingsItems.classList.add("settings-items")

    form.appendChild(settingsItems)

    structure.appendChild(header)
    structure.appendChild(form)

    return structure
  }

  setVisibilityToSaveButton() {
    this.hasEdited = true
    this.topSaveButton.classList.add('active')
  }

  handleInputChanges(e) {
    if (!this.hasEdited) this.setVisibilityToSaveButton()

    let value, key = e.target.name
    const isBool = e.target.getAttribute('data-isBool')

    if (e.target.type === 'checkbox') {
      value = e.target.checked
      this.creating = {
        ...this.creating,
        days: {
          ...this.creating.days,
          [key]: value
        }
      }
    }
    else if (e.target.type === 'text') {
      value = e.target.value.trim()
      this.creating = { ...this.creating, [key]: value }
    }
    else {
      value = (isBool == 'true') ? e.target.value == 'true' : e.target.value
      this.creating = { ...this.creating, [key]: value }
    }
    console.log(this.creating)
  }

  createAlarmTimeObject({ h, m, isPM }, is12Hour) {
    if (!this.hasEdited) this.setVisibilityToSaveButton()
    const hour = is12Hour ? convertTimeFrom12Hour(h, isPM) : h
    this.creating.alarmTime = formatTimeToString(hour, m)
  }

  submitChanges(data) {
    console.log('sending:', data)
  }

  createFields() {
    const elements = []
    const container = document.createElement('div')

    const horarioContainer = document.createElement('div')

    const horarioTitle = document.createElement('h3')
    horarioTitle.classList.add('title3')
    horarioTitle.textContent = 'Hora'
    horarioContainer.appendChild(horarioTitle)

    const hourSelectorContainer = document.createElement('div')
    hourSelectorContainer.classList.add('hour-selector')

    const hourElement = document.createElement('div')
    hourElement.classList.add('hour')
    hourElement.id = 'hour'
    hourSelectorContainer.appendChild(hourElement)

    const minuteElement = document.createElement('div')
    minuteElement.classList.add('minute')
    minuteElement.id = 'minute'
    hourSelectorContainer.appendChild(minuteElement)

    if (this.app.state.user.is12Hour) {
      const suffixElement = document.createElement('div')
      suffixElement.classList.add('suffix')
      suffixElement.id = 'suffix'
      hourSelectorContainer.appendChild(suffixElement)
    }

    horarioContainer.appendChild(hourSelectorContainer)
    elements.push(horarioContainer)

    //description
    const descriptContainer = document.createElement('div')
    const descriptTitle = document.createElement('h3')
    descriptTitle.classList.add('title3')
    descriptTitle.textContent = 'Descrição'

    descriptContainer.appendChild(descriptTitle)

    const descriptInput = document.createElement('input')
    descriptInput.id = 'description'
    descriptInput.type = 'text'
    descriptInput.placeholder = 'Descreva seu alarme'
    descriptInput.name = 'description'
    this.descrField = descriptInput

    descriptContainer.appendChild(descriptInput)

    elements.push(descriptContainer)

    //active
    const isActiveContainer = document.createElement('div')
    const isActiveTitle = document.createElement('h3')
    isActiveTitle.classList.add('title3')
    isActiveTitle.textContent = 'Ativar'

    isActiveContainer.appendChild(isActiveTitle)

    const isActivesOptions = [
      { optionName: 'Sim', optionValue: true },
      { optionName: 'Não', optionValue: false },
    ]
    const isActivePicker = createSegmentedPicker(
      isActivesOptions, 'isActive', true, true
    )

    isActiveContainer.appendChild(isActivePicker)
    elements.push(isActiveContainer)

    //days picker
    const daysPickerContainer = document.createElement('div')

    const h3Element = document.createElement('h3')
    h3Element.className = 'title3'
    h3Element.textContent = 'Dias'

    const fieldsetElement = document.createElement('fieldset')
    fieldsetElement.className = 'checkbox-group'
    this.daysField = fieldsetElement

    const daysOptions = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

    daysOptions.forEach(day => {
      const daySlug = day.toLowerCase()
      const checkboxDiv = document.createElement('div')
      checkboxDiv.className = 'checkbox'

      const labelElement = document.createElement('label')
      labelElement.className = 'checkbox-wrapper'

      const checkboxInput = document.createElement('input')
      checkboxInput.type = 'checkbox'
      checkboxInput.className = 'checkbox-input'
      checkboxInput.name = daySlug
      checkboxInput.checked = false

      const checkboxTile = document.createElement('span')
      checkboxTile.className = 'checkbox-tile'

      const checkboxLabel = document.createElement('span')
      checkboxLabel.className = 'checkbox-label'
      checkboxLabel.textContent = day

      checkboxTile.appendChild(checkboxLabel)
      labelElement.appendChild(checkboxInput)
      labelElement.appendChild(checkboxTile)
      checkboxDiv.appendChild(labelElement)
      fieldsetElement.appendChild(checkboxDiv)
    })

    daysPickerContainer.appendChild(h3Element)
    daysPickerContainer.appendChild(fieldsetElement)

    elements.push(daysPickerContainer)

    //repeats
    const isRepeatingContainer = document.createElement('div')
    const isRepeatingTitle = document.createElement('h3')
    isRepeatingTitle.classList.add('title3')
    isRepeatingTitle.textContent = 'Repetir'

    isRepeatingContainer.appendChild(isRepeatingTitle)

    const isRepeatingsOptions = [
      { optionName: 'Sim', optionValue: true },
      { optionName: 'Não', optionValue: false },
    ]
    const isRepeatingPicker = createSegmentedPicker(
      isRepeatingsOptions, 'isRepeating', false, true
    )

    isRepeatingContainer.appendChild(isRepeatingPicker)
    elements.push(isRepeatingContainer)

    //ringtone
    const ringtoneContainer = document.createElement('div')
    const ringtoneTitle = document.createElement('h3')
    ringtoneTitle.classList.add('title3')
    ringtoneTitle.textContent = 'Toque'

    ringtoneContainer.appendChild(ringtoneTitle)

    const ringtoneSelect = document.createElement('select')
    ringtoneSelect.id = 'ringtone'
    ringtoneSelect.name = 'ringtone'

    const defaultOption = document.createElement('option')
    defaultOption.selected = true | false
    defaultOption.disabled = true
    defaultOption.value = 'null'
    defaultOption.textContent = 'Selecione'

    ringtoneSelect.appendChild(defaultOption)

    rigntonesList.forEach(({ slug, title }) => {
      const option = document.createElement('option')
      option.value = slug
      option.textContent = title
      option.selected = (slug === this.app.state.user.defaultRingtone)

      ringtoneSelect.appendChild(option)
    })

    ringtoneContainer.appendChild(ringtoneSelect)
    elements.push(ringtoneContainer)

    // const submitBtn = document.createElement('button')
    // submitBtn.type = 'button'
    // submitBtn.textContent = 'Send'
    // submitBtn.addEventListener('click', async () => {
    //   await this.processSaveNewData()
    // })

    // elements.push(submitBtn)

    elements.forEach(el => {
      const input = el.querySelector('input')
      if (input?.type === 'text') {
        input.addEventListener('keyup', (e) => this.handleInputChanges(e))
      } else
        el.addEventListener('change', (e) => this.handleInputChanges(e))
    })

    elements.forEach(el => container.appendChild(el))

    return container

  }

  async processSaveNewData() {
    if (this.verifyDataConsistency(this.creating, 'create')) {
      await this.createNewAlarm(
        this.app.userId,
        this.creating
      )

      setTimeout(() => { this.app.goBack() }, 400)

    }
    else console.log('inconsistency detected, no data was sent')
  }

  async createNewAlarm(userId, newAlarm) {
    try {
      const res = await fetch(`/alarm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAlarm),
      })

      if (!res.ok) throw new Error(`${res.status}`)

      const { alarmId, message, data } = await res.json()
      console.log('createNewAlarm receives HTTP RES', message)

      const updatedUserData = await this.addNewAlarmToUserData(userId, alarmId)

      if (updatedUserData) {

        console.log('createNewAlarm receives from addNewAlarmToUserData:: ', updatedUserData)

        this.app.state.alarms.push(data)
        this.app.updateUserState(updatedUserData)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  async addNewAlarmToUserData(userId, alarmId) {
    try {
      const res = await fetch(`/user/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alarmId: alarmId }),
      })

      if (!res.ok) {
        throw new Error(`${res.status}`)
      }

      const { message, user } = await res.json()

      console.log('addNewAlarmToUserData receives HTTP Res', message)

      return user

    } catch (err) {
      console.error(err)
    }
  }

  render() {

    if (this.loading) {
      this.container.innerHTML = `
      <div class="loading-spinner"></div>
      `
    } else {
      this.container.innerHTML = ``
      this.container.appendChild(
        this.createStructure(this.alarm)
      )

      this.createIosSelectors('12:00:00', this.app.state.user.is12Hour)
    }

    this.app.appendScreen(this.container)
  }


  loadData() {
    this.user = this.app.state.user
    this.hasEdited = false
    this.creating = {
      ...this.creating,
      refUserId: this.app.userId
    }
    this.structure = this.createStructure()

    setTimeout(() => {
      this.loading = false
      this.render()
    }, 500)
  }
}

export default CreateScreen