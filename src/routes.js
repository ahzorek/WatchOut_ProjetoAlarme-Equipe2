import { Router } from "express"
import AlarmController from "./app/controllers/AlarmController.js"

const router = Router()

router.get("/test", (req, res) => {
    res.json("foi")
})

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