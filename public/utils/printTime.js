import formatTime from "./formatTime.js"

import { convertTimeTo12Hour } from "./convertTime.js"

const printTime = ({ h, m, s }, is12Hour, hideSec = true) => {
  // se o relógio for de 12h E se for depois das 12h, então hora = h - 12, se não hora = h
  const hour = is12Hour ? convertTimeTo12Hour(h) : +h
  const suffix = is12Hour && h >= 12 ? 'PM' : 'AM'
  const suffixWrapper = `<span class="time-format-suffix">${suffix}</span>`

  if (hideSec) {
    return `${hour}:${formatTime(m)}${is12Hour ? suffixWrapper : ''}`

  } else {
    return `${hour}:${formatTime(m)}:${formatTime(s)}${is12Hour ? suffixWrapper : ''}`
  }
}

export default printTime