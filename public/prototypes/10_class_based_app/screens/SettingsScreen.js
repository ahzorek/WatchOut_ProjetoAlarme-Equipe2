import Screen from './Screen.js'
import rigntonesList from '../data/ringtones.db.js'
import treatmentTitles from '../data/treatmentTitles.db.js'

class SettingsScreen extends Screen {
  constructor(app) {
    super(app)
    this.container = document.createElement('section')
    this.container.classList.add('screen', 'settings-screen')
    this.structure = null
    this.user = null

    this.render()
  }

  createSettingsItems(user) {

    const elements = []

    const container = document.createElement('div')

    const tratamentoContainer = document.createElement('div')
    const tratamentoTitle = document.createElement('h3')
    tratamentoTitle.classList.add('title3')
    tratamentoTitle.textContent = 'Tratamento'

    tratamentoContainer.appendChild(tratamentoTitle)

    const tratamentoSelect = document.createElement('select')
    tratamentoSelect.id = 'formaTratamento'
    tratamentoSelect.name = 'formaTratamento'

    const tratamentoOption = document.createElement('option')
    tratamentoOption.selected = true
    tratamentoOption.disabled = true
    tratamentoOption.textContent = 'Selecione'

    tratamentoSelect.appendChild(tratamentoOption)

    treatmentTitles.forEach(({ title, slug }) => {
      const tratamentoOption = document.createElement('option')
      tratamentoOption.textContent = title
      tratamentoOption.value = slug

      tratamentoSelect.appendChild(tratamentoOption)

    })

    tratamentoContainer.appendChild(tratamentoSelect)

    elements.push(tratamentoContainer)

    const nameContainer = document.createElement('div')
    const nameTitle = document.createElement('h3')
    nameTitle.classList.add('title3')
    nameTitle.textContent = 'Seu Nome'

    nameContainer.appendChild(nameTitle)

    const nameInput = document.createElement('input')
    nameInput.id = 'nome'
    nameInput.type = 'text'
    nameInput.value = user.nome
    nameInput.name = 'nome'

    nameContainer.appendChild(nameInput)

    elements.push(nameContainer)

    const cityContainer = document.createElement('div')
    const cityTitle = document.createElement('h3')
    cityTitle.classList.add('title3')
    cityTitle.textContent = 'Cidade ou Região'

    cityContainer.appendChild(cityTitle)

    const cityInput = document.createElement('input')
    cityInput.id = 'city'
    cityInput.type = 'text'
    cityInput.value = user.city
    cityInput.name = 'city'

    cityContainer.appendChild(cityInput)

    elements.push(cityContainer)

    //seletor unidade temp
    const containerTemp = document.createElement('div')

    const title = document.createElement('h3')
    title.classList.add('title3')
    title.textContent = 'Unidade Temperatura'

    containerTemp.appendChild(title)

    const temperatureOptions = ['Celsius', 'Fahrenheit', 'Kelvin']
    const temperaturePicker = createSegmentedPicker(user, temperatureOptions, 'unit', user.unit)

    containerTemp.appendChild(temperaturePicker)

    elements.push(containerTemp)

    //mostrar/esconder segundos
    const hideSecContainer = document.createElement('div')
    const hideSecTitle = document.createElement('h3')
    hideSecTitle.classList.add('title3')
    hideSecTitle.textContent = 'Segundos'

    hideSecContainer.appendChild(hideSecTitle)

    const secondsOptions = ['Mostrar', 'Esconder']
    const secondsPicker = createSegmentedPicker(user, secondsOptions, 'hideSec', user.hideSec)

    hideSecContainer.appendChild(secondsPicker)

    elements.push(hideSecContainer)

    //formato relogio
    const is12HourContainer = document.createElement('div')
    const is12HourTitle = document.createElement('h3')
    is12HourTitle.classList.add('title3')
    is12HourTitle.textContent = 'Formato Hora'

    is12HourContainer.appendChild(is12HourTitle)

    const is12HoursOptions = ['12 Horas', '24 Horas']
    const is12HourPicker = createSegmentedPicker(user, is12HoursOptions, 'is12Hour', user.is12Hour)

    is12HourContainer.appendChild(is12HourPicker)

    elements.push(is12HourContainer)

    //usar tema neutro
    const useNeutralThemeContainer = document.createElement('div')
    const useNeutralThemeTitle = document.createElement('h3')
    useNeutralThemeTitle.classList.add('title3')
    useNeutralThemeTitle.textContent = 'Usar Tema Neutro'

    useNeutralThemeContainer.appendChild(useNeutralThemeTitle)

    const useNeutralThemesOptions = ['Sim', 'Não']
    const useNeutralThemePicker = createSegmentedPicker(user, useNeutralThemesOptions, 'useNeutralTheme', user.useNeutralTheme)

    useNeutralThemeContainer.appendChild(useNeutralThemePicker)

    elements.push(useNeutralThemeContainer)

    //ringtone
    const ringtoneContainer = document.createElement('div')
    const ringtoneTitle = document.createElement('h3')
    ringtoneTitle.classList.add('title3')
    ringtoneTitle.textContent = 'Toque Padrão'

    ringtoneContainer.appendChild(ringtoneTitle)

    const ringtoneSelect = document.createElement('select')
    ringtoneSelect.id = 'defaultRingtone'
    ringtoneSelect.name = 'defaultRingtone'

    const defaultOption = document.createElement('option')
    defaultOption.selected = true
    defaultOption.disabled = true
    defaultOption.value = 'null'
    defaultOption.textContent = 'Selecione'

    rigntonesList.forEach(({ slug, title }) => {
      const option = document.createElement('option')
      option.value = slug
      option.textContent = title
      ringtoneSelect.appendChild(option)
    })

    ringtoneSelect.appendChild(defaultOption)

    ringtoneContainer.appendChild(ringtoneSelect)

    elements.push(ringtoneContainer)

    elements.forEach(el => container.appendChild(el))

    return container
  }


