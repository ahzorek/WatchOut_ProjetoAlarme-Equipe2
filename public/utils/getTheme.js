const getTheme = async (timeStamp = false) => {
  const res = await fetch(`/theme?hour=${timeStamp}`)
  const { tema } = await res.json()

  return tema
}

export default getTheme