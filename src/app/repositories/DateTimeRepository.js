class DateTimeRepository {
  getTime() {
    return getHoraCerta()
  }

  getDate(req) {
    return getHoje(req)
  }

  getMessage() {
    return getMensagem()
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

  return formatedDate
}

function getMensagem() {
  const user = "Frcn"
  let horarioCompleto = getHoraCerta()
  let hora = getHoraCerta().split(':')[0]

  let msg = 'Boa noite'

  if (hora >= 6 && hora < 12) {
    msg = "Bom dia"
  } else if (hora >= 12 && hora < 18) {
    msg = "Boa tarde"
  }

  return `${msg}, ${user}. agora são ${horarioCompleto}`
}

export default new DateTimeRepository()