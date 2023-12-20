import { getUserByUsername, getUserById, getUserIndexById, getUsers, addUser } from "../db/conexao.js"

class UserRepository {

  //CRUD
  create(user) {
    return addUser(user)
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
    const prevData = users[userIndex]

    users[userIndex] = {
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