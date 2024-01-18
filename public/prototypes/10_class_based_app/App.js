import DashboardScreen from './screens/DashboardScreen.js'
import SettingsScreen from './screens/SettingsScreen.js'
import AlarmsScreen from './screens/AlarmsScreen.js'
import CreateScreen from './screens/CreateScreen.js'
import EditScreen from './screens/EditScreen.js'

import getTheme from './utils/getTheme.js'
import splitTimeString from './utils/splitTimeString.js'
import formatTime from './utils/formatTime.js'
import getWeatherData from './utils/getWeather.js'

//improvisando queryparams para testes
const params = new URLSearchParams(window.location.search)

//algumas constantes (pq nao?)
const SEC = 1000
const MIN = 60_000
const HOUR = 36_000_00

class App {
  constructor() {
    this.root = document.documentElement
    this.container = document.querySelector('.app')
    this.state = {}
    this.currentScreen = null
    this.history = []

    this.isLoading = true

    this.dashboardScreen = new DashboardScreen(this)
    this.settingsScreen = new SettingsScreen(this)
    this.alarmsScreen = new AlarmsScreen(this)
    this.createScreen = new CreateScreen(this)
    this.editScreen = new EditScreen(this)

    this.initializeApp()

    // inicia com a tela Dashboard
    this.activateScreen(this.dashboardScreen)

    // cria navegação
    this.createNavigation()

    // cria a box de dialogo do alarme(tem que existir no markup sempre)
    this.createAlarmDialog()

    this.runEverySecond()

    this.runEvery15Minutes()

    //fim construtor
  }

  async initializeApp() {
    await this.initializeUser()
    await this.initializeTheme()
    await this.initializeDateAndTime()
    await this.initializeAlarms(this.state.user)
    await this.initializeWeather(this.state.user.city)

    this.addVisibilityChangeListener()
    this.isLoading = false
  }

  timeStringUpdated() {
    return (
      formatTime(this.state.timeNow.h) + ':' +
      formatTime(this.state.timeNow.m) + ':' +
      formatTime(this.state.timeNow.s)
    )
  }

  runEverySecond() {
    setInterval(() => {
      //roda todo segundo
      this.incrementClock(this.state.timeNow)

      // console.log(this.timeStringUpdated())
    }, SEC)

  }

  runEvery5Minutes() {
    setInterval(async () => {
      console.table(
        'original time string:::', this.state.currTime,
        'current time string :::', this.timeStringUpdated(),
        'new time from server:::', await this.getTimeFromServer()
      )
    }, 15 * MIN)
  }

  runEvery15Minutes() {
    setInterval(() => {
      //roda a cada 15min

      this.initializeDateAndTime()
    }, 15 * MIN)
  }

  addVisibilityChangeListener() {
    document.addEventListener('visibilitychange', () => {
      console.log('mudança de visibilidade')
      if (document.visibilityState === 'visible') {
        this.state.focus = true
        if (this.currentScreen instanceof DashboardScreen) {
          this.initializeDateAndTime()
        }
      } else {
        this.state.focus = false
        // if (this.currentScreen instanceof DashboardScreen) {
        //   this.currentScreen.deactivate()
        // }
      }
    })
  }

  syncDateToServer = async () => {
    const newDate = await this.getDateFromServer()
    if (newDate !== this.state.currDate) {
      this.state.currDate = newDate
    } else
      syncDateToServer()
  }

  incrementClock = ({ h, m, s }) => {
    const minSecLimit = 59
    const hourLimit = 23
    //verifica qual atualização deve ser realizada, ajusta o horario
    //se apenas seg, atualiza seg (incrementa)
    if (s < minSecLimit) {
      this.state.timeNow.s += 1
    }
    //se seg e min atualiza seg (zera) e min (incrementa)
    else if (s === minSecLimit && m < minSecLimit) {
      this.state.timeNow.s = 0;
      this.state.timeNow.m += 1
    }
    //se seg, min e hora, atualiza os 3 valores (zera seg, min, incrementa hora)
    else if (s === minSecLimit && m === minSecLimit && h < hourLimit) {
      this.state.timeNow.s = 0;
      this.state.timeNow.m = 0;
      this.state.timeNow.h += 1
    }
    // se ha tambem virada do dia, zera seg, min, hora e atualiza data com nova chamada no servidor
    else if (s === minSecLimit && m === minSecLimit && h === hourLimit) {
      this.state.timeNow.h = 0
      this.state.timeNow.m = 0
      this.state.timeNow.s = 0

      //muda também o dia buscando nova data no servidor
      this.syncDateToServer()
    }
  }

