import formatTime from "./formatTime.js"

const formatTimeToString = (h, m) => `${formatTime(h)}:${formatTime(m)}:00`

export default formatTimeToString