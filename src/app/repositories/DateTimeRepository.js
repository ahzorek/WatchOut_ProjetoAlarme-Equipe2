class DateTimeRepository {
  getTime() {
    return getHoraCerta()
  }

  getDate() {
    return getHoje()
  }
}

function getHoraCerta() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()

  return `${formatTwoDigits(h)}:${formatTwoDigits(m)}:${formatTwoDigits(s)}`
}

function formatTwoDigits(num) {
  return String(num).padStart(2, '0')
}

function getHoje() {
  const now = new Date()

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
  }).format(now)
}

export default new DateTimeRepository()