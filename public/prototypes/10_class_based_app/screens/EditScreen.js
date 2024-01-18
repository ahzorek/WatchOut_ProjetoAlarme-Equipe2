import Screen from './Screen.js'

class EditScreen extends Screen {
  constructor(app) {
    super(app)
    this.container = document.createElement('section')
    this.container.classList.add('screen', 'edit-screen')

    this.render()
  }

  render() {
    if (this.loading) {
      this.container.innerHTML = `
        <div class="loading-spinner"></div>
      `
    } else {
      this.container.innerHTML = `
        edit screen content
      `
    }

    this.app.appendScreen(this.container)
  }

  loadData() {
    setTimeout(() => {

      this.loading = false

      this.render()
    }, 500)
  }
}

export default EditScreen 
