String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  })
}

const displayDaysTags = (days) => {
  let outputTags; const tags = []

  Object.keys(days).forEach(day => {
    if (days[day]) tags.push(day)
  })

  if (tags.length <= 0) { //essa opção não deve existir. precisa assegurar no codigo de cadastro de cada alarme que ele so pode ser salvo com pelo menos um dia valido atribuido
    outputTags = `<span class="tag-day">No Days</span>`
  }
  else
    if (tags.length === 7) {
      outputTags = `<span class="tag-day">Everyday</span>`
    }
    else {
      outputTags = tags.map(day => `<span class="tag-day">${day.toProperCase()}</span>`).join('')
    }

  return outputTags
}

export default displayDaysTags