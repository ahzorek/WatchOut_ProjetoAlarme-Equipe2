class DateTimeRepository {
  getTime() {
    return getHoraCerta()
  }

  getDate(req) {
    return getHoje(req)
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

function getHoje(req) {
  const languages = req.headers["accept-language"]
  const preferedLanguage = languages ? languages.split(',')[0] : 'pt-BR'
  const now = new Date()

  const formatedDate = new Intl.DateTimeFormat(preferedLanguage, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(now)

  console.log(typeof (formatedDate))

  return formatedDate
}

export default new DateTimeRepository()