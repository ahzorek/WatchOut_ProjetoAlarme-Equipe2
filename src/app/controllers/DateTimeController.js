import DateTimeRepository from "../repositories/DateTimeRepository.js"

class DateTime {

  showTime(req, res) {
    const currentTime = DateTimeRepository.getTime()
    res.status(200).json({ horaCerta: currentTime })
  }

  showDate(req, res) {
    const currentDate = DateTimeRepository.getDate()
    res.status(200).json({ hoje: currentDate })
  }
}

export default new DateTime