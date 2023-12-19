import WeatherRepository from "../repositories/WeatherRepository.js"

class Weather {
  async show(req, res) {
    if (!req.query.city) res.status(418).send('not good my man')

    const weather = await WeatherRepository.findByCity(req.query.city)
    res.status(200).json(weather)
  }
}

export default new Weather