import WeatherRepository from "../repositories/WeatherRepository.js"

class Weather {
  async show(req, res) {
    if (!req.query.city) { res.status(418).json({ message: 'not good my man' }) }
    else {
      const weather = await WeatherRepository.findByCity(req.query.city)
      console.log(weather)
      res.status(200).json(weather)
    }
  }
}

export default new Weather