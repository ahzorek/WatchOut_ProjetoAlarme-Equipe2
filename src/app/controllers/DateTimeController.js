import DateTimeRepository from "../repositories/DateTimeRepository.js"

class DateTime {

  showTime(req, res) {
    const currentTime = DateTimeRepository.getTime()
    res.status(200).json({ horaCerta: currentTime })
  }

  showDate(req, res) {
    const currentDate = DateTimeRepository.getDate(req)
    res.status(200).json({ hoje: currentDate })
  }

  showMessage(req, res) {
    const message = DateTimeRepository.getMessage(req.query.id)
    res.status(200).json({ mensagem: message })
  }

  showTheme(req, res) {
    const theme = DateTimeRepository.getTheme(req.query.hour)
    res.status(200).json({ tema: theme })
  }
}

export default new DateTime