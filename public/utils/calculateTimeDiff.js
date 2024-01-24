function calculateTimeDifference(alarmTime, currentHour, currentMinute) {
  const [alarmHour, alarmMinute] = alarmTime.split(':')
  const totalMinutesAlarm = +alarmHour * 60 + +alarmMinute
  const totalMinutesCurrent = currentHour * 60 + currentMinute

  // calcula a diferença em minutos
  // console.log(totalMinutesAlarm, totalMinutesCurrent, (totalMinutesAlarm - totalMinutesCurrent))

  return Math.abs(totalMinutesAlarm - totalMinutesCurrent)
}

export default calculateTimeDifference