const convertTimeTo12Hour = (h) => {
  console.log('converting to 12 HOUR::', h)
  if (h == 0) {
    return 12
  } else {
    const hour = h > 12 ? (h - 12) : +h
    return hour
  }
}

function convertTimeFrom12Hour(hour, isPM) {
  if (isPM && hour !== 12) {
    hour += 12;
  } else if (!isPM && hour === 12) {
    hour = 0;
  }
  return hour;
}

export { convertTimeTo12Hour, convertTimeFrom12Hour }