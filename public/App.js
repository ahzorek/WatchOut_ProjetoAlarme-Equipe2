import DashboardScreen from './screens/DashboardScreen.js'
import SettingsScreen from './screens/SettingsScreen.js'
import AlarmsScreen from './screens/AlarmsScreen.js'
import CreateScreen from './screens/CreateScreen.js'
import AlarmHandler from './widgets/AlarmHandler.js'
import getTheme from './utils/getTheme.js'
import splitTimeString from './utils/splitTimeString.js'
import formatTime from './utils/formatTime.js'
import getWeatherData from './utils/getWeather.js'
import compareTimeObjects from './utils/compareTimeObjects.js'

import { bellIcon, createIcon, settingsIcon } from './icons/index.js'

//improvisando queryparams para testes
const params = new URLSearchParams(window.location.search)

//algumas constantes (pq nao?)
const SEC = 1000
const MIN = 60_000
const HOUR = 36_000_00

class App {
  constructor() {
    this.root = document.documentElement
    this.isDevMode = false
    this.container = document.querySelector('.app')
    this.state = {}
    this.currentScreen = null
    this.history = []
    this.userId = params.get('user') || localStorage.getItem('userId')
    this.theme = null
    this.audioContext = null

    this.isLoading = true

    this.dashboardScreen = new DashboardScreen(this)
    this.settingsScreen = new SettingsScreen(this)
    this.alarmsScreen = new AlarmsScreen(this)
    this.createScreen = new CreateScreen(this)
    this.alarmHandler = new AlarmHandler(this, this.container)

    this.initializeApp()

    // inicia com a tela Dashboard
    this.activateScreen(this.dashboardScreen)

    // cria navegação
    this.createBottomNavigationBar()

    this.alarmHandler.createAlarmDialog()

    //this.runEverySecond()

    this.runEvery15Minutes()

    //fim construtor

  }

  async initializeApp() {
    await this.initializeUser()
    await this.initializeTheme()
    await this.initializeDateAndTime()

    if (this.state.user && this.state.user.city) {
      await this.initializeAlarms(this.state.user)
      await this.initializeWeather(this.state.user.city)
      this.alarmHandler.defineNextAlarm(this.state.timeNow, this.state.alarms)
    } else {
      console.error('race condition failed at app start')
    }

    this.addVisibilityChangeListener()
    this.initAudioContext()
    this.isLoading = false
  }

  timeStringUpdated() {
    return (
      formatTime(this.state.timeNow.h) + ':' +
      formatTime(this.state.timeNow.m) + ':' +
      formatTime(this.state.timeNow.s)
    )
  }

  // runEverySecond() {
  //   setInterval(() => {
  //     //roda todo segundo
  //     this.incrementClock(this.state.timeNow)

  //     // console.log(this.timeStringUpdated())
  //   }, SEC)

  // }

  initAudioContext() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
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

  getWeekdayString() {
    return this.state.currDate.split('.')[0]
  }

  getAlarmById(id) {
    return Array.from(this.state.alarms).find(alarm => alarm.id === id)
  }

  updateLocalAlarmData(id, data) {
    const alarmIndex = Array.from(this.state.alarms).findIndex(alarm => alarm.id === id)
    this.state.alarms[alarmIndex] = data
    this.alarmHandler.defineNextAlarm(this.state.timeNow, this.state.alarms)

  }

  addNewAlarmToLocalData(data) {
    this.state.alarms.push(data)
    this.alarmHandler.defineNextAlarm(this.state.timeNow, this.state.alarms)
  }

  updateUserState(newState) {
    this.state.user = newState
  }

  checkForAlarms() {
    if (this.state?.nextAlarm) {
      if (compareTimeObjects(
        this.state.timeNow,
        this.state.nextAlarm.timeObj
      )) {
        console.log('alarme ativou')
        this.alarmHandler.startAlarm(this.state.nextAlarm)
        // realiza acima toda lógica de disparar o alarm (dialog e alert som)
        // e ativa abaixo a logica para procurar o proximo alarme valido
        this.alarmHandler.defineNextAlarm(
          this.state.timeNow,
          this.state.alarms,
          this.state.nextAlarm.id
        )
      }
    }
  }

