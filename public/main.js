console.log("sup") // sup

const hasUser = localStorage.getItem('userId')
if (!hasUser) {
  window.location.href = '/login'

}

import App from "./App.js"

const app = new App()