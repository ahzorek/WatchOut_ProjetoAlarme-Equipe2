import supertest from "supertest"
import app from "../src/app.js"

const request = supertest(app)

describe('GET /test', () => {
  test('Deve retornar status 200 e a resposta "foi"', async () => {
    const res = await request.get("/test")
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual("foi")
  })
})

describe('GET /current-date', () => {
  test('Deve retornar status 200 e um json com a propriedade "hoje:" e uma String com a data', async () => {
    const res = await request.get("/current-date").set('accepted-language', 'en-GB')


    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty("hoje")
    expect(typeof (res.body.hoje)).toEqual("string")
  })
})

describe('GET /current-time', () => {
  test('Deve retornar status 200 e um json com a propriedade "horaCerta:" e uma String com o horário', async () => {
    const res = await request.get("/current-time")


    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty("horaCerta")
    expect(typeof (res.body.horaCerta)).toEqual("string")
  })
})
