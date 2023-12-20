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

describe('GET /welcome-message', () => {
  test('Deve retornar status 200 e um json com a propriedade "mensagem" e uma String com a mensagem', async () => {
    const res = await request.get("/welcome-message")
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty("mensagem")
    expect(typeof (res.body.mensagem)).toEqual("string")
  })
})

describe('GET /public', () => {
  test('Deve servir arquivos estáticos', async () => {
    const response = await request.get('/img/test.jpg')
    expect(response.status).toBe(200)
  })
})

describe('GET /user', () => {
  test('Deve retornar um array de usuários', async () => {
    const res = await request.get('/user')

    expect(res.status).toBe(200)
    expect(typeof (res.body)).toEqual('object')
    expect(res.body).toHaveProperty('data')


  })
})

describe('GET /user/:id', () => {
  test('Deve retornar um objeto com um usuário', async () => {
    const res = await request.get('/user/lzFc5iul')

    expect(res.status).toBe(200)
    expect(typeof (res.body)).toEqual('object')
    expect(res.body).toHaveProperty('id')
    expect(res.body.id).toEqual('lzFc5iul')

  })
})

describe('DELETE /user/:id', () => {
  test('Deve deletar o usuário e retornar mensagem de confirmação', async () => {
    const testUser = 'lzFc5iul'
    const res = await request.delete(`/user/${testUser}`)

    expect(res.status).toBe(200)
    expect(typeof (res.body)).toEqual('object')
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual(`user with id ${testUser} successfuly deleted.`)

  })
})

describe('GET /user/:id', () => {
  test('Deve retornar 404 e mensagem de usuário não encontrado', async () => {
    const res = await request.get('/user/lzFc5iul')

    expect(res.status).toBe(404)
    expect(typeof (res.body)).toEqual('object')
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('user not found')

  })
})

describe('POST /user', () => {
  test('Deve criar um novo usuário e retornar 201', async () => {
    const newUser = {
      username: 'novousuario',
      password: 'senha123',
      city: 'London',
      unit: 'celsius',
      is24Hour: true,
      title: 'Sir.'
    }

    const res = await request.post('/user').send(newUser)

    expect(res.status).toBe(201)

    expect(typeof res.body).toEqual('object')
    expect(res.body).toHaveProperty('message', 'user successfully created')

  })
})

describe('POST /user', () => {
  test('Deve falhar em criar um novo usuário e retornar status 418', async () => {
    const newUser = {
      username: 'novousuario',
      password: 'senha123',
      city: 'London',
      unit: 'celsius',
      is24Hour: true,
      title: 'Sir.'
    }

    const res = await request.post('/user').send(newUser)

    expect(res.status).toBe(418)

    expect(typeof res.body).toEqual('object')
    expect(res.body).toHaveProperty('message', 'username already exists')

  })
})

describe('POST /user', () => {
  test('Deve falhar em criar um novo usuário e retornar 406', async () => {
    const newUser = {
    }

    const res = await request.post('/user').send(newUser)

    expect(res.status).toBe(406)

    expect(typeof res.body).toEqual('object')
    expect(res.body).toHaveProperty('message', 'missing data, check it again')

  })
})