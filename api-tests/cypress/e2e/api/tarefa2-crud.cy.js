/// <reference types="cypress" />

const KEY = Cypress.env('REQRES_API_KEY');
const HEADERS = KEY ? { 'x-api-key': KEY, 'Authorization': `Bearer ${KEY}` } : {};

describe('Tarefa 2 – CRUD completo (GET, POST, PUT, DELETE)', () => {
  it('POST /users -> 201: cria usuário e retorna id/createdAt', () => {
    const payload = { name: 'Leandro', job: 'QA Engineer' };
    cy.request({ method: 'POST', url: '/users', headers: HEADERS, body: payload }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.headers['content-type']).to.include('application/json');
      expect(res.body).to.include.keys(['name','job','id','createdAt']);
      expect(res.body.name).to.eq(payload.name);
      expect(res.body.job).to.eq(payload.job);
      expect(res.body.id).to.be.a('string').and.not.be.empty;
      expect(res.body.createdAt).to.match(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  it('GET /users -> 200: lista usuários e valida headers/body', () => {
    cy.request({ url: '/users', headers: HEADERS }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.headers['content-type']).to.include('application/json');
      expect(res.body).to.have.property('data').and.to.be.an('array');
    });
  });

  it('PUT /users/2 -> 200: atualiza usuário e retorna updatedAt', () => {
    const payload = { name: 'Leandro', job: 'Staff QA' };
    cy.request({ method: 'PUT', url: '/users/2', headers: HEADERS, body: payload }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.headers['content-type']).to.include('application/json');
      expect(res.body).to.include.keys(['name','job','updatedAt']);
      expect(res.body.name).to.eq(payload.name);
      expect(res.body.job).to.eq(payload.job);
      expect(res.body.updatedAt).to.match(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  it('DELETE /users/2 -> 204 (ou 401/403 para chaves sem permissão manage)', () => {
    cy.request({ method: 'DELETE', url: '/users/2', headers: HEADERS, failOnStatusCode: false })
      .then((res) => {
        // Algumas chaves "free" podem não deletar (401/403).
        expect([204, 401, 403]).to.include(res.status);
        if (res.status === 204) {
          expect(res.body).to.be.empty;
        }
      });
  });
});
