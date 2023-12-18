import Alarm from "../repositories/AlarmRepository.js"

class Alarm {

  //list all
  index(req, res) {
    const alarms = Alarm.findAll()
    res.status(200).json(alarms)
  }

  //find by id
  show(req, res) {
    const alarm = Alarm.findById(req.params.id)
    res.status(200).json(alarm)
  }

  //save new
  store(req, res) {
    Alarm.create({}) // definir objeto aqui
    res.status(201).send("Alarme cadastrado com sucesso")
  }

  //update
  update(req, res) {
    const alarm = Alarm.update(req.params.id, req.body)
    res.status(200).json(alarm)
  }

  //delete
  delete(req, res) {
    Alarm.delete(req.params.id)
    res.status(200).send(`Alarme ${req.params.id} excluído com sucesso!`)
  }
}

//padrao Singleton (Design Patterns)
export default new Alarm