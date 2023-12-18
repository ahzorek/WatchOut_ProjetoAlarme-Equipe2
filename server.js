import app from "./src/app.js"
import 'dotenv/config'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server Rodando em http://localhost:${PORT}`)
})