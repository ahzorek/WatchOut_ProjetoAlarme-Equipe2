import { getUserById } from "../db/conexao.js"

class DateTimeRepository {
  getTime() {
    return getHoraCerta()
  }

  getDate(req) {
    return getHoje(req)
  }

  getMessage(id) {
    return getMensagem(id)
  }

  getTheme() {
    return defineTheme()
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

  const formattedDate = new Intl.DateTimeFormat(preferedLanguage, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(now)

  return formattedDate
}

function getMensagem(userId = false) {
  let user, msg, greeting
  try {
    if (!userId) throw new Error('received no userId')
    else {
      const { data: { nome, title } } = getUserById(userId)
      user = nome
      greeting = title
    }
  }
  catch (err) {
    console.error('PQP', err)
    user = 'Cine'
    greeting = 'Sra.'
  }

  const horarioCompleto = getHoraCerta()
  const [hora] = horarioCompleto.split(':')

  if (hora >= 6 && hora < 12) {
    msg = "Bom dia"
  }
  else if (hora >= 12 && hora < 18) {
    msg = "Boa tarde"
  }
  else
    msg = "Boa noite"

  return `${msg}, ${greeting} ${user}`
}

function defineTheme() {
  let theme
  const horarioCompleto = getHoraCerta()
  const [hora] = horarioCompleto.split(':')

  if (hora >= 6 && hora < 12) {
    theme = "sunrise-theme"
  }
  else if (hora >= 12 && hora < 18) {
    theme = "noon-theme"
  }
  else if (hora >= 18 && hora < 22) {
    theme = "afternoon-theme"
  }
  else
    theme = "night-theme"

  return theme
}

export default new DateTimeRepository()