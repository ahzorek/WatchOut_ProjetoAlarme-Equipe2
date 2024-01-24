const convertTimeTo12Hour = (h) => {
  console.log('converting to 12 HOUR::', h)
  if (h == 0) {
    return 12
  } else {
    const hour = h > 12 ? (h - 12) : +h
    return hour
  }
}

const convertTimeFrom12Hour = (h, isPM) => {
  console.log('converting from 12 HOUR::', h, 'isPM is::', isPM)
  if (!isPM) return +h

  if ((h === 12 && !isPM) || (h + 12 === 24)) {
    return 0
  }
  else {
    return h + 12
  }
}

export { convertTimeTo12Hour, convertTimeFrom12Hour }