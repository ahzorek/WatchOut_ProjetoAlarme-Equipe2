//separa a string horario em um objeto com numbers {h,m,s}
const splitTimeString = (timeString) => {
  let [h, m, s] = timeString.split(':')

  h = +h //transforma as Strings de hora, min, seg em Number
  m = +m //
  s = +s //

  return { h, m, s }
}
export default splitTimeString