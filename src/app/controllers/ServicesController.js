import ServicesRepository from "../repositories/ServicesRepository.js"

class Services {
  async complete(req, res) {
    try {
      const city = await ServicesRepository.findBySubString(req.query.str)
      res.status(200).json(city)
    } catch (error) {
      console.error('Error in complete:', error.message)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async woeid(req, res) {
    try {
      const woeidObj = await ServicesRepository.findWoeid(req.query.city)
      res.status(200).json(woeidObj)

    } catch (error) {

      if (error.message === 'Limite de consultas atingido.') {
        res.status(429).json({ error: error.message })
      } else
        res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}

export default new Services()
