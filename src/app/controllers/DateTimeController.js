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
    const message = DateTimeRepository.getMessage()
    res.status(200).json({ mensagem: message})
  }
}

export default new DateTime