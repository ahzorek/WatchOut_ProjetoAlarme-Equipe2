import calculateTimeDifference from '../utils/calculateTimeDiff.js'

import splitTimeString from '../utils/splitTimeString.js'

class AlarmHandler {
  constructor(app, container) {
    this.app = app
    this.container = container
    this.alarmDialog = null
    this.ringtone = null
    this.source = null
    this.isPlaying = false

  }

  defineNextAlarm(timeNow, alarms, excludeId) {
    console.log('defineNextAlarm recebeu::', timeNow, alarms, excludeId)
    if (alarms == undefined) {
      setTimeout(() => {
        console.log('not the first call i guess')
        this.defineNextAlarm(timeNow, alarms)
      }, 1000)
    }

    const { h, m } = timeNow

    const activeAlarms = alarms.filter(alarm => {
      const [_h, _m] = alarm.alarmTime.split(':')

      return (
        alarm.id !== excludeId && //exclui alarme que acabou de disparar(se for passado como terceiro param) 
        alarm.isActive && // exclui alarmes com o atributo isActive = false
        alarm.days[this.app.getWeekdayString()] && // exclui alarmes que não são válidos **hoje**
        ((+_h > h) || (+_h === h && +_m >= m)) // exclui alarmes validos **hoje** cujo horario ja passou
      )
    })

    if (activeAlarms.length === 0) {
      this.app.state.nextAlarm = false
      return
    }

    const orderedAlarms = activeAlarms.sort((a, b) => {
      const timeDifferenceA = calculateTimeDifference(a.alarmTime, h, m)
      const timeDifferenceB = calculateTimeDifference(b.alarmTime, h, m)

      return timeDifferenceA - timeDifferenceB
    })

    const [nextAlarm] = orderedAlarms

    this.app.state.nextAlarm = {
      ...nextAlarm,
      timeObj: splitTimeString(nextAlarm.alarmTime)
    }

    if (!this.isPlaying) {
      this.preloadRingtone(this.app.state.nextAlarm)
    }

    console.log('next valid alarm is::', this.app.state.nextAlarm)
  }

  createAlarmDialog() {
    this.alarmDialog = document.createElement('div')
    this.alarmDialog.classList.add('alarm', 'dialog')
    this.alarmDialog.id = 'alarm-box'

    this.container.appendChild(this.alarmDialog)
  }

  createActiveAlarmDialog(alarm) {
    const h2Element = document.createElement('h2')
    h2Element.className = 'box-title'
    h2Element.textContent = 'Alarm'

    const pElement = document.createElement('p')
    pElement.className = 'alarm-description'
    pElement.textContent = "It's time for "

    const spanElement = document.createElement('span')
    spanElement.className = 'alarm-title'
    spanElement.textContent = alarm.description

    pElement.appendChild(spanElement)

    const messageDiv = document.createElement('div')
    messageDiv.className = 'message'
    messageDiv.appendChild(pElement)

    const turnOffButton = document.createElement('button')
    turnOffButton.className = 'btn primary-btn'
    turnOffButton.id = 'btn-turnOff'
    turnOffButton.textContent = 'Turn Alarm Off'
    turnOffButton.addEventListener('click', () => {
      this.turnOffAlarm()
    })

    const btnWrapperDiv = document.createElement('div')
    btnWrapperDiv.className = 'btn-wrapper'
    btnWrapperDiv.appendChild(turnOffButton)

    this.alarmDialog.appendChild(h2Element)
    this.alarmDialog.appendChild(messageDiv)
    this.alarmDialog.appendChild(btnWrapperDiv)
  }

  startAlarm(alarm) {
    this.createActiveAlarmDialog(alarm)
    this.alarmDialog.classList.add('active')
    this.playRingtone()
  }

  turnOffAlarm() {
    this.stopRingtone(this.source)
    this.alarmDialog.classList.remove('active')
    this.alarmDialog.innerHTML = ''
  }

  async preloadRingtone(alarm) {
    console.log('preload ringtone recebeu:', alarm)
  
    const { jamendoRingtone } = alarm; // Use jamendoRingtone property
    try {
      const response = await fetch(jamendoRingtone); // Use jamendoRingtone URL
      const data = await response.arrayBuffer();
  
      const buffer = await this.app.audioContext.decodeAudioData(data);
      this.ringtoneBuffer = buffer;
  
      this.ringtone = true;
    } catch (error) {
      console.error('Error loading audio file:', error);
      this.ringtone = false;
    }
  }

  playRingtone() {
    if (!this.ringtone) {
      console.log('error aqui::::', this.ringtone)
      return
    }

    this.source = this.app.audioContext.createBufferSource()
    this.source.buffer = this.ringtoneBuffer
    this.source.connect(this.app.audioContext.destination)

    console.log('buffer criado', this.source.buffer)

    this.source.onended = () => {
      if (this.isPlaying) {
        this.source = null
        this.playRingtone()
      }
    }
    this.isPlaying = true
    this.source.start()
  }

  stopRingtone() {
    if (this.isPlaying && this.source) {
      if (this.app.audioContext.state === 'running') {
        this.source.stop()
      }
      this.isPlaying = false
    }
    this.preloadRingtone(this.app.state.nextAlarm)
  }
}

export default AlarmHandler