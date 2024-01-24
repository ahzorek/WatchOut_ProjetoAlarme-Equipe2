import Screen from './Screen.js'

import rigntonesList from '../data/ringtones.db.js'
import { closeIcon, saveIcon } from '../icons/index.js'

import createSegmentedPicker from '../utils/createSegmentedPicker.js'
import { convertTimeFrom12Hour } from '../utils/convertTime.js'
import formatTimeToString from '../utils/formatTimeToString.js'

class EditScreen extends Screen {
  constructor(app, id) {
    super(app)
    this.id = id
    this.container = document.createElement('section')
    this.container.classList.add('screen', 'edit-screen')
    this.alarm = this.app.getAlarmById(id)
    this.editing = {}
    this.hasEdited = false
    this.topSaveButton = null
    this.daysField = null
    this.descrField = null
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
    title.textContent = "Edit"

    const closeButton = document.createElement("button")
    closeButton.classList.add("nav-btn", "back-btn")
    closeButton.innerHTML = closeIcon

    closeButton.addEventListener('click', () => this.app.goBack())

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

  createFields({ description, isActive, isRepeating, ringtone, days }) {
    const elements = []
    const container = document.createElement('div')

    const horarioContainer = document.createElement('div')

    const horarioTitle = document.createElement('h3')
    horarioTitle.classList.add('title3')
    horarioTitle.textContent = 'Time'
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
    descriptTitle.textContent = 'Description'

    descriptContainer.appendChild(descriptTitle)

    const descriptInput = document.createElement('input')
    descriptInput.id = 'description'
    descriptInput.type = 'text'
    descriptInput.value = description
    descriptInput.name = 'description'
    this.descrField = descriptInput

    descriptContainer.appendChild(descriptInput)

    elements.push(descriptContainer)

    //active
    const isActiveContainer = document.createElement('div')
    const isActiveTitle = document.createElement('h3')
    isActiveTitle.classList.add('title3')
    isActiveTitle.textContent = 'Active'

    isActiveContainer.appendChild(isActiveTitle)

    const isActivesOptions = [
      { optionName: 'Sim', optionValue: true },
      { optionName: 'Não', optionValue: false },
    ]
    const isActivePicker = createSegmentedPicker(
      isActivesOptions, 'isActive', isActive, true
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
      checkboxInput.checked = days[daySlug]

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
    isRepeatingTitle.textContent = 'Repeating'

    isRepeatingContainer.appendChild(isRepeatingTitle)

    const isRepeatingsOptions = [
      { optionName: 'Sim', optionValue: true },
      { optionName: 'Não', optionValue: false },
    ]
    const isRepeatingPicker = createSegmentedPicker(
      isRepeatingsOptions, 'isRepeating', isRepeating, true
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
      option.selected = (slug === ringtone)

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
    if (this.verifyDataConsistency(this.editing, 'edit')) {
      await this.editAlarmSettings(this.id, this.editing)
      setTimeout(() => { this.app.goBack() }, 400)
    }
    else console.log('inconsistency detected, no data was sent')
  }

  setVisibilityToSaveButton() {
    this.hasEdited = true
    this.topSaveButton.classList.add('active')
  }

  async editAlarmSettings(alarmId, data) {
    try {
      const res = await fetch(`/alarm/${alarmId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error(`${res.status}`)
      }
      const response = await res.json()
      console.log('alarm:', alarmId, 'foi atualizado com sucesso')

      this.app.updateLocalAlarmData(alarmId, response)

    } catch (err) {
      console.error('Error:', err)
    }
  }


  handleInputChanges(e) {
    if (!this.hasEdited) this.setVisibilityToSaveButton()

    let value, key = e.target.name
    const isBool = e.target.getAttribute('data-isBool')

    if (e.target.type === 'checkbox') {
      value = e.target.checked
      this.editing = {
        ...this.editing,
        days: {
          ...this.alarm.days,
          ...this.editing.days,
          [key]: value
        }
      }
    }
    else if (e.target.type === 'text') {
      value = e.target.value.trim()
      this.editing = { ...this.editing, [key]: value }
    }
    else {
      value = (isBool == 'true') ? e.target.value == 'true' : e.target.value
      this.editing = { ...this.editing, [key]: value }
    }
    console.log(this.editing)
  }

  createAlarmTimeObject({ h, m, isPM }, is12Hour) {
    if (!this.hasEdited) this.setVisibilityToSaveButton()
    const hour = is12Hour ? convertTimeFrom12Hour(h, isPM) : h
    this.editing.alarmTime = formatTimeToString(hour, m)
  }

  render() {

    if (this.loading) {
      this.container.innerHTML = `
      <div class="loading-spinner"></div>
      `
    } else {
      // console.log(this.alarm)
      this.container.innerHTML = ``
      this.container.appendChild(
        this.createStructure(this.alarm)
      )

      this.createIosSelectors(this.alarm.alarmTime, this.app.state.user.is12Hour)
    }

    this.app.appendScreen(this.container)
  }

  loadData() {
    this.hasEdited = false

    setTimeout(() => {
      this.loading = false

      this.render()
    }, 500)
  }
}

export default EditScreen 
