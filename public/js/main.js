console.log("sup") // sup

//gerenciar estado da aplicação enquanto em execução
const appState = {
  isFocused: true,
  devStopped: false,
  isAlarmInitialized: false,
  currentScreen: 'dashboard',
  lastUpdated: null,
  nextAlarm: {
    obj: {},
    time: {},
    isSet: false,
    hasFired: false
  },
  timeNow: {
    h: null,
    m: null,
    s: null,
    t: null,
  },
  timeString: null,
  timeStringUpdated: function () {
    return `${formatTime(this.timeNow.h)}:${formatTime(this.timeNow.m)}:${formatTime(this.timeNow.s)}`
  },
  currDate: null,
  user: null,

  setProperty: function (prop, value) { this[prop] = value },
  setCurrentScreen: function (nextScreen) { this.currentScreen = nextScreen },
  setCurrDate: function (date) { this.currDate = date },

  updateLocalAlarmData: function (id, data) {
    const localIndex = this.user.alarms.findIndex(alarm => alarm.id == id)
    this.user.alarms[localIndex] = data
  },

  initAudioContext() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
  },

  audioContext: null,
  isPlaying: false,
  source: null,
  currentRingtone: null,


  async playRingtone(alarm) {
    if (!this.currentRingtone) {
      this.currentRingtone = alarm
    }
    const { ringtone } = alarm
    try {
      const response = await fetch(`/audio/ringtones/${ringtone.slug}.${ringtone.format}`)
      const data = await response.arrayBuffer()
      const buffer = await this.audioContext.decodeAudioData(data)

      this.source = this.audioContext.createBufferSource()
      this.source.buffer = buffer
      this.source.connect(this.audioContext.destination)

      this.source.onended = () => {
        if (this.isPlaying) {
          this.playRingtone(this.currentRingtone)
        }
      }

      this.source.start()
      this.isPlaying = true

    } catch (error) {
      console.error('Error loading or playing audio file:', error)
    }
  },

  stopRingtone() {
    if (this.isPlaying && this.source) {
      this.source.stop()
      this.currentRingtone = null
      this.isPlaying = false
    }
  }
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
const closeButtons = document.querySelectorAll('.close-screen')
const settingsForm = document.querySelector('.settings-form')
const screens = document.querySelectorAll('.screen')

document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    console.log('detected sleep, clock is', document.visibilityState)
  }
  //relogio acorda apos foco na tela ser retomado, synca ajuste com servidor
  printTime(await syncClockToServer(), true)

})

settingsBtn?.addEventListener('click', () => {
  screens.forEach(screen => screen.classList.remove('active'))
  document.querySelector('.settings-screen').classList.add('active')
})

alarmsBtn?.addEventListener('click', () => {
  const alarmScreen = document.querySelector('.alarms-screen')

  screens.forEach(screen => screen.classList.remove('active'))
  alarmScreen.classList.add('active')
})

function backToDashboard() {
  console.log('closing side screen')
  screens.forEach(screen => screen.classList.remove('active'))
  document.querySelector('.dashboard-screen').classList.add('active')

}

closeButtons?.forEach(button => {
  button?.addEventListener('click', () => {
    backToDashboard()
  })
})

document.addEventListener('keydown', (e) => {
  // console.log(e)
  if (e.key === 'Backspace' && e.target.nodeName !== 'INPUT') {
    backToDashboard()
  }
})

//improvisando queryparams para testes
const params = new URLSearchParams(window.location.search)

