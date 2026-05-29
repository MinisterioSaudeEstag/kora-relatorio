# Integração Prisma + PostgreSQL - Documentação

## 📋 Status da Integração

✅ **Concluído:**
- Instalação do Prisma v5 e dependências
- Criação do schema.prisma com 3 tabelas (User, Document, Question)
- Geração do cliente Prisma
- Criação de arquivo de inicialização do Prisma (`app/lib/prisma.js`)
- Criação de novo módulo de autenticação com Prisma (`app/lib/auth-utils-prisma.js`)
- Instalação de bcryptjs (hash de senhas) e jsonwebtoken

⏳ **Aguardando:**
- Confirmação de que o banco PostgreSQL está acessível
- Executar `npx prisma db push` quando o banco estiver online

---

## 🗄️ Schema do Banco de Dados

### Tabela: `users`
```sql
id              CUID (Unique ID)
name            VARCHAR(255)
email           VARCHAR(255) - UNIQUE
passwordHash    VARCHAR(255)
phone           VARCHAR(20) - NULLABLE
location        VARCHAR(255) - NULLABLE
avatar          VARCHAR(255) - NULLABLE
joinDate        DATETIME - DEFAULT NOW()
createdAt       DATETIME - DEFAULT NOW()
updatedAt       DATETIME - UPDATED ON CHANGE
```

### Tabela: `documents`
```sql
id                      CUID
userId                  FK → users(id) - CASCADE DELETE
nome_arquivo            VARCHAR(255)
caminho_armazenamento   VARCHAR(255)
data_upload             DATETIME - DEFAULT NOW()
updatedAt               DATETIME
```

### Tabela: `questions`
```sql
id              CUID
userId          FK → users(id) - CASCADE DELETE
documentId      FK → documents(id) - CASCADE DELETE
pergunta        TEXT
resposta        TEXT - NULLABLE
data_criacao    DATETIME - DEFAULT NOW()
updatedAt       DATETIME
```

---

## 🔐 Segurança de Autenticação

### Senhas
- **Algoritmo**: bcryptjs (salt rounds: 10)
- **Nunca armazenado**: Texto plano
- **Verificação**: Comparação segura via bcryptjs

### Tokens JWT
- **Formato**: JWT Assinado
- **Validade**: 24 horas (configurável)
- **Armazenamento**: HttpOnly Cookies (seguro contra XSS)

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
```
app/lib/prisma.js                  # Inicializador do cliente Prisma
app/lib/auth-utils-prisma.js       # Funções de autenticação com Prisma
prisma/schema.prisma               # Schema do banco de dados
.env                               # Configurações de ambiente (atualizado)
.env.local                         # Backup de configurações
```

---

## 🚀 Como Usar

### 1. **Quando o Banco Estiver Acessível**

Execute para sincronizar o schema:
```bash
cd my-app
npx prisma db push
```

Isso criará as tabelas no PostgreSQL.

### 2. **Usar nas APIs**

Exemplo de login com Prisma:

```javascript
import { validateCredentials, generateToken } from '@/app/lib/auth-utils-prisma';

export async function POST(request) {
  const { email, password } = await request.json();

  // Valida credenciais contra o banco
  const user = await validateCredentials(email, password);

  if (!user) {
    return Response.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  // Gera token
  const token = generateToken({ userId: user.id, email: user.email });

  return Response.json({
    success: true,
    token,
    user,
  });
}
```

### 3. **Registrar Novo Usuário**

```javascript
import { createUser } from '@/app/lib/auth-utils-prisma';

try {
  const newUser = await createUser({
    name: 'João Silva',
    email: 'joao@example.com',
    password: 'senha123456', // Será hashada automaticamente
    phone: '(11) 98765-4321',
    location: 'São Paulo',
  });

  console.log('Usuário criado:', newUser);
} catch (error) {
  console.error('Erro:', error.message);
}
```

---

## 🔧 Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL="postgresql://relatoria_ministerio_user:KcHhWpiygzP3jsYZUMRIRPJvaqx3YsYn@a.oregon-postgres-render.com:5432/relatoria_ministerio"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Ambiente
NODE_ENV="development"
```

⚠️ **IMPORTANTE**: Em produção, mude o `JWT_SECRET` para uma chave segura gerada!

---

## 📊 Próximos Passos

1. ✅ Confirmar que o banco está acessível
2. ⏳ Executar `npx prisma db push`
3. ⏳ Atualizar `app/api/auth/login/route.js` para usar `auth-utils-prisma.js`
4. ⏳ Atualizar `app/api/auth/register/route.js` para usar `auth-utils-prisma.js`
5. ⏳ Migrar APIs de upload e chat para usar Prisma
6. ⏳ Criar testes de integração

---

## 🐛 Troubleshooting

### Erro: "Can't reach database server"
- Verifique se o servidor PostgreSQL está online
- Confirme a URL e credenciais em `.env`
- Teste a conexão manualmente

### Erro: "Relation does not exist"
- Execute `npx prisma db push` para criar as tabelas

### Erro: "Foreign key constraint failed"
- Certifique-se que o usuário/documento existe antes de criar um question

---

## 📚 Referências

- [Prisma Documentation](https://www.prisma.io/docs/)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [PostgreSQL](https://www.postgresql.org/docs/)
