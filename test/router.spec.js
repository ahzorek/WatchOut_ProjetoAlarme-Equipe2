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

describe('GET /weather?city=%_cidade_%', () => {
  test('Deve retornar status 200 autorizado com uma key valida, propriedade "by: city_name" e um objeto "results"', async () => {
    const res = await request.get("/weather?city=Florianopolis")
    expect(res.statusCode).toEqual(200)

    expect(res.body.by).toEqual('city_name')
    expect(res.body.valid_key).toEqual(true)
    expect(res.body).toHaveProperty("results")
  })

  test('Deve retornar status 418 e body "not good my man"', async () => {
    const res = await request.get("/weather")

    expect(res.body).toEqual('not good my man')
    expect(res.statusCode).toEqual(418)
  })
})