  createStructure(user) {
    const frame = document.createElement("div")
    frame.classList.add('frame')
    // frame.style.display = 'contents'

    const header = document.createElement("header")
    header.classList.add("top-nav", "side-screen")

    const title = document.createElement("h2")
    title.classList.add("title1")
    title.textContent = "Settings"

    const closeButton = document.createElement("button")
    closeButton.classList.add("close-screen")

    closeButton.innerHTML = closeIcon

    closeButton.addEventListener('click', () => this.app.goBack())

    header.appendChild(title)
    header.appendChild(closeButton)

    const form = document.createElement("form")
    form.classList.add("settings-form")

    const settingsItems = this.createSettingsItems(user)
    settingsItems.classList.add("settings-items")

    form.appendChild(settingsItems)

    frame.appendChild(header)
    frame.appendChild(form)

    return frame
  }


  render() {
    if (this.loading) {
      this.container.innerHTML = `
        <div class="loading-spinner"></div>
      `
    } else {
      this.container.innerHTML = ''
      this.container.appendChild(this.structure)
    }
    this.app.appendScreen(this.container)
  }
  loadData() {
    this.user = this.app.state.user
    this.structure = this.createStructure(this.user)

    setTimeout(() => {
      this.loading = false
      this.render()
    }, 500)
  }
}

export default SettingsScreen

function createSegmentedPicker(user, options, name, checkedOption) {

  const segmentedPicker = document.createElement('div')
  segmentedPicker.classList.add('segmented-picker')

  options.forEach(option => {
    const [input, label] = createRadioInputAndLabel(option[0], option, name, user[name] === option[0])
    segmentedPicker.appendChild(input)
    segmentedPicker.appendChild(label)
  })

  return segmentedPicker
}


function createRadioInputAndLabel(value, labelText, name, checked) {

  const input = document.createElement('input')
  input.value = value
  input.id = value
  input.type = 'radio'
  input.name = name
  if (checked) {
    input.checked = true
  }

  const label = document.createElement('label')
  label.htmlFor = value
  label.innerHTML = `<span>${labelText}</span>`

  return [input, label]
}

const closeIcon = `
  <svg viewBox="-0.5 0 25 25" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21.32L21 3.32001" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M3 3.32001L21 21.32" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>
`