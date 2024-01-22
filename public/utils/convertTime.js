const convertTimeTo12Hour = (h) => {
  const hour = h > 12 ? (h - 12) : +h
  return hour
}

const convertTimeFrom12Hour = (h, isPM) => {
  if (!isPM) return +h

  if ((h === 12 && !isPM) || (h + 12 === 24)) {
    return 0
  }
  else {
    return h + 12
  }
}

export { convertTimeTo12Hour, convertTimeFrom12Hour }