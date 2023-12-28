console.log("sup") // sup

//gerenciar estado da aplicação enquanto em execução
const appState = {
  isFocused: true,
  isAlarmInitialized: false,
  currentScreen: 'dashboard',
  lastUpdated: null,
  timeNow: {
    h: null,
    m: null,
    s: null,
    t: null,
  },
  timeString: null,
  timeStringUpdated: () => `${formatTime(appState.timeNow.h)}:${formatTime(appState.timeNow.m)}:${formatTime(appState.timeNow.s)}`,
  currDate: null,
  hideSec: null,
  is12HourClock: null,
  tempUnit: null,
  user: null,
  alarms: [],

}

//algumas constantes (pq nao?)
const SEC = 1000
const MIN = 60_000
const HOUR = 36_000_00

//roootsssss
const htmlRootEl = document.documentElement

//output elements
const app = document.querySelector('.app')
const watchFace = document.querySelector('.time')
const displayDate = document.querySelector('.date')
const greetingMessage = document.querySelector('.greeting-message')

//interaction elements(buttons, mostly)
const alarmsBtn = document.getElementById('alarms')
const settingsBtn = document.getElementById('settings')

window.addEventListener('blur', () => {
  // console.log('focus lost')
  //relogio "dorme" apos 5min se foco na sua tela
  setTimeout(() => {
    console.log('relogio dormiu', appState.timeStringUpdated())
    appState.isFocused = false
  }, 5 * MIN)
})

window.addEventListener('focus', async () => {
  if (!appState.isFocused) {
    // console.log('focus gained')
    //relogio acorda apos foco na tela ser retomado, synca ajuste com servidor
    appState.isFocused = true
    printTime(await syncClockToServer())
  }
})

settingsBtn?.addEventListener('click', () => {
  app.classList.add('settings')
})

alarmsBtn?.addEventListener('click', () => {
  app.classList.add('alarms')
})

document.addEventListener('keydown', (e) => {
  // console.log(e)
  if (e.key === 'Backspace') {
    app.setAttribute('class', 'app')
  }
})

//improvisando queryparams para testes
const params = new URLSearchParams(window.location.search)

document.addEventListener('DOMContentLoaded', async () => {
  //carrega definições de usuário
  const user = params.get('user') || localStorage.getItem('userId')
  await initializeUser(await getUser(user))

  //define tema da aplicação com base no horario em servidor (ou sobrescreve com params locais, para testes mainly)
  const theme = appState.user.settings.useNeutralTheme
    ? 'neutral-theme'
    : params.get('theme') || await getTheme()

  //aplica o tema ao elemento html(root)
  htmlRootEl.setAttribute('class', theme)

  //sync relogio com o servidor e realiza a primeira impressão do relogio
  printTime(await syncClockToServer())

  //inicializa data correta do servidor
  appState.currDate = await getDateFromServer()
  printDate(appState.currDate)



  const updateClockInterval = async () => {
    if (appState.isFocused) {
      //roda o ajuste local do horario
      updateClock(appState.timeNow)

      //mostra o horario correto apos ajuste local
      printTime(appState.timeNow)
    }
    // proximo intervalor de ajuste
    setTimeout(() => updateClockInterval(), 1000)
  }

  //primeira inicialização do ajuste do relogio (chamada recursiva dentro da função)
  updateClockInterval()

  //faz a primeira busca pelos dados de clima no servidor e imprime valores
  printWeather(await getWeatherData(appState.user.city), appState.user.unit)



})
const updateClock = ({ h, m, s, t }, is12HourClock) => {
  const minSecLimit = 59
  const hourLimit = is12HourClock ? 11 : 23
  //verifica qual atualização deve ser realizada, ajusta o horario
  //se apenas seg, atualiza seg (incrementa)
  if (s < minSecLimit) {
    appState.timeNow.s += 1
  }
  //se seg e min atualiza seg (zera) e min (incrementa)
  else if (s === minSecLimit && m < minSecLimit) {
    appState.timeNow.s = 0; appState.timeNow.m += 1
  }
  //se seg, min e hora, atualiza os 3 valores (zera seg, min, incrementa hora)
  else if (s === minSecLimit && m === minSecLimit && h < hourLimit) {
    appState.timeNow.s = 0; appState.timeNow.m = 0; appState.timeNow.h += 1
  }
  // se ha tambem virada do dia, zera seg, min, hora e atualiza data com nova chamada no servidor
  else if (s === minSecLimit && m === minSecLimit && h === hourLimit) {
    appState.timeNow.s = 0; appState.timeNow.m = 0; appState.timeNow.h = 0

  }
}

