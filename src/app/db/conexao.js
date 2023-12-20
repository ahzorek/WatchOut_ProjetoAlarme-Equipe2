import { nanoid } from 'nanoid'

//db connection
//alarms
function getAlarmById(id) {
  return alarms.find(alarm => alarm.id == id)
}

function getAlarmIndexById(id) {
  return alarms.findIndex(alarm => alarm.id == id)
}

function getAlarms() {
  return alarms
}

//users
function addUser(newUser) {
  const id = nanoid(8)
  users.push({ id, ...newUser })
  // console.log("USERS DB IS::", users)

  return users.find(user => user.id == id)
}

function getUserById(id) {
  return users.find(user => user.id == id)
}

function getUserByUsername(username) {
  return users.find(user => user.username === username)
}

function getUserIndexById(id) {
  return users.findIndex(user => user.id == id)
}

function getUsers() {
  return users
}

export {
  getAlarmById,
  getAlarmIndexById,
  getAlarms,
  getUserById,
  getUserByUsername,
  getUserIndexById,
  getUsers,
  addUser
}

//mock db
const alarms = [
  {
    id: 'N1EMTNpZ',
    description: 'Reunião de SCRUM',
    ringtone: 'Marimba',
    isActive: true,
    isRepeating: false,
    repeat: { sun: null, mon: true, tue: null, wed: null, thu: null, sex: null, sat: null },
    isSnoozeEnabled: false,
    alarmTime: '08:30'
  },
]

const users = [
  {
    id: 'lzFc5iul',
    username: "adalove",
    password: "lovelace456",
    nome: "Ada Lovelace",
    city: 'London',
    unit: 'celsius',
    is24Hour: false,
    gender: 'F',
    title: 'Ms.',
    alarms: ["N1EMTNpZ"]
  },
  {
    id: '5H4fLoeB',
    username: "tim",
    password: "cernwww404",
    nome: "Tim Berners Lee",
    city: 'London',
    unit: 'celsius',
    is24Hour: false,
    gender: 'M',
    title: 'Sir.',
    alarms: []
  },
]