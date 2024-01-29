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

  getTheme(hour) {
    return defineTheme(hour)
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
  const preferedLanguage = 'pt-BR'
  const now = new Date()

  const formattedDate = new Intl.DateTimeFormat(preferedLanguage, {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now)

  const [dayOfWeek, restOfDate] = formattedDate.split('.,')

  return `${dayOfWeek},${restOfDate}`
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
    user = 'Usuário'
    greeting = ''
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

function defineTheme(hour) {
  let theme
  const horarioCompleto = hour !== 'false' ? hour : getHoraCerta()
  const [hora] = horarioCompleto.split(':')

  if (+hora >= 6 && +hora < 12) {
    theme = "sunrise-theme"
  }
  else if (+hora >= 12 && +hora < 18) {
    theme = "noon-theme"
  }
  else if (+hora >= 18 && +hora < 22) {
    theme = "afternoon-theme"
  }
  else
    theme = "night-theme"

  return theme
}

export default new DateTimeRepository()