document.addEventListener('click', function () {
  if (!appState.audioContext) {
    appState.initAudioContext()
    appState.audioContext.resume()
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  //carrega definições de usuário
  const userId = params.get('user') || localStorage.getItem('userId') || null
  try {
    const user = await getUser(userId)
    await initializeAlarms(user) //busca config do usuario no servidor
  } catch (err) {
    console.error('erro:', err)
  }

  //define tema da aplicação com base no horario em servidor (ou sobrescreve com params locais, para testes)
  const theme = appState.user?.useNeutralTheme
    ? 'neutral-theme'
    : params.get('theme') || await getTheme()

  greetingMessage.innerHTML = await getMessageFromServer(userId)

  //aplica o tema ao elemento html(root)
  htmlRootEl.setAttribute('class', theme)

  //sync relogio com o servidor e realiza a primeira impressão do relogio
  printTime(await syncClockToServer())

  //inicializa data correta do servidor
  appState.currDate = await getDateFromServer()
  printDate(appState.currDate)

  const updateClockInterval = async () => {
    if (appState.isFocused && !appState.devStopped) {
      //roda o ajuste local do horario
      incrementClock(appState.timeNow)

      //checa se ha alarme para disparar
      checkForNextAlarm(appState.timeNow, appState.user.alarms)

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

  //atualiza dados do clima a cada 15min com o servidor
  setInterval(async () => printWeather(
    await getWeatherData(appState.user.city), appState.user.unit
  ), (15 * MIN)) //atualiza weather a cada 15min


  renderSettingsScreen(appState.user)

  renderAlarmListScreen(appState.user.alarms)

  settingsForm.addEventListener('submit', (e) => handleSettingsChanges(e))


})

const incrementClock = ({ h, m, s }) => {
  const minSecLimit = 59
  const hourLimit = 23
  //verifica qual atualização deve ser realizada, ajusta o horario
  //se apenas seg, atualiza seg (incrementa)
  if (s < minSecLimit) {
    appState.timeNow.s += 1
  }
  //se seg e min atualiza seg (zera) e min (incrementa)
  else if (s === minSecLimit && m < minSecLimit) {
    appState.timeNow.s = 0;
    appState.timeNow.m += 1
  }
  //se seg, min e hora, atualiza os 3 valores (zera seg, min, incrementa hora)
  else if (s === minSecLimit && m === minSecLimit && h < hourLimit) {
    appState.timeNow.s = 0;
    appState.timeNow.m = 0;
    appState.timeNow.h += 1
  }
  // se ha tambem virada do dia, zera seg, min, hora e atualiza data com nova chamada no servidor
  else if (s === minSecLimit && m === minSecLimit && h === hourLimit) {
    appState.timeNow.h = 0
    appState.timeNow.m = 0
    appState.timeNow.s = 0

    //muda também o dia buscando nova data no servidor
    getNewDate()
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

//realiza ajuste periodico do relogio com o servidor (1Hora)
setInterval(() => syncClockToServer(), HOUR)


//teste de dados (verificar a longo prazo o comportamento do relogio) //
setInterval(async () => {
  console.table(
    'original time string:::', appState.timeString,
    'current time string :::', appState.timeStringUpdated(),
    'new time from server:::', await getTimeFromServer()
  )
}, 15 * MIN)

//atualiza data na virada do dia
const getNewDate = async () => {
  const newDate = await getDateFromServer()
  if (newDate !== appState.currDate) {
    appState.currDate = newDate
    printDate(appState.currDate)
    return
  } else
    getNewDate()
}

//busca o horario no servidor
const getTimeFromServer = async () => {
  const res = await fetch('/current-time')
  const { horaCerta } = await res.json()

  return horaCerta
}

//busca a data no servidor
const getDateFromServer = async () => {
  const res = await fetch('/current-date')
  const { hoje } = await res.json()

  return hoje
}

//busca dados do clima no servidor
const getWeatherData = async (city = 'Florianopolis') => {
  const res = await fetch(`/weather?city=${city}`)
  const { results } = await res.json()

  return results
}

//separa a string horario em um objeto com numbers {h,m,s}
const splitTimeString = (currTime) => {
  let [h, m, s] = currTime.split(':')

  h = +h //transforma as Strings de hora, min, seg em Number
  m = +m //
  s = +s //

  return { h, m, s }
}

const formatTime = (num) => String(num).padStart(2, '0')

//é possivel refatorar essa função para extrair a atribuição de chamar a função renderDOM e fazer com que ela apenas 'retorne' a string html correta
const printTime = ({ h, m, s }, forceUpdate, alarmView) => {
  let output, newRender
  const hour = appState.user.is12Hour && h > 12 ? (h - 12) : h // se o relógio for de 12h E se for depois das 12h, então hora = h - 12, se não hora = h
  const min = m
  const sec = s
  const suffix = appState.user.is12Hour && h >= 12 ? 'PM' : 'AM'
  const suffixWrapper = `<span class="time-format-suffix">${suffix}</span>`

  if (forceUpdate) console.log('forced update')

  if (appState.user.hideSec || alarmView) {
    //se o usuario opta por nao mostrar os segundos, nao precisamos renderizar uma nova string a cada segundo, logo podemos garantir que
    //o novo render so ocorra em minutos cheios (04:20:00, por ex). porém, ao retomar o app de um periodo de hibernação,
    //sincronizamos o relogio com o servidor e queremos garantir que esse valor va pra tela imediatamente, ai entra a flag forceUpdate
    //se passado *true* como terceiro param para a função printTime, garante que o novo valor seja enviado para a tela
    output = `${(hour)}:${formatTime(min)}${appState.user.is12Hour ? suffixWrapper : ''}`

    //aqui os casos que vão chamar um novo render: forceUpdate:true, caso seja um minuto cheio (s === 0) ou caso o relogio ainda não esteja preenchido (first render)
    if (s === 0 | watchFace.innerHTML === '' | forceUpdate) newRender = true

  }
  //se os segundos são mostrados a atualização ocorre normalmente todo segundo (1000ms)
  else {
    output = `${hour}:${formatTime(min)}:<span class="sec-digit">${formatTime(sec)}</span>${appState.user.is12Hour ? suffixWrapper : ''}`
    newRender = true
  }

  if (newRender) {
    renderDOM(watchFace, 'innerHTML', output)
    newRender = false
  }
  return output
}

const printDate = (date) => {
  renderDOM(displayDate, 'innerHTML', date)
  return
}

//possivel refatorar essa função para um sistema baseado em template/componente e não essas atirbuições individuais
const printWeather = (weather, unit) => {
  const cityOut = document.querySelector('.city-name')
  const tempOut = document.querySelector('.temp')
  const minOut = document.querySelector('.min-span')
  const maxOut = document.querySelector('.max-span')
  const weatherIcon = document.querySelector('.weather-icon')

  const { city, temp, condition_slug, forecast } = weather
  const [today] = forecast
  const tempNow = formatTemperature(temp, unit) + (unit !== "K" ? unit : '')
  const tempMin = formatTemperature(today.min, unit)
  const tempMax = formatTemperature(today.max, unit)
  const tempIcon = `https://assets.hgbrasil.com/weather/icons/conditions/${condition_slug}.svg`

  renderDOM(cityOut, 'innerHTML', city)
  renderDOM(tempOut, 'innerHTML', tempNow)
  renderDOM(minOut, 'innerHTML', tempMin)
  renderDOM(maxOut, 'innerHTML', tempMax)
  renderDOM(weatherIcon, 'src', tempIcon)
}

const getMessageFromServer = async (id) => {
  const { mensagem } = await fetchContent(`/message?id=${id}`)
  return mensagem
}

// possivel refatorar getTheme, getUser e getAlarms para reaproveitar o helper fetchContent (como ex acima função getMessageFromSever)
const getTheme = async (timeStamp = false) => {
  const res = await fetch(`/theme?hour=${timeStamp}`)
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

//talvez alterar essa atribuição de appState.user.alarms para um objeto direto na raiz de appState
const initializeAlarms = async (user) => {
  console.log('initializing alarms for user,', user)
  appState.user = {
    ...user,
    alarms: await Promise.all(user.alarms.map(async (alarmId) => {
      const alarm = await getAlarms(alarmId)
      return {
        ...alarm,
        ringtone: {
          title: 'Whistle',
          slug: 'whistle',
          format: 'mp3'
        }
      }
    }))
  }
  return
}

const formatTemperature = (celsius, out) => {
  if (out !== 'C') {
    let temp_celsius = +celsius
    if (temp_celsius < -273.15) temp_celsius = -273.15

    const kelvin = (temp_celsius + 273.15)
    const fahrenheit = ((9 * temp_celsius + 160) / 5)

    if (out === 'F') {
      return fahrenheit + 'º'
    }
    else if (out === 'K') {
      return ~~kelvin + 'K'
    }
  }
  else
    return celsius + 'º'
}

const turnOffAlarm = () => {
  const alarmBox = document.getElementById('alarm-box')
  // alarmBox.addEventListener('transitionend', () => {
  //   alarmBox.remove()
  // })
  appState.stopRingtone()
  alarmBox.classList.remove('active')
}

const snoozeAlarm = () => {
  const alarmBox = document.getElementById('alarm-box')
  alarmBox.classList.remove('active')
}

const handleAlarmActive = () => {
  const turnOff = document.getElementById('btn-turnOff')
  const snooze = document.getElementById('btn-snooze')

  turnOff.addEventListener('click', turnOffAlarm)
  snooze.addEventListener('click', snoozeAlarm)
}

async function fireOffAlarm(alarm) {
  const alarmBox = document.getElementById('alarm-box')
  alarmBox.querySelector('.alarm-title').innerHTML = alarm.description
  if (alarm.isSnoozeEnabled) {
    alarmBox.querySelector('.snooze-btn').classList.add('display')
  }
  alarmBox.classList.add('active')

  appState.playRingtone(alarm)

  handleAlarmActive()
}

function handleAlarmDeactivation() {

}

function checkForNextAlarm({ h, m, s }, alarms) {
  const activeAlarms = alarms.filter((alarm) => alarm.isActive)

  if (activeAlarms.length === 0) return

  const futureActiveAlarms = activeAlarms.filter(alarm => {
    const [_h, _m] = alarm.alarmTime.split(':')
    return ((+_h > h) || (+_h === h && +_m >= m))
  })

  if (futureActiveAlarms.length === 0) return

  const orderedAlarms = futureActiveAlarms.sort((a, b) => {
    const timeDifferenceA = calculateTimeDifference(a.alarmTime, h, m)
    const timeDifferenceB = calculateTimeDifference(b.alarmTime, h, m)

    return timeDifferenceA - timeDifferenceB
  })

  const [nextAlarm] = orderedAlarms
  const nextAlarmTime = splitTimeString(nextAlarm.alarmTime)

  if (compareTime({ h, m, s }, nextAlarmTime)) {
    console.log('alarme ativou')
    fireOffAlarm(nextAlarm)
  }
}

function compareTime(currTime, alarmTime) {
  // console.log('comparing time to alarm', currTime, alarmTime)
  return JSON.stringify(currTime) === JSON.stringify(alarmTime)
}

function calculateTimeDifference(alarmTime, currentHour, currentMinute) {
  const [alarmHour, alarmMinute] = alarmTime.split(':')
  const totalMinutesAlarm = +alarmHour * 60 + +alarmMinute
  const totalMinutesCurrent = currentHour * 60 + currentMinute

  // calcula a diferença em minutos
  // console.log(totalMinutesAlarm, totalMinutesCurrent, (totalMinutesAlarm - totalMinutesCurrent))

  return Math.abs(totalMinutesAlarm - totalMinutesCurrent)
}

function renderDOM(element, outputType, value) {
  element[outputType] = value
  return
}

async function fetchContent(url) {
  const res = await fetch(url)
  return res.json()
}

async function handleSettingsChanges(e) {
  e.preventDefault()

  const userInfoEditing = {
    title: document.getElementById('formaTratamento').value,
    nome: document.getElementById('nome').value,
    city: document.getElementById('city').value,
    unit: document.querySelector('input[name="unit"]:checked').value,
    hideSec: Boolean(document.querySelector('input[name="hideSec"]:checked').value == 'true'),
    is12Hour: Boolean(document.querySelector('input[name="is12Hour"]:checked').value == 'true'),
    useNeutralTheme: document.querySelector('input[name="useNeutralTheme"]:checked').value === 'true',
    defaultRingtone: document.getElementById('defaultRingtone').value,
  }
  console.log('nova informação que vai ser enviada', userInfoEditing)
  try {
    const userId = params.get('user') || localStorage.getItem('userId') || null
    const response = await fetch(`/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfoEditing),
    })

    if (!response.ok) {
      throw new Error(`bad stuff: ${response.status}`)
    }
    const data = await response.json()
    console.log('novo objeto usuario recebido', data)

    backToDashboard()
    location.reload() //horrivel hdashsdhashdhdashds

  } catch (err) {
    console.error('Error:', err)
  }
}

function renderSettingsScreen(user) {
  const settings = document.querySelector('.settings-items')
  settings.innerHTML = ''

  //não é a forma ideal, mas funciona, POR ENQUANTO :)
  //esse select vai ter que ser gerado dinamicamente, ou criar um dicionario para listar
  //esses titles/tratamentos ou um endpoint que retorne eles
  //ao gerar dinamicamente da pra verificar num if qual é o que o usuario tem selecionado
  //e passar o atributo 'selected' pra essa option
  //nao sei pq diabos eu usei um fieldset p cada campo, alguem me mate
  const template = `
    <fieldset>
      <h3 class="title3" >Tratamento</h3>
      <select required id="formaTratamento" name="formaTratamento">
        <option selected disabled>Selecione</option>
        <option value="sr">Sr.</option>
        <option value="sra">Sra.</option>
        <option value="srta">Srta.</option>
        <option value="dr">Dr.</option>
        <option value="dra">Dra.</option>
        <option value="prof">Prof.</option>
        <option value="profa">Profa.</option>
        <option value="presidente">Presidente</option>
        <option value="diretor">Diretor</option>
        <option value="diretora">Diretora</option>
      </select>
    </fieldset>
    <fieldset>
      <h3 class="title3">Seu Nome</h3>
      <input id="nome" type="text" value="${user.nome}" name="nome"/>
    </fieldset>
    <fieldset>
      <h3 class="title3">Cidade ou Região</h3>
      <input id="city" type="text" value="${user.city}" name="city"/>
    </fieldset>
    <fieldset>
      <h3 class="title3" >Unidade Temperatura</h3>
      <div class="segmented-picker">
        <input value="C" id="C" type="radio" name="unit" ${appState.user.unit === 'C' ? 'checked' : ''} />
        <label for="C"><span>Celsius</span></label>

        <input value="F" id="F" type="radio" name="unit" ${appState.user.unit === 'F' ? 'checked' : ''} />
        <label for="F"><span>Fahrenheit</span></label>

        <input value="K" id="K" type="radio" name="unit" ${appState.user.unit === 'K' ? 'checked' : ''} />
        <label for="K"><span>Kelvin</span></label>
      </div>
    </fieldset>
    <fieldset>
      <h3 class="title3">Segundos</h3>
      <div class="segmented-picker">
        <input value="false" id="show" type="radio" name="hideSec"  ${!appState.user.hideSec ? 'checked' : ''} />
        <label for="show"><span>Mostrar</span></label>
        <input value="true" id="hide" type="radio" name="hideSec" ${!!appState.user.hideSec ? 'checked' : ''} />
        <label for="hide"><span>Esconder</span></label>
      </div>
    </fieldset>

    <fieldset>
      <h3 class="title3">Formato Relógio</h3>
      <div class="segmented-picker">
        <input value="true" id="is12hour" type="radio" name="is12Hour" ${!!appState.user.is12Hour ? 'checked' : ''} />
        <label for="is12hour"><span>12 Horas</span></label>
        <input value="false" id="is24hour" type="radio" name="is12Hour" ${!appState.user.is12Hour ? 'checked' : ''} />
        <label for="is24hour"><span>24 Horas</span></label>
      </div>
    </fieldset>

    <fieldset>
      <h3 class="title3">Usar Tema Neutro</h3>
      <div class="segmented-picker">
        <input value="true" id="yes" type="radio" name="useNeutralTheme" ${appState.user.useNeutralTheme ? 'checked' : ''} />
        <label for="yes"><span>Sim</span></label>

        <input value="false" id="no" type="radio" name="useNeutralTheme" ${!appState.user.useNeutralTheme ? 'checked' : ''}/>
        <label for="no"><span>Não</span></label>
      </div>
    </fieldset>
    <fieldset>
      <h3 class="title3">Toque Padrão</h3>
      <select id="defaultRingtone" name="defaultRingtone">
        <option selected disabled value="null">Selecione</option>
        <option value="marimba">Marimba</option>
      </select>
    </fieldset>
  `

  settings.innerHTML = template
}

function renderAlarmListScreen(alarms) {
  const alarmsList = document.querySelector('.alarms-list')
  alarmsList.innerHTML = ''

  alarms.forEach(async ({ id, alarmTime, description, isActive, days, isRepeating, isSnoozeEnabled }) => {
    const alarmCard = document.createElement('li')
    const [h, m, s] = alarmTime.split(':')
    const theme = await getTheme(alarmTime)

    alarmCard.classList.add('settings-card')
    alarmCard.classList.add(theme)

    alarmCard.setAttribute('title', description)
    alarmCard.setAttribute('data-attribute-id', id)

    //como a f printTime é reaproveitada aqui, adicionei nela a checagem pela flag alarmView
    //é o terceiro param, aqui passado true
    alarmCard.innerHTML = `
      <section>
        <span class="alarm-time">
          <date>${printTime({ h, m, s }, false, true)}</date>
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
          ${displayDaysTag(days)}
        </span>
        <span class="alarm-edit-btn" title="Edit alarm">
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
        </span>
      </section>
    `
    alarmsList.appendChild(alarmCard)
  })
}

//não gosto muito da abordagem pq recorre a uma função inline, da pra mudar no futuro, por enquanto funciona
async function handleAlarmStatus({ id, checked }) {
  try {
    const response = await fetch(`/alarm/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isActive: checked,
      }),
    })

    if (!response.ok) {
      throw new Error(`bad stuff: ${response.status}`)
    }
    const data = await response.json()

    appState.updateLocalAlarmData(id, data)
    appState.nextAlarm.isSet = false

  } catch (err) {
    console.error('Error:', err)
    renderAlarmListScreen(appState.user.alarms)
  }
}

function displayDaysTag(days) {
  let outputTags; const tags = []

  Object.keys(days).forEach(day => {
    if (days[day]) tags.push(day)
  })

  if (tags.length <= 0) { //essa opção não deve existir. precisa assegurar no codigo de cadastro de cada alarme que ele so pode ser salvo com pelo menos um dia valido atribuido
    outputTags = `<span class="tag-day">No Days</span>`
  }
  else
    if (tags.length === 7) {
      outputTags = `<span class="tag-day">Everyday</span>`
    }
    else {
      outputTags = tags.map(day => `<span class="tag-day">${day}</span>`).join('')
    }

  return outputTags
}


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
<svg viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
  <g id="SVGRepo_iconCarrier">
    <path d="M3 21.32L21 3.32001" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    </path> 
    <path d="M3 3.32001L21 21.32" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    </path> 
  </g>
</svg>
`

function devMode(activate) {
  const allDOMNodes = Array.from(document.body.getElementsByTagName('*'))
  if (activate) allDOMNodes.forEach(node => node.classList.add('dev__mode'))
  else
    allDOMNodes.forEach(node => node.classList.remove('dev__mode'))
}