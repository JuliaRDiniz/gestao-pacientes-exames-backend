# Documentação Backend - Gestão de Pacientes e Exames Médicos

## Descrição Geral

Backend desenvolvido em **Node.js** com **Express** e **Prisma** para gerenciamento de pacientes e exames médicos, servindo como camada de serviço para a interface frontend.

## Tecnologias Utilizadas

- **Node.js** – Ambiente de execução
- **Express** – Framework web
- **JavaScript** – Linguagem de desenvolvimento
- **Prisma** – ORM para comunicação com o banco de dados
- **PostgreSQL** – Banco de dados relacional

## Estrutura do Projeto

- **src/db.js** – Inicializa o cliente Prisma para comunicação com o banco de dados PostgreSQL.
- **prisma/** – Contém configuração do banco de dados, schema e migrações.
- **server.js** – Ponto de entrada do servidor Express. Contém os endpoints para pacientes e exames, com paginação, validações e regras de negócio.

## Endpoints Implementados

### Pacientes

- `GET /pacientes` – Lista pacientes com paginação (`page` e `pageSize`)
- `GET /pacientes/:id` – Busca paciente específico pelo ID
- `POST /pacientes` – Cria um novo paciente
- `PUT /pacientes/:id` – Atualiza os dados de um paciente
- `DELETE /pacientes/:id` – Exclui paciente (não permite exclusão se houver exames vinculados)
- `GET /pacientes/:id/exames` – Lista todos os exames de um paciente específico

### Exames

- `GET /exames` – Lista exames com paginação (`page` e `pageSize`) e inclui dados do paciente
- `GET /exames/:id` – Busca exame específico pelo ID, incluindo dados do paciente
- `POST /exames` – Cria um novo exame vinculado a um paciente
- `DELETE /exames/:id` – Exclui um exame específico

## Regras de Negócio e Validações

### Pacientes

- Documento de identificação deve ser único (não permite duplicidade).
- Campos obrigatórios: `name`, `document` e `birthDate`.
- Documento é **imutável** após cadastro.
- Pacientes com exames vinculados **não podem ser excluídos**.

### Exames

- Todo exame deve estar vinculado a um paciente existente.
- Campos obrigatórios: `patientId`, `modality`, `procedure` e `performedAt`.
- Modalidade deve ser uma das opções válidas:
  `CR, CT, DX, MG, MR, NM, OT, CP, ES, EEG, BMD, US, XA`

## Como Executar o Projeto

1. Clone o repositório do projeto em sua máquina local.
2. Acesse a pasta do projeto pelo terminal.
3. Instale todas as dependências:

   ```bash
   npm install
   ```

4. Configure as variáveis de ambiente criando um arquivo `.env` com a string de conexão do PostgreSQL.
5. Execute as migrações do banco de dados:

   ```bash
   npx prisma migrate dev
   ```

6. Inicie o servidor backend:

   ```bash
   node server.js
   ```

7. A API estará disponível localmente na porta 3000 (ou a definida em `process.env.PORT`).

## Próximas Evoluções

- Adição de endpoints para atualização completa de exames.
- Implementação de testes automatizados para garantir qualidade do código.
- Melhorias no tratamento de erros e mensagens de retorno da API.
- Expansão de regras de negócio e validações adicionais.

## Aplicação Completa

Este backend é consumido pela aplicação frontend em Angular:

**Frontend Repositório:** [https://github.com/JuliaRDiniz/gestao-pacientes-exames-frontend](https://github.com/JuliaRDiniz/gestao-pacientes-exames-frontend)
