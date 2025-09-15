/// <reference types="cypress" />

// Lê sua chave do cypress.env.json
const KEY = Cypress.env('REQRES_API_KEY');
const HEADERS = KEY ? { 'x-api-key': KEY, 'Authorization': `Bearer ${KEY}` } : {};

describe('Tarefa 1 – Validações de endpoint (status, headers, body)', () => {
  it('GET /users?page=2 -> 200 + headers JSON + corpo com lista', () => {
    cy.request({ url: '/users?page=2', headers: HEADERS }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.headers['content-type']).to.include('application/json');
      expect(res.body).to.have.property('page', 2);
      expect(res.body).to.have.property('data').and.to.be.an('array').and.not.be.empty;
      const user = res.body.data[0];
      expect(user).to.include.keys(['id','email','first_name','last_name','avatar']);
      expect(user.email).to.match(/@/);
    });
  });

  it('GET /users/2 -> 200 + headers JSON + corpo com usuário', () => {
    cy.request({ url: '/users/2', headers: HEADERS }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.headers['content-type']).to.include('application/json');
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.include({ id: 2 });
      expect(res.body.data.email).to.match(/@/);
    });
  });

  it('GET /users/23 -> 404 (negativo: recurso não existe)', () => {
    cy.request({ url: '/users/23', headers: HEADERS, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body).to.deep.equal({});
    });
  });

  it('POST /register (faltando password) -> 400 (negativo) com mensagem de erro', () => {
    cy.request({
      method: 'POST',
      url: '/register',
      headers: HEADERS,
      body: { email: 'sydney@fife' },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.headers['content-type']).to.include('application/json');
      expect(res.body).to.deep.equal({ error: 'Missing password' });
    });
  });
});
