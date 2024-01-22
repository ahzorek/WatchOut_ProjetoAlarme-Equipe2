const createRadioInputAndLabel = (
  value, labelText, name, checked, bool
) => {
  const input = document.createElement('input')
  input.value = value
  input.id = name + value
  input.type = 'radio'
  input.name = name
  input.checked = value == checked ? true : false
  input.setAttribute('data-isBool', bool)

  const label = document.createElement('label')
  label.htmlFor = name + value
  label.innerHTML = `<span>${labelText}</span>`

  return [input, label]
}

export default createRadioInputAndLabel