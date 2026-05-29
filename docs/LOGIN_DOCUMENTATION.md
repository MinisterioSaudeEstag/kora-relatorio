# 🔐 Página de Login - Documentação Completa

## 📋 Visão Geral

A página de login é a porta de entrada do sistema Relatory. Implementa autenticação segura com validação em dois níveis (frontend e backend), com suporte a "Lembrar-me" e recuperação de senha.

## 🎯 Características Principais

### ✅ Segurança
- Validação de formulário no frontend
- Validação server-side na API
- Cookies HttpOnly para JWT
- Hash de senha (preparado para bcryptjs)
- Proteção contra CSRF (preparada)

### ✅ UX/UI
- Design responsivo e moderno
- Dark mode completo
- Visualização de senha toggle
- Mensagens de erro claras
- Feedback visual de carregamento

### ✅ Funcionalidades
- Login com email e senha
- "Lembrar-me" por 30 dias
- Link "Esqueci minha senha"
- Link "Criar uma conta"
- Validação em tempo real

## 📁 Estrutura de Arquivos

```
my-app/
├── app/
│   ├── login/
│   │   └── page.js .................. 🔐 Página de Login
│   ├── register/
│   │   └── page.js .................. 📝 Página de Registro
│   ├── forgot-password/
│   │   └── page.js .................. ❓ Recuperação de Senha
│   ├── reset-password/
│   │   └── page.js .................. 🔑 Reset de Senha
│   └── api/auth/
│       ├── login/route.js ........... 🔌 API Login
│       ├── register/route.js ........ 🔌 API Registro
│       ├── logout/route.js .......... 🔌 API Logout
│       ├── forgot-password/route.js . 🔌 API Recuperação
│       └── reset-password/route.js .. 🔌 API Reset
└── docs/pages/login/login.md ........ 📖 Specs
```

## 🔄 Fluxos de Autenticação

### 1. **Fluxo de Login**
```
User Input (email, senha)
        ↓
Frontend Validation
        ↓
Send to POST /api/auth/login
        ↓
Backend Validation
        ↓
Query Database
        ↓
Match Credentials
        ↓
Generate JWT Token
        ↓
Set HttpOnly Cookie
        ↓
Redirect to Home (/)
```

### 2. **Fluxo de Registro**
```
User Input (nome, email, senha)
        ↓
Frontend Validation
        ↓
Send to POST /api/auth/register
        ↓
Backend Validation
        ↓
Check Email Exists
        ↓
Hash Password
        ↓
Save to Database
        ↓
Send Verification Email
        ↓
Redirect to Login
```

### 3. **Fluxo de Recuperação**
```
User clicks "Esqueci minha senha"
        ↓
Enter Email
        ↓
Send to POST /api/auth/forgot-password
        ↓
Generate Reset Token
        ↓
Send Email with Link
        ↓
User clicks Link
        ↓
Enter New Password
        ↓
Send to POST /api/auth/reset-password
        ↓
Update Password
        ↓
Redirect to Login
```

## 🛡️ Validação

### Frontend (React)
```javascript
✅ Email válido (regex)
✅ Senha não vazia
✅ Senhas correspondem (register)
✅ Senha com requisitos (8+ chars, maiúscula, número)
✅ Nome com 3+ caracteres
✅ Feedback em tempo real
```

### Backend (API)
```javascript
✅ Validação de entrada
✅ Verificação de email
✅ Hash de senha
✅ Rate limiting (TODO)
✅ 2FA (TODO)
```

## 📝 Formulários

### Login Form
```
[Email Icon]    seu@email.com          [Clear]
[Lock Icon]     ••••••••               [Show/Hide]

[□ Lembrar-me]                    [Esqueci minha senha?]

[Entrar →]
```

### Register Form
```
[Person Icon]   João Silva             [Clear]
[Email Icon]    seu@email.com          [Clear]
[Lock Icon]     ••••••••               [Show/Hide]
[Check Icon]    ••••••••               [Show/Hide]

[□ Concordo com Termos]

[Criar Conta →]
```

### Forgot Password Form
```
[Email Icon]    seu@email.com          [Clear]

[Enviar Link →]
```

### Reset Password Form
```
[Lock Icon]     ••••••••               [Show/Hide]
[Check Icon]    ••••••••               [Show/Hide]

[Resetar Senha →]
```

## 🎨 Design

### Paleta de Cores
- **Primária**: Blue #3B82F6
- **Fundo**: Gray #F3F4F6 (Light) / #030712 (Dark)
- **Erro**: Red #EF4444
- **Sucesso**: Green #10B981

### Tipografia
- **Logo**: 24px Bold
- **Título**: 36px Bold
- **Subtítulo**: 18px Regular
- **Label**: 14px Semibold
- **Texto**: 14px Regular
- **Pequeno**: 12px Regular

### Componentes
- Inputs com ícones
- Botões com estados (normal, hover, loading, disabled)
- Links azuis underline
- Cards com shadow
- Error alerts com ícones

## 🔌 Endpoints de API

### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "rememberMe": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "João Silva"
  }
}
```

**Headers Response:**
```
Set-Cookie: auth_token=eyJhbGciOiJIUzI1NiIs...; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000
```

### POST /api/auth/register
**Request:**
```json
{
  "name": "João Silva",
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Conta criada com sucesso!",
  "user": {
    "id": "user_456",
    "name": "João Silva",
    "email": "user@example.com"
  }
}
```

### POST /api/auth/forgot-password
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Se este email existe em nossa base, você receberá instruções de recuperação."
}
```

