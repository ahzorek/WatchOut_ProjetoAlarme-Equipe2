import AlarmRepository from "../repositories/AlarmRepository.js"

class Alarm {

  //list all
  index(req, res) {
    const alarms = AlarmRepository.findAll()
    res.status(200).json(alarms)
  }

  //find by id
  show(req, res) {
    const alarm = AlarmRepository.findById(req.params.id)
    res.status(200).json(alarm)
  }

  //save new
  store(req, res) {
    AlarmRepository.create({}) // definir objeto aqui
    res.status(201).send("Alarme cadastrado com sucesso")
  }

  //update
  update(req, res) {
    const alarm = AlarmRepository.update(req.params.id, req.body)
    res.status(200).json(alarm)
  }

  //delete
  delete(req, res) {
    AlarmRepository.delete(req.params.id)
    res.status(200).send(`Alarme ${req.params.id} excluído com sucesso!`)
  }
}

//padrao Singleton (Design Patterns)
export default new Alarm