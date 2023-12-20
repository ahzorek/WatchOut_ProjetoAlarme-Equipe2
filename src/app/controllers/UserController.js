import UserRepository from "../repositories/UserRepository.js"

class UserController {

  //list all
  index(req, res) {
    const users = UserRepository.findAll()
    if (!users) {
      res.status(404).json({ message: 'no users were found' })
      return
    }
    else
      res.status(200).json({ data: users })
  }

  //find by id
  show(req, res) {
    const user = UserRepository.findById(req.params.id)
    if (!user) { res.status(404).json({ message: 'user not found' }) }
    else
      res.status(200).json(user)
  }

  //save new
  store(req, res) {
    const usernameExists = UserRepository.findByUsername(req.body.username)
    if (usernameExists) {
      res.status(418).json({ message: 'username already exists' })
      return
    }

    const { username, password, nome = null, city, unit, is24Hour, title } = req.body
    if (!username || !password || !city || !unit || !title) {
      res.status(406).json({ message: 'missing data, check it again' })
      return
    }
    else {
      const newUser = UserRepository.create({
        username,
        password,
        nome: nome || username,
        city,
        unit,
        is24Hour: is24Hour || false,
        title,
        alarms: []
      })

      res.status(201).json({
        message: "user successfully created",
        newUser
      })
    }
  }

  //delete
  delete(req, res) {
    UserRepository.delete(req.params.id)
    res.status(200).json({ message: `user with id ${req.params.id} successfuly deleted.` })
  }
}

export default new UserController