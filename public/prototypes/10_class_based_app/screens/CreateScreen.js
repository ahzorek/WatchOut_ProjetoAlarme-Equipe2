import Screen from './Screen.js'

class CreateScreen extends Screen {
  constructor(app) {
    super(app)
    this.container = document.createElement('section')
    this.container.classList.add('screen', 'create-screen')

    this.render()
  }

  createStructure() {
    const frame = document.createElement("div")
    frame.classList.add('frame')

    const header = document.createElement("header")
    header.classList.add("top-nav", "side-screen")

    const title = document.createElement("h2")
    title.classList.add("title1")
    title.textContent = "New"

    const closeButton = document.createElement("button")
    closeButton.classList.add("close-screen")

    closeButton.innerHTML = closeIcon

    closeButton.addEventListener('click', () => this.app.goBack())

    header.appendChild(title)
    header.appendChild(closeButton)

    frame.appendChild(header)

    return frame
  }


  render() {
    if (this.loading) {
      this.container.innerHTML = `
        <div class="loading-spinner"></div>
      `
    } else {

      this.container.innerHTML = ''
      this.container.appendChild(this.structure)
    }

    this.app.appendScreen(this.container)
  }

  loadData() {
    this.user = this.app.state.user
    this.structure = this.createStructure()

    setTimeout(() => {
      this.loading = false
      this.render()
    }, 500)
  }
}

export default CreateScreen

const closeIcon = `
  <svg viewBox="-0.5 0 25 25" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21.32L21 3.32001" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M3 3.32001L21 21.32" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>
`