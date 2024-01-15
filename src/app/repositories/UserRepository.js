import { getUserByUsername, getUserById, getUserIndexById, getUsers, addUser } from "../db/conexao.js"

class UserRepository {

  create({ username, password, nome = null, city, unit, is24Hour, title }) {
    return addUser({
      credentials: {
        username,
        password,
      },
      data: {
        username,
        nome: nome || username,
        city,
        unit,
        is24Hour: is24Hour || true,
        title,
        alarms: [],
        settings: {
          overrideLang: null,
          hideSec: true,
          useNeutralTheme: false
        }
      },
    })
  }

  findAll() {
    return getUsers()
  }

  findById(id) {
    return getUserById(id)
  }

  findByUsername(username) {
    return getUserByUsername(username)
  }

  update(id, newData) {
    const userIndex = getUserIndexById(id)
    const users = getUsers()
    const prevData = users[userIndex].data

    users[userIndex].data = {
      ...prevData,
      ...newData
    }
    return users[userIndex]
  }

  delete(id) {
    const userIndex = getUserIndexById(id)
    getUsers().splice(userIndex, 1)
  }
}

export default new UserRepository()