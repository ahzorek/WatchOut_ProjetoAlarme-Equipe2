import 'dotenv/config'

class ServicesRepository {
  async findBySubString(string) {
    try {
      const api = `https://api.mapbox.com/geocoding/v5/mapbox.places/${string}.json?types=place&access_token=`

      const key = process.env.MAPBOX_API_TOKEN
      const response = await fetch(api + key)

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`)
      }

      const { features } = await response.json()
      const [first_result] = features

      if (!first_result) {
        throw new Error('No results found in Mapbox API response.')
      }

      return {
        city: first_result.text,
        full_name: first_result.place_name,
      }
    } catch (error) {
      console.error('Error in findBySubString:', error.message);
      throw new Error('Error in findBySubString: Unable to fetch data.')
    }
  }

  async findWoeid(city) {
    try {
      const api = `https://api.hgbrasil.com/stats/find_woeid?key=17284dd0&format=json-cors&sdk_version=console&city_name=`

      const response = await fetch(api + city)

      if (!response.ok) {
        throw new Error(`Failed to fetch data from HG Brasil API. Status: ${res.status}`)

      }
      const { woeid, error } = await response.json()

      if (!woeid) {
        if (error === 'Limite de consultas atingido.') {
          throw new Error('Limite de consultas atingido.')
        } else
          throw new Error('No WOEID found.')
      }

      return woeid

    } catch (error) {
      console.error(error)
      throw new Error(error.message)
    }
  }
}

export default new ServicesRepository()
