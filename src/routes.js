import { Router } from "express"
import AlarmController from "./app/controllers/AlarmController.js"
import WeatherController from "./app/controllers/WeatherController.js"

const router = Router()

//rota teste 
router.get("/test", (req, res) => {
    res.json("foi")
})

//retorna clima pelo nome da cidade em query param (?city=)
router.get("/weather", WeatherController.show)

//retorna lista de alarmes
router.get("/alarm", AlarmController.index)

//retorna um alarme por id passada
router.get("/alarm/:id", AlarmController.show)

//cria novo alarme
router.post("/alarm", AlarmController.store)

//atualiza dados de alarme (recebe alarm id)
router.put("/alarm/:id", AlarmController.update)

//deleta alarme (recebe user id)
router.delete("/alarm/:id", AlarmController.delete)

export default router