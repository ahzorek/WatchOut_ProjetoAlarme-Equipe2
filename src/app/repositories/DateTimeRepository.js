class DateTimeRepository {
  getTime() {
    return getHoraCerta()
  }
}

function getHoraCerta() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()

  return `${formatOutput(h)}:${formatOutput(m)}:${formatOutput(s)}`
}

function formatOutput(num) {
  return String(num).padStart(2, '0')
}

export default new DateTimeRepository()