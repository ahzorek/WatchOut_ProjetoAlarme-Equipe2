import createRadioInputAndLabel from './createRadioInputAndLabel.js'

function createSegmentedPicker(options, name, checkedOption, bool) {
  const segmentedPicker = document.createElement('div')
  segmentedPicker.classList.add('segmented-picker')

  options.forEach(({ optionName, optionValue }) => {
    const [input, label] = createRadioInputAndLabel(
      optionValue, optionName, name, checkedOption, bool
    )
    segmentedPicker.appendChild(input)
    segmentedPicker.appendChild(label)
  })

  return segmentedPicker
}

export default createSegmentedPicker