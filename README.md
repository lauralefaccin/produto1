# AtlasBook

Sistema de gerenciamento de biblioteca com suporte a dois perfis de usuário: **bibliotecário** e **leitor**.

---

## Tecnologias

- **Frontend:** React 19, React Router DOM, Vite
- **Backend:** Node.js, Express, JWT, bcrypt
- **Banco de dados:** PostgreSQL

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente

---

## Instalação e execução

### 1. Banco de dados

Crie o banco de dados no PostgreSQL:

```sql
CREATE DATABASE atlasbook;
```

### 2. Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend/` com as seguintes variáveis:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=atlasbook
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=sua_chave_secreta
```

Inicialize as tabelas e dados iniciais:

```bash
npm run db:init
```

Inicie o servidor:

```bash
npm run dev
```

O backend ficará disponível em `http://localhost:3001`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend ficará disponível em `http://localhost:5173`.

---

## Acesso inicial

Após rodar `npm run db:init`, um usuário administrador é criado automaticamente:

| Campo | Valor     |
|-------|-----------|
| Login | `admin`   |
| Senha | `admin123`|
| Tipo  | Bibliotecário |

---

## Funcionalidades

### Bibliotecário
- Gerenciar livros do acervo (cadastrar, editar, excluir)
- Gerenciar autores (cadastrar, editar, excluir)
- Gerenciar gêneros literários (cadastrar, editar, excluir)
- Gerenciar leitores (cadastrar, editar, remover)

### Leitor
- Navegar pelo acervo de livros
- Adicionar e remover livros da estante pessoal
- Visualizar autores e gêneros

### Geral
- Autenticação com JWT
- Login automático após cadastro
- Sessão mantida via `sessionStorage`
- Dashboard com estatísticas do acervo