import { nanoid } from 'nanoid'
import { getAlarmById, getAlarmIndexById, getAlarms } from "../db/conexao.js"

class AlarmRepository {

  //CRUD
  //C for CREATE
  create(data) {

  }

  //R for READ
  findAll() {
    return getAlarms()
  }

  //R
  findById(id) {
    return getAlarmById(id)
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