  addVisibilityChangeListener() {
    this.state.focus = true
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.state.focus = true
        console.log('app is visible again, updating time and date')
        this.initializeDateAndTime()
        if (this.currentScreen instanceof DashboardScreen) {
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

    if (this.theme !== theme) {
      this.theme = theme
    }
    this.root.setAttribute('class', this.theme)
  }

  async getMessageFromServer() {
    const res = await fetch(`/message?id=${this.userId}`)
    const { mensagem } = await res.json()

    return mensagem
  }

  async updateInterfaceAfterChanges() {
    await this.initializeTheme()
    await this.initializeWeather(this.state.user.city)
    this.state.greetingMessage = await this.getMessageFromServer()
  }

  async initializeDateAndTime() {
    this.state.greetingMessage = await this.getMessageFromServer()
    this.state.currTime = await this.getTimeFromServer()
    this.state.currDate = await this.getDateFromServer()
    this.state.timeNow = splitTimeString(this.state.currTime)
  }


  async initializeUser() {
    const res = await fetch(`/user/${this.userId}`)
    const { data } = await res.json()

    console.table('initializing user::', this.userId, data)

    this.state.user = data
  }

  async initializeWeather(city) {
    console.log('initializing weather for city:', city)
    this.state.weather = await getWeatherData(city)
  }

  async initializeAlarms(user) {
    const alarms = await Promise.all(user.alarms.map(async (alarmId) => {
      const alarm = await this.getAlarms(alarmId)
      return alarm
    }))

    alarms.sort((a, b) => {
      const [_a] = a.alarmTime.split(':')
      const [_b] = b.alarmTime.split(':')
      return +_a - +_b
    })
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
    const previousItemVisited = this.history.length - 2
    this.activateScreen(this.history[previousItemVisited], true) //flag true aqui sinaliza que a navegação esta 'voltando' portanto não sera adicionada ao historico, assim vc n fica em um loop eterno entre duas telas
    this.history.pop()
  }

  createBottomNavigationBar() {
    const navigation = document.createElement('nav')
    navigation.classList.add('navigation')

    const ul = document.createElement('ul')

    const alarmsLi = document.createElement('li')
    alarmsLi.classList.add('btn', 'secondary-btn')
    alarmsLi.id = 'alarms'
    alarmsLi.innerHTML = `
      ${bellIcon}
      <h4>Alarmes</h4>
    `
    ul.appendChild(alarmsLi)

    const createLi = document.createElement('li')
    createLi.classList.add('btn', 'primary-btn')
    createLi.id = 'create'
    createLi.innerHTML = createIcon

    ul.appendChild(createLi)

    const settingsLi = document.createElement('li')
    settingsLi.classList.add('btn', 'secondary-btn')
    settingsLi.id = 'settings'

    settingsLi.innerHTML = `
      ${settingsIcon}
      <h4>Ajustes</h4>
    `
    ul.appendChild(settingsLi)
    navigation.appendChild(ul)

    this.appendScreen(navigation)

    alarmsLi.addEventListener('click', () => {
      if (!(this.currentScreen instanceof AlarmsScreen)) {
        this.activateScreen(this.alarmsScreen)
      }
    })

    createLi.addEventListener('click', () => {
      if (!(this.currentScreen instanceof CreateScreen)) {
        this.activateScreen(this.createScreen)
      }
    })

    settingsLi.addEventListener('click', () => {
      if (!(this.currentScreen instanceof SettingsScreen)) {
        this.activateScreen(this.settingsScreen)
      }
    })
  }

  devMode(activate) {
    const allDOMNodes = Array.from(document.body.getElementsByTagName('*'))
    if (activate) allDOMNodes.forEach(node => node.classList.add('dev__mode'))
    else
      allDOMNodes.forEach(node => node.classList.remove('dev__mode'))
  }
}

export default App