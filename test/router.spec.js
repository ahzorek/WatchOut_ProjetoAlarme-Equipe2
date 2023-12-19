import supertest from "supertest"
import app from "../src/app.js"

const request = supertest(app)

describe('GET /current-date', () => {
  test('Deve retornar status 200 e um json com a propriedade "hoje:" e uma String com a data', async () => {
    const res = await request.get("/current-date").set('accepted-language', 'en-GB')


    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty("hoje")
    expect(typeof (res.body.hoje)).toEqual("string")
  })
})
