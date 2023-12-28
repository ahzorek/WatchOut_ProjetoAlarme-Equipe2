import UserRepository from "../repositories/UserRepository.js"

class UserController {

  //list all
  index(req, res) {
    const users = UserRepository.findAll()
    if (!users) {
      res.status(404).json({ message: 'no users were found' })
      return
    }
    else {
      const safeUsers = users.map(user => {
        return ({
          id: user.id,
          data: user.data
        })
      })
      res.status(200).json({ data: safeUsers })
    }
  }

  //find by id
  show(req, res) {
    const user = UserRepository.findById(req.params.id)
    if (!user) { res.status(404).json({ message: 'user not found' }) }
    else
      res.status(200).json({
        id: user.id,
        data: user.data
      })
  }

  //basic auth user
  auth(req, res) {
    const { username, password } = req.body
    if (!username || !password) {
      res.status(406).json({ message: 'missing data, check it again' })
      return
    }
    const user = UserRepository.findByUsername(username)
    if (!user) {
      res.status(418).json({ message: 'username does not match' })
      return
    }
    else if (user.credentials.password === password) {
      res.status(200).json({ message: 'success', id: user.id })
    }
    else
      res.status(401).json({ message: 'password doest not match' })
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
      const userCreated = UserRepository.create(req.body)

      res.status(201).json({
        message: "user successfully created",
        userCreated
      })
    }
  }

  //delete
  delete(req, res) {
    UserRepository.delete(req.params.id)
    res.status(200).json(
      { message: `user with id ${req.params.id} successfuly deleted.` }
    )
  }
}

export default new UserController