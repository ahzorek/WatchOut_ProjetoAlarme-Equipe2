import { nanoid } from 'nanoid'

//db connection
//alarms
function getAlarmById(id) {
  return alarms.find(alarm => alarm.id == id)
}

function getAlarmIndexById(id) {
  return alarms.findIndex(alarm => alarm.id == id)
}

function getAlarmsByUserRefId(id) {
  return alarms.find(alarm => alarm.refUserId === id)
}

function getAlarms() {
  return alarms
}

function addAlarm(newAlarm) {
  const id = nanoid(10)
  alarms.push({ id, ...newAlarm })
  return alarms.find(alarm => alarm.id == id)
}

//users
function addUser(newUser) {
  const id = nanoid(8)
  users.push({ id, ...newUser })
  return users.find(user => user.id == id)
}

function getUserById(id) {
  return users.find(user => user.id == id)
}

function getUserByUsername(username) {
  return users.find(user => user.credentials.username === username)
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
  getAlarmsByUserRefId,
  addAlarm,
  getUserById,
  getUserByUsername,
  getUserIndexById,
  getUsers,
  addUser
}

//mock db
import alarms from './alarms.db.js'
import users from './users.db.js'