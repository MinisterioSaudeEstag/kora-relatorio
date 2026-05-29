# Guia de Migração: De Auth em Memória para Prisma

## 📝 Resumo

Todos os arquivos de API ainda usam autenticação em memória. Este guia mostra como migrá-los para usar Prisma + PostgreSQL.

---

## 1. Login (`app/api/auth/login/route.js`)

### ❌ Atual (Em Memória)
```javascript
import { validateCredentials, generateToken } from '@/app/lib/auth-utils';

export async function POST(request) {
  const { email, password } = await request.json();
  const user = validateCredentials(email, password);
  // ... resto do código
}
```

### ✅ Novo (Com Prisma)
```javascript
import { validateCredentials, generateToken } from '@/app/lib/auth-utils-prisma';

export async function POST(request) {
  const { email, password } = await request.json();
  const user = await validateCredentials(email, password); // Agora é async!
  // ... resto do código
}
```

---

## 2. Register (`app/api/auth/register/route.js`)

### ❌ Atual (Em Memória)
```javascript
import { createUser } from '@/app/lib/auth-utils';

const newUser = createUser(name, email, password);
```

### ✅ Novo (Com Prisma)
```javascript
import { createUser } from '@/app/lib/auth-utils-prisma';

const newUser = await createUser({
  name,
  email,
  password,
  phone: '',
  location: '',
});
```

---

## 3. Alterar Senha (`app/api/settings/change-password/route.js`)

### Implementação Recomendada
```javascript
import { changePassword, verifyToken } from '@/app/lib/auth-utils-prisma';

export async function POST(request) {
  const { currentPassword, newPassword } = await request.json();

  // Obtém token do header
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const decoded = verifyToken(token);

  if (!decoded) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    await changePassword(decoded.userId, currentPassword, newPassword);
    return Response.json({ success: true, message: 'Senha alterada' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
```

---

## 4. Deletar Conta (`app/api/settings/delete-account/route.js`)

### Implementação Recomendada
```javascript
import { deleteUser, verifyToken } from '@/app/lib/auth-utils-prisma';

export async function DELETE(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const decoded = verifyToken(token);

  if (!decoded) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const success = await deleteUser(decoded.userId);

  if (success) {
    return Response.json({ success: true, message: 'Conta deletada' });
  } else {
    return Response.json({ error: 'Erro ao deletar conta' }, { status: 500 });
  }
}
```

---

## 5. Perfil do Usuário (`app/api/user/profile/route.js`)

### GET - Buscar Perfil
```javascript
import prisma from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/auth-utils-prisma';

export async function GET(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const decoded = verifyToken(token);

  if (!decoded) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      location: true,
      avatar: true,
      joinDate: true,
      createdAt: true,
    },
  });

  return Response.json({ user });
}
```

### PUT - Atualizar Perfil
```javascript
import { updateUser, verifyToken } from '@/app/lib/auth-utils-prisma';

export async function PUT(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const decoded = verifyToken(token);

  if (!decoded) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { name, phone, location } = await request.json();

  const user = await updateUser(decoded.userId, {
    name,
    phone,
    location,
  });

  return Response.json({ success: true, user });
}
```

---

## 6. Upload de Documento (`app/api/upload/route.js`)

### Integração com Prisma
```javascript
import prisma from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/auth-utils-prisma';

export async function POST(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const decoded = verifyToken(token);

  if (!decoded) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  // ... processar arquivo ...

  // Salvar metadados no banco
  const document = await prisma.document.create({
    data: {
      userId: decoded.userId,
      nome_arquivo: file.name,
      caminho_armazenamento: `/uploads/${date_timestamp}_${file.name}`,
    },
  });

  return Response.json({ success: true, document });
}
```

---

## 7. Chat/Perguntas (`app/api/chat/route.js`)

### Implementação Recomendada
```javascript
import prisma from '@/app/lib/prisma';
import { verifyToken } from '@/app/lib/auth-utils-prisma';

export async function POST(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const decoded = verifyToken(token);

  if (!decoded) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { documentId, pergunta } = await request.json();

  // Valida que o documento pertence ao usuário
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: decoded.userId,
    },
  });

  if (!document) {
    return Response.json({ error: 'Documento não encontrado' }, { status: 404 });
  }

  // ... processa pergunta com IA ...

  // Salva pergunta e resposta
  const question = await prisma.question.create({
    data: {
      userId: decoded.userId,
      documentId,
      pergunta,
      resposta: ia_response,
    },
  });

  return Response.json({ success: true, question });
}
```

---

## 📋 Checklist de Migração

- [ ] Banco PostgreSQL está acessível
- [ ] `npx prisma db push` executado com sucesso
- [ ] `app/api/auth/login/route.js` - Migrado
- [ ] `app/api/auth/register/route.js` - Migrado
- [ ] `app/api/settings/change-password/route.js` - Migrado
- [ ] `app/api/settings/delete-account/route.js` - Migrado
- [ ] `app/api/user/profile/route.js` - Migrado
- [ ] `app/api/upload/route.js` - Migrado
- [ ] `app/api/chat/route.js` - Migrado
- [ ] Testes de autenticação
- [ ] Testes de upload
- [ ] Testes de chat

---

## ⚠️ Pontos Importantes

1. **Async/Await**: Todas as operações Prisma retornam Promises!
   ```javascript
   const user = await validateCredentials(email, password); // ✅ Correto
   const user = validateCredentials(email, password);       // ❌ Errado
   ```

2. **Tratamento de Erros**: Sempre use try/catch
   ```javascript
   try {
     const user = await createUser({...});
   } catch (error) {
     console.error(error);
     return Response.json({ error: error.message }, { status: 400 });
   }
   ```

3. **Segurança**: Sempre verifique o token antes de operações
   ```javascript
   const decoded = verifyToken(token);
   if (!decoded) {
     return Response.json({ error: 'Não autorizado' }, { status: 401 });
   }
   ```

4. **Validação de Propriedade**: Se é um recurso do usuário, valide propriedade
   ```javascript
   // ❌ Errado: Usuário pode acessar documento de outro usuário
   const document = await prisma.document.findUnique({ where: { id } });

   // ✅ Correto: Valida que o documento pertence ao usuário
   const document = await prisma.document.findFirst({
     where: { id, userId: decoded.userId }
   });
   ```

---

## 🔄 Transição Gradual

Se preferir não migrar tudo de uma vez:

1. Manter `auth-utils.js` (em memória) para testes
2. Criar `auth-utils-prisma.js` com as novas funções
3. Migrar APIs uma por uma
4. Remover `auth-utils.js` quando tudo estiver em Prisma

---

## 📞 Suporte

Se encontrar erros durante a migração:
1. Verifique que o banco está acessível
2. Confirme que `npx prisma db push` foi executado
3. Verifique os logs com `console.error()`
4. Teste individualmente em ferramentas como Postman/Insomnia
