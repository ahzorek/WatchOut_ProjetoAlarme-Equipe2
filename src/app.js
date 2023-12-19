import express from "express"
import routes from "./routes.js"

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(express.static('public'))

app.use(routes)

export default app 