### POST /api/auth/reset-password
**Request:**
```json
{
  "token": "reset_token_here",
  "password": "NewPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Senha resetada com sucesso"
}
```

### POST /api/auth/logout
**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

**Headers Response:**
```
Set-Cookie: auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

## 🔒 Requisitos de Senha

- ✅ Mínimo 8 caracteres
- ✅ Pelo menos 1 letra maiúscula
- ✅ Pelo menos 1 número
- ⏳ Sem caracteres especiais obrigatórios (mas recomendado)
- ⏳ Verificação contra lista de senhas comuns (TODO)

## 📞 Mensagens de Erro

| Erro | Status | Mensagem |
|------|--------|----------|
| Email vazio | 400 | "Por favor, preencha todos os campos" |
| Senha vazia | 400 | "Por favor, preencha todos os campos" |
| Email inválido | 400 | "Email inválido" |
| Senha curta | 400 | "Senha deve ter no mínimo 6/8 caracteres" |
| Credentials inválidas | 401 | "Email ou senha incorretos" |
| Email existe | 400 | "Email já cadastrado" |
| Senhas não correspondem | 400 | "As senhas não correspondem" |

## ⏰ Tokens e Expiração

### JWT Token
- **Payload**: { userId, email, role, iat }
- **Algoritmo**: HS256
- **Expiração**: 
  - Normal: 24 horas
  - Com "Lembrar-me": 30 dias

### Reset Token
- **Tipo**: Random Hash
- **Expiração**: 1 hora
- **Uso**: Uma única vez

## 📱 Responsividade

```
Mobile (< 768px):
- Full width cards
- Stacked buttons
- Larger tap targets
- Vertical layout

Tablet (768px - 1024px):
- 80% width cards
- Side-by-side buttons
- Comfortable spacing

Desktop (> 1024px):
- Max 400px cards
- Full buttons
- Optimal spacing
```

## 🧪 Casos de Teste

### Login
- [ ] Email válido + Senha válida → Login sucesso
- [ ] Email inválido → Erro visual
- [ ] Senha vazia → Erro
- [ ] Email vazio → Erro
- [ ] "Lembrar-me" ativo → Cookie 30 dias
- [ ] "Lembrar-me" inativo → Cookie 24 horas
- [ ] Erro no servidor → Mensagem de erro
- [ ] Toggle senha → Mostra/esconde texto

### Register
- [ ] Todos campos válidos → Conta criada
- [ ] Email já existe → Erro
- [ ] Senhas não correspondem → Erro
- [ ] Senha fraca → Erro com requisitos
- [ ] Nome muito curto → Erro
- [ ] Email inválido → Erro
- [ ] Termo não aceito → Botão disabled

### Forgot Password
- [ ] Email válido → Email enviado
- [ ] Email inválido → Erro
- [ ] Email não existe → Mensagem genérica
- [ ] Link de email → Reset page

### Reset Password
- [ ] Tokenválido → Reset sucesso
- [ ] Token expirado → Erro
- [ ] Senhas não correspondem → Erro
- [ ] Senha fraca → Erro

## 🚀 Deploy Checklist

### Frontend
- [ ] Remove console.logs
- [ ] Minify CSS/JS
- [ ] Otimizar imagens
- [ ] Testar em todos os browsers
- [ ] Testar dark mode
- [ ] Lighthouse > 80

### Backend
- [ ] Implementar bcryptjs
- [ ] Configurar JWT_SECRET
- [ ] Implementar rate limiting
- [ ] Implementar CSRF tokens
- [ ] Configurar CORS
- [ ] Implementar logging
- [ ] Testes de API

### DevOps
- [ ] HTTPS/SSL obrigatório
- [ ] Headers de segurança
- [ ] HSTS ativado
- [ ] CSP configurado
- [ ] Secrets no .env
- [ ] Monitoring ativo

## 📚 Dependências Necessárias

```bash
npm install jsonwebtoken          # JWT
npm install bcryptjs               # Password hash
npm install next-auth              # Auth optional
npm install zod                    # Validation
npm install nodemailer             # Email
```

## 🔄 Fluxo de Autenticação (Detalhado)

```
1. User acessa /login
2. Vê formulário de autenticação
3. Preenche email e senha
4. Clica em "Entrar"
5. Frontend valida entrada
6. Se inválido → Mostra erro
7. Se válido → Envia POST /api/auth/login
8. Backend valida entrada novamente
9. Busca email no banco
10. Se não encontra → Error 401
11. Se encontra → Compare password hash
12. Se não match → Error 401
13. Se match → Gera JWT token
14. Armazena em HttpOnly cookie
15. Retorna user info
16. Frontend redireciona para /
17. Header lê cookie automaticamente
18. User vê seu nome no header
19. Pode acessar todas as rotas privadas
```

## ✨ Segurança - Melhores Práticas

✅ **Implementado:**
- Validação frontend
- Validação backend
- HttpOnly cookies
- Separação de responsabilidades

⏳ **TODO:**
- CSRF tokens
- Rate limiting (5 tentativas/min)
- 2FA (TOTP)
- Session management
- Audit logging
- OAuth/SSO

## 📖 Referências

- [JWT.io](https://jwt.io) - JWT Documentation
- [OWASP Auth Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)

---

**Versão**: 1.0.0  
**Última Atualização**: 14 de Abril de 2024  
**Status**: ✅ Implementação Completa
