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
    if (!req.body.refUserId) res.status(406).json({ message: 'missing data, check it again' })

    const alarmCreated = AlarmRepository.create(req.body)
    res.status(201).json({
      message: "Alarme cadastrado com sucesso",
      alarmId: alarmCreated.id,
      data: alarmCreated
    })
  }

  //update
  update(req, res) {
    const alarm = AlarmRepository.update(req.params.id, req.body)
    res.status(200).json(alarm)
  }

  //update
  patch(req, res) {
    const alarm = AlarmRepository.toggle(req.params.id)
    console.log(alarm)
    res.status(200).json({ message: 'Alteração bem sucedida!', alarm })
  }

  //delete
  delete(req, res) {
    AlarmRepository.delete(req.params.id)
    res.status(200).send(`Alarme ${req.params.id} excluído com sucesso!`)
  }
}

//padrao Singleton (Design Patterns)
export default new Alarm