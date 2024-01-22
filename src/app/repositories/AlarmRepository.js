import { getAlarmById, getAlarmIndexById, getAlarms, getAlarmsByUserRefId, addAlarm } from "../db/conexao.js"

const defaultAlarmObject = {
  description: 'Alarme',
  ringtone: 'marimba',
  isActive: true,
  isRepeating: false,
  days: { sun: true, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true },
  alarmTime: '12:00:00'
}

class AlarmRepository {

  //CRUD
  //C for CREATE

  create(data) {
    return addAlarm({
      ...defaultAlarmObject,
      ...data
    })
  }

  //R for READ
  findAll() {
    return getAlarms()
  }

  //R
  findById(id) {
    return getAlarmById(id)
  }

  findByUserId(id) {
    return getAlarmsByUserRefId(id)
  }

  toggle(id) {
    const switchToggleAlarm = getAlarmById(id)
    switchToggleAlarm.isActive = !switchToggleAlarm.isActive

    return switchToggleAlarm
  }

  //U for UPDATE
  update(id, newData) {
    const alarmIndex = getAlarmIndexById(id)
    const alarm = getAlarms()
    const prevData = alarm[alarmIndex]

    alarm[alarmIndex] = {
      ...prevData,
      ...newData
    }

    return alarm[alarmIndex]
  }

  //D for DELETE
  delete(id) {
    const alarmIndex = getAlarmIndexById(id)
    getAlarms().splice(alarmIndex, 1)
  }
}

export default new AlarmRepository()