function compareTimeObjects(currTime, alarmTime) {
  // console.log('comparing time to alarm', currTime, alarmTime)
  return JSON.stringify(currTime) === JSON.stringify(alarmTime)
}

export default compareTimeObjects