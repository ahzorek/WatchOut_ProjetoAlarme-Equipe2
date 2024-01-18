class Screen {
  constructor(app) {
    this.app = app
    this.loading = true
  }

  activate() {
    this.container.classList.add('active')
    if (this.loading) this.loadData()
  }

  deactivate() {
    this.container.classList.remove('active')
    this.container.addEventListener('transitionend', (e) => {
      if (e.target.classList.contains('screen') && !e.target.classList.contains('active')) {
        this.container.innerHTML = ''
        this.loading = true
        this.render()
      }
    })
  }
}

export default Screen