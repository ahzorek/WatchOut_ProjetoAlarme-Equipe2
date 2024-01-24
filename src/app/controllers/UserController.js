import UserRepository from "../repositories/UserRepository.js"

class UserController {

  //list all
  index(req, res) {
    const users = UserRepository.findAll()
    if (!users) {
      res.status(404).json({ message: 'nenhum usuário foi encontrado' })
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
    if (!user) { res.status(404).json({ message: 'usuário não encontrado' }) }
    else
      res.status(200).json({
        id: user.id,
        data: user.data
      })
  }

  //basic auth user
  auth(req, res) {
    console.log(req.headers)
    const { username, password } = req.body
    if (!username || !password) {
      res.status(406).json({ message: 'usuário ou senha incorretos' })
      return
    }
    const user = UserRepository.findByUsername(username)
    if (!user) {
      res.status(418).json({ message: 'usuário incorreto' })
      return
    }
    else if (user.credentials.password !== password) {
      res.status(401).json({ message: 'senha incorreta, essa senha pertence à AndreZorek44' })
    }
    else
      res.status(200).json({ message: 'success', id: user.id, redirect: '/dashboard' })
  }

  //save new
  store(req, res) {
    const usernameExists = UserRepository.findByUsername(req.body.username)
    if (usernameExists) {
      res.status(418).json({ message: 'usuário já existente' })
      return
    }

    const { username, password, nome = null, city, unit, is24Hour, title } = req.body
    if (!username || !password || !city || !unit || !title) {
      res.status(406).json({ message: 'dados inválidos, tente novamente' })
      return
    }
    else {
      const userCreated = UserRepository.create(req.body)

      res.status(201).json({
        message: "usuário criado com sucesso",
        userCreated
      })
    }
  }

  update(req, res) {
    const userUpdated = UserRepository.update(req.params.id, req.body)

    res.status(200).json({
      message: "usuário atualizado com sucesso",
      user: userUpdated.data
    })
  }

  insert(req, res) {
    const { id } = req.params
    const { alarmId } = req.body
    const userWithNewAlarm = UserRepository.insertAlarm(id, alarmId)

    res.status(200).json({
      message: "usuário atualizado com sucesso",
      user: userWithNewAlarm
    })
  }

  patch(req, res) {
    const { id } = req.params
    const { attribute, data } = req.body
    const userUpdated = UserRepository.updateAttribute(id, attribute, data)

    res.status(200).json({
      message: "usuário atualizado com sucesso",
      user: userUpdated
    })
  }

  //delete
  delete(req, res) {
    UserRepository.delete(req.params.id)
    res.status(200).json(
      { message: `o usuário com o id: ${req.params.id} foi deletado com sucesso.` }
    )
  }
}

export default new UserController