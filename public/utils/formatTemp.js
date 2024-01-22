const formatTemperature = (celsius, out) => {
  //console.log('receiving:', celsius, 'to out as:', out)

  if (out !== 'C') {
    let temp_celsius = +celsius
    if (temp_celsius < -273.15) temp_celsius = -273.15

    const kelvin = (temp_celsius + 273.15)
    const fahrenheit = ((9 * temp_celsius + 160) / 5)

    if (out === 'F') {
      return fahrenheit + 'º F'
    }
    else if (out === 'K') {
      return ~~kelvin + 'K'
    }
  }
  else
    return celsius + 'º C'
}

export default formatTemperature