//obtem horario correto com o servidor, separa a string em um objeto com 3 valores {h,m,s} e armazena no estado
const syncClockToServer = async () => {
  //chamada ao servidor retorna string do horario formato 'hh:mm:ss'
  appState.timeString = await getTimeFromServer()

  //armazena unix time de quando foi realizada a chamada
  appState.lastUpdated = Date.now()

  //separa a string obtida do servidor em 3 strings de 2 digitos para hora, min, e seg {h,m,s}
  appState.timeNow = splitTimeString(appState.timeString)

  console.log('relogio sincronizado com o servidor', appState.timeString)

  return appState.timeNow
}



const getTimeFromServer = async () => {
  const res = await fetch('/current-time')
  const { horaCerta } = await res.json()

  return horaCerta
}

const getDateFromServer = async () => {
  const res = await fetch('/current-date')
  const { hoje } = await res.json()

  return hoje
}

const getWeatherData = async (city = 'Florianopolis') => {
  const res = await fetch(`/weather?city=${city}`)
  const { results } = await res.json()

  return results
}

const splitTimeString = (currTime) => {
  let [h, m, s] = currTime.split(':')

  h = +h //transforma as Strings de hora, min, seg em Number
  m = +m //
  s = +s //

  return { h, m, s }
}

const formatTime = (num) => String(num).padStart(2, '0')

const printTime = ({ h, m, s }) => {
  if (appState.user.settings.hideSec) {
    watchFace.innerHTML = `${(h)}:${formatTime(m)}`
  }
  else
    watchFace.innerHTML = `${h}:${formatTime(m)}:<span class="sec-digit">${formatTime(s)}</span>`

  watchFace.setAttribute('datetime', `${formatTime(h)}:${formatTime(m)}:${formatTime(s)}`)
}

const printDate = (date) => {
  displayDate.innerHTML = date
  return
}

const printWeather = (weather, unit) => {
  const cityOut = document.querySelector('.city-name')
  const tempOut = document.querySelector('.temp')
  const minOut = document.querySelector('.min-span')
  const maxOut = document.querySelector('.max-span')
  const weatherIcon = document.querySelector('.weather-icon')

  const { city, temp, condition_slug, forecast } = weather
  const [today] = forecast

  weatherIcon.src = `https://assets.hgbrasil.com/weather/icons/conditions/${condition_slug}.svg`

  cityOut.innerHTML = city

  tempOut.innerHTML = displayTemp(temp, unit) + unit
  minOut.innerHTML = displayTemp(today.min, unit)
  maxOut.innerHTML = displayTemp(today.max, unit)

}

const getMessageFromServer = async (id) => {
  const res = await fetch(`/message?id=${id}`)
  const { mensagem } = await res.json()

  return mensagem
}

const getTheme = async () => {
  const res = await fetch(`/theme`)
  const { tema } = await res.json()

  return tema
}

const getUser = async (userId) => {
  const res = await fetch(`/user/${userId}`)
  const { data } = await res.json()

  return data
}

const getAlarms = async (alarmId) => {
  const res = await fetch(`/alarm/${alarmId}`)
  const alarm = await res.json()

  return alarm

}

const initializeUser = async (user) => {
  appState.user = {
    ...user,
    alarms: await Promise.all(user.alarms.map(async (alarmId) => {
      const alarm = await getAlarms(alarmId)
      return alarm
    }))
  }
  return
}

const displayTemp = (celsius, out) => {
  if (out !== 'C') {
    let temp_celsius = +celsius
    if (temp_celsius < -273.15) temp_celsius = -273.15

    const kelvin = (temp_celsius + 273.15)
    const fahrenheit = ((9 * temp_celsius + 160) / 5)

    if (out === 'F') {
      return fahrenheit + 'º'
    }
    else if (out === 'K') {
      return kelvin + 'K'
    }
  }
  else
    return celsius + 'º'
}

const turnOffAlarm = () => {
  const alarmBox = document.getElementById('alarm-box-active')
  alarmBox.addEventListener('transitionend', () => {
    alarmBox.remove()
  })
  alarmBox.classList.remove('active')
}

const snoozeAlarm = () => {
  const alarmBox = document.getElementById('alarm-box-active')
  alarmBox.classList.remove('active')
}

const handleAlarmActive = () => {
  const turnOff = document.getElementById('btn-turnOff')
  const snooze = document.getElementById('btn-snooze')

  turnOff.addEventListener('click', turnOffAlarm)
  snooze.addEventListener('click', snoozeAlarm)
}

handleAlarmActive()
