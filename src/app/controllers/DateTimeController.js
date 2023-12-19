import DateTimeRepository from "../repositories/DateTimeRepository.js"

class DateTime {
  showTime(req, res) {
    const currentTime = DateTimeRepository.getTime()
    res.status(200).json({ horaCerta: currentTime })
  }
}

export default new DateTime