  async initializeTheme() {
    const theme = this.state.user.useNeutralTheme
      ? 'neutral-theme'
      : params.get('theme') || await getTheme()

    this.root.setAttribute('class', theme)
  }

  async initializeDateAndTime() {
    this.state.currDate = await this.getDateFromServer()
    this.state.currTime = await this.getTimeFromServer()
    this.state.timeNow = splitTimeString(this.state.currTime)
  }


  async initializeUser() {
    const userId = params.get('user') || localStorage.getItem('userId') || 'XAs4xE6k'
    const res = await fetch(`/user/${userId}`)
    const { data } = await res.json()

    console.table('initializing alarms for user,', userId, data)

    this.state.user = data
  }

  async initializeWeather(city) {
    this.state.weather = await getWeatherData(city)
  }

  async initializeAlarms(user) {
    const alarms = await Promise.all(user.alarms.map(async (alarmId) => {
      const alarm = await this.getAlarms(alarmId)
      return {
        ...alarm,
        ringtone: {
          title: 'Whistle',
          slug: 'whistle',
          format: 'mp3'
        }
      }
    }))

    this.state.alarms = alarms
  }

  getAlarms = async (alarmId) => {
    const res = await fetch(`/alarm/${alarmId}`)
    const alarm = await res.json()
    return alarm
  }


  getTimeFromServer = async () => {
    const res = await fetch('/current-time')
    const { horaCerta } = await res.json()
    return horaCerta
  }

  //busca a data no servidor
  getDateFromServer = async () => {
    const res = await fetch('/current-date')
    const { hoje } = await res.json()
    return hoje
  }

  appendScreen(content) {
    // adiciona o conteúdo ao contêiner principal
    this.container.appendChild(content)
  }

  activateScreen(screenInstance, reverse) {
    // desativa a tela atual se houver
    if (this.currentScreen && typeof this.currentScreen.deactivate === 'function') {
      this.currentScreen.deactivate()
    }

    // add ao historico se a navegação nao for retornando
    if (!reverse) {
      this.history.push(screenInstance)
    }

    // reatribui a tela
    this.currentScreen = screenInstance

    //ativa nova tela
    if (this.currentScreen && typeof this.currentScreen.activate === 'function') {
      this.currentScreen.activate()
    }
  }

  goBack() {
    this.activateScreen(this.history[this.history.length - 2], true)
    this.history.pop()
  }

  createNavigation() {
    const navigation = document.createElement('nav')
    navigation.classList.add('navigation')

    const ul = document.createElement('ul')

    // Adiciona AlarmsBtn
    const alarmsLi = document.createElement('li')
    alarmsLi.classList.add('btn', 'secondary-btn')
    alarmsLi.id = 'alarms'
    alarmsLi.innerHTML = `
      ${bellIcon}
      <h4>Alarms</h4>
    `
    ul.appendChild(alarmsLi)

    // Adiciona CreateBtn
    const createLi = document.createElement('li')
    createLi.classList.add('btn', 'primary-btn')
    createLi.id = 'create'
    createLi.innerHTML = createIcon

    ul.appendChild(createLi)

    // Adiciona SettingsBtn
    const settingsLi = document.createElement('li')
    settingsLi.classList.add('btn', 'secondary-btn')
    settingsLi.id = 'settings'

    settingsLi.innerHTML = `
      ${settingsIcon}
      <h4>Settings</h4>
    `
    ul.appendChild(settingsLi)

    // Adiciona a UL à Navigation
    navigation.appendChild(ul)

    // Adiciona a Navigation ao contêiner principal
    this.appendScreen(navigation)

    alarmsLi.addEventListener('click', () => this.activateScreen(this.alarmsScreen))
    createLi.addEventListener('click', () => this.activateScreen(this.createScreen))
    settingsLi.addEventListener('click', () => this.activateScreen(this.settingsScreen))

  }

  createAlarmDialog() {
    const alarmDialog = document.createElement('div')
    alarmDialog.classList.add('alarm', 'dialog')
    alarmDialog.id = 'alarm-box'

    // Adicione conteúdo ou lógica específica para o AlarmDialog, se necessário

    this.container.appendChild(alarmDialog)
  }
}

export default App


const settingsIcon = `
  <svg class="svg-inline--fa fa-sliders" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sliders"
    role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
    <path fill="currentColor"
      d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z">
    </path>
  </svg>
  `

const createIcon = `
  <svg class="svg-inline--fa fa-plus" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus"
    role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="">
    <path fill="currentColor"
      d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z">
    </path>
  </svg>
`

const bellIcon = `
  <svg class="svg-inline--fa fa-bell" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bell"
    role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="">
    <path fill="currentColor"
      d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z">
    </path>
  </svg>
`