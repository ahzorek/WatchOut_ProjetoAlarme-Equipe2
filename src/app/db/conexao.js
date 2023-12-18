//mock db
const alarms = [
  {
    id: 'N1EMTNpZ',
    description: '',
    ringtone: '',
    repeat: [
      '',
      '',
    ],

  },
]

//db connection

function getAlarmById(id) {
  return users.find(user => user.id == id)
}

function getAlarmIndexById(id) {
  return alarms.findIndex(alarm => alarm.id == id)
}

function getAlarms() {
  return alarms
}

export { getAlarmById, getAlarmIndexById, getAlarms }