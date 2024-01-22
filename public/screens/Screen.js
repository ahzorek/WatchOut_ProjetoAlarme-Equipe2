import IosSelector from '../utils/timePicker.js'
import { convertTimeTo12Hour } from '../utils/convertTime.js'

class Screen {
  constructor(app) {
    this.app = app
    this.loading = true
    this.swapHour = null
    this.swapMin = null
    this.swapSuffix = null
  }

  delete() {
    this.container.remove()
  }

  addErrorWarning(target) {
    target.classList.add('error')
    target.focus()
    setTimeout(() => {
      target.classList.remove('error')
    }, 1000)
  }

  activate() {
    this.container.classList.add('active')
    if (this.loading) this.loadData()
    console.log('rendering:', this.app.currentScreen)

  }

  refresh() {
    this.container.innerHTML = ''
    this.container.innerHTML = `<div class="loading-spinner"></div>`
    this.loading = true
    if (this.loading) this.loadData()
  }

  deactivate() {
    this.container.classList.remove('active')
    this.container.addEventListener('transitionend', (e) => {
      if (this.container.classList.contains('dashboard-screen')) {
        return
      }
      if (e.target.classList.contains('screen') && !e.target.classList.contains('active')) {
        this.container.innerHTML = ''
        this.loading = true
        this.render()
      }
      if (this.container.classList.contains('edit-screen')) {
        this.delete()
      }
    })
  }

  verifyDataConsistency(data, op) {
    const hasValidDays = () => {
      if (data.days == undefined && op == 'create') {
        return false
      }
      else if (data.days != undefined) {
        return Object.values(data.days).some(day => {
          if (day) return true
          else
            return false
        })
      } else return true
    }

    const hasValidDescription = () => {
      if (op === 'create') {
        //console.log('got in on CREATE')
        return (data.description !== undefined) && (data.description !== '') && (data.description.length > 2)
      }
      else if (op === 'edit') {
        //console.log('got in on EDIT')
        return (data.description == null) || ((data.description !== '') && data.description.length > 2)
      }
    }

    if (!hasValidDescription() && !hasValidDays()) {
      this.addErrorWarning(this.descrField)
      this.addErrorWarning(this.daysField)
      return false
    }
    else if (!hasValidDescription()) {
      this.addErrorWarning(this.descrField)
      return false
    }
    else if (!hasValidDays()) {
      this.addErrorWarning(this.daysField)
      return false
    }
    else {
      console.log('ok, data is solid, ready to send:', data)
      return true
    }
  }

  createIosSelectors(time, is12Hour) {
    let hours, hour, [h, min] = time.split(':')

    if (is12Hour) {
      hours = new Array(12).fill(0).map((v, i) => {
        return { value: i + 1, text: i + 1 }
      })
      hour = convertTimeTo12Hour(h)
    } else {
      hours = new Array(24).fill(0).map((v, i) => {
        return { value: i, text: i }
      })
      hour = h
    }

    const minutes = new Array(60).fill(0).map((v, i) => {
      return { value: i, text: i }
    })

    const suffix = [{ value: false, text: 'AM' }, { value: true, text: 'PM' }]

    new IosSelector({
      el: '#hour',
      type: 'infinite',
      source: hours,
      count: 15,
      value: +hour,
      onChange: (selected) => {
        this.swapHour = +hour
        if (selected.value != hour) {
          this.alarmTime.h = selected.value
          this.alarmTime.m = this.swapMin
          this.alarmTime.isPM = this.swapSuffix
          this.createAlarmTimeObject(this.alarmTime, is12Hour)
        }
      }
    })

    new IosSelector({
      el: '#minute',
      type: 'infinite',
      source: minutes,
      count: 15,
      value: +min,
      onChange: (selected) => {
        this.swapMin = +min
        if (selected.value != min) {
          this.alarmTime.h = this.swapHour
          this.alarmTime.m = selected.value
          this.alarmTime.isPM = this.swapSuffix
          this.createAlarmTimeObject(this.alarmTime, is12Hour)
        }
      }
    })

    if (is12Hour) {
      const suffixOriginalValue = (+h >= 12)
      new IosSelector({
        el: '#suffix',
        type: 'normal',
        source: suffix,
        count: 15,
        value: suffixOriginalValue,
        onChange: (selected) => {
          this.swapSuffix = suffixOriginalValue
          if (selected.value != suffixOriginalValue) {
            this.alarmTime.h = this.swapHour
            this.alarmTime.m = this.swapMin
            this.alarmTime.isPM = selected.value
            this.createAlarmTimeObject(this.alarmTime, is12Hour)
          }
        }
      })
    }
  }
}

export default Screen