# Arquitetura do Sistema Relatory

## 🏗️ Visão Geral da Arquitetura

```
USUÁRIO
   ↓
┌──────────────────────────────────────────────────┐
│         FRONTEND (Next.js + React)               │
│  ┌────────────────────────────────────────────┐  │
│  │  Páginas                                   │  │
│  │  ├─ Home           (Dashboard)             │  │
│  │  ├─ Profile        (Dados do Usuário)      │  │
│  │  ├─ Configuração   (Preferências)          │  │
│  │  └─ Login          (Autenticação)          │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │  Componentes Reutilizáveis                 │  │
│  │  ├─ Header       (Navegação)               │  │
│  │  ├─ Footer       (Informações)             │  │
│  │  └─ PDFUpload    (Upload)                  │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │  Estilos                                   │  │
│  │  ├─ Tailwind CSS v4                        │  │
│  │  ├─ Dark Mode                              │  │
│  │  └─ Responsivo (Mobile, Tablet, Desktop)  │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
   ↓
┌──────────────────────────────────────────────────┐
│         API (Next.js API Routes)                 │
│  ├─ POST /api/upload       (Upload PDF)         │
│  ├─ POST /api/auth/login   (Login)              │
│  ├─ POST /api/auth/logout  (Logout)             │
│  ├─ GET  /api/documents    (Listar docs)        │
│  ├─ POST /api/chat         (Perguntas IA)       │
│  └─ POST /api/reports      (Gerar relatórios)   │
└──────────────────────────────────────────────────┘
   ↓
┌──────────────────────────────────────────────────┐
│         BACKEND (Node.js)                        │
│  ├─ Autenticação (JWT + HttpOnly Cookies)       │
│  ├─ Processamento de PDF (pdf.js/pdf-parse)     │
│  ├─ Integração com NLP (OpenAI/HuggingFace)     │
│  └─ Cache & Performance                         │
└──────────────────────────────────────────────────┘
   ↓
┌──────────────────────────────────────────────────┐
│         DATABASE (PostgreSQL)                    │
│  ├─ Usuários                                     │
│  ├─ Documentos                                   │
│  ├─ Conversas & Respostas                        │
│  ├─ Relatórios                                   │
│  └─ Histórico                                    │
└──────────────────────────────────────────────────┘
```

## 📊 Fluxo de Dados

### 1. Fluxo de Upload de PDF
```
Usuário seleciona arquivogetClass
        ↓
PDFUpload.js valida arquivo
        ↓
Drag & drop OU Seleção de arquivo
        ↓
Usuário clica "Enviar"
        ↓
FormData enviado para POST /api/upload
        ↓
Backend valida arquivo
        ↓
Arquivo armazenado
        ↓
PDF processado com pdf.js/pdf-parse
        ↓
Conteúdo indexado no DB
        ↓
Resposta de sucesso ao frontend
        ↓
Histórico atualizado
```

### 2. Fluxo de Chat/Perguntas
```
Usuário faz pergunta sobre PDF
        ↓
Pergunta enviada ao POST /api/chat
        ↓
Backend processa pergunta
        ↓
Busca contexto no PDF processado
        ↓
Envia para modelo NLP (IA)
        ↓
IA gera resposta baseada no PDF
        ↓
Resposta armazenada no histórico
        ↓
Resposta exibida ao usuário
```

### 3. Fluxo de Geração de Relatório
```
Usuário clica "Gerar Relatório"
        ↓
Sistema coleta respostas ao histórico
        ↓
POST /api/reports com dados
        ↓
Backend estrutura informações
        ↓
Gera documento formatado
        ↓
Retorna PDF/Word ao usuário
        ↓
Usuário pode baixar ou visualizar
```

## 🔐 Fluxo de Autenticação

```
LOGIN:
  Usuário submete credenciais
        ↓
  POST /api/auth/login
        ↓
  Backend valida credenciais no DB
        ↓
  Se válido: Gera JWT token
        ↓
  Envia token em HttpOnly cookie
        ↓
  Redireciona para /home
        ↓
  Header atualizado com dados do usuário

LOGOUT:
  Usuário clica "Logout"
        ↓
  Header.js limpa cookie JWT
        ↓
  POST /api/auth/logout (opcional)
        ↓
  Redireciona para /login
```

## 📁 Hierarquia de Componentes

```
Root (layout.js)
│
├─ page.js (Home)
│  ├─ Header
│  │  ├─ Logo
│  │  ├─ Nav Links
│  │  ├─ Mobile Menu
│  │  └─ Logout Button
│  ├─ Main Content
│  │  ├─ Welcome Section
│  │  ├─ Stats Cards
│  │  ├─ PDFUpload
│  │  ├─ History Section
│  │  └─ Quick Start
│  └─ Footer
│     ├─ Project Info
│     ├─ Documentation Links
│     ├─ Support
│     └─ Social
│
├─ profile/page.js
│  ├─ Header
│  ├─ Profile Form
│  └─ Footer
│
├─ configuracao/page.js
│  ├─ Header
│  ├─ Settings Sections
│  │  ├─ General
│  │  ├─ Notifications
│  │  ├─ Security
│  │  └─ Danger Zone
│  └─ Footer
│
└─ login/page.js
   ├─ Logo
   ├─ Login Form
   ├─ Footer
   └─ Sign Up Link
```

## 🔄 Estado Global (Recomendado)

```javascript
// Context/authContext.js
{
  user: {
    id: string,
    name: string,
    email: string,
    role: 'user' | 'admin',
    avatar: string
  },
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null
}

// Context/documentsContext.js
{
  documents: Document[],
  selectedDocument: Document | null,
  isLoading: boolean,
  error: string | null
}

// Context/uiContext.js
{
  darkMode: boolean,
  sidebarOpen: boolean,
  notifications: Notification[],
  theme: 'light' | 'dark'
}
```

## 💾 Estrutura de Dados do Banco

### Tabela: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER,
  content_text TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: conversations
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  document_id UUID REFERENCES documents(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: reports
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  document_id UUID REFERENCES documents(id),
  content TEXT,
  format VARCHAR(50), -- 'pdf', 'docx', 'html'
  file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Princípios de Design

### 1. Responsividade
- Mobile First
- Breakpoints: 640px, 768px, 1024px, 1280px
- Grid e Flexbox

### 2. Accessibilidade
- Semântica HTML
- ARIA labels
- Contraste de cores
- Teclado navegável

### 3. Performance
- Code splitting
- Image optimization
- Lazy loading
- Caching

### 4. Segurança
- Validação de entrada
- HTTPS only
- CSRF protection
- XSS prevention

## 🚀 Roteiro de Desenvolvimento

### Fase 1: MVP (Semana 1-2)
- ✅ Frontend páginas básicas
- ✅ Estrutura de componentes
- ⚠️ Autenticação básica
- ⚠️ Upload de arquivos

### Fase 2: Backend (Semana 3-4)
- [ ] API endpoints completos
- [ ] Database setup
- [ ] Processamento de PDF
- [ ] Autenticação JWT

### Fase 3: Integração IA (Semana 5-6)
- [ ] NLP model integration
- [ ] Chat interface
- [ ] Geração de relatórios
- [ ] Histórico inteligente

### Fase 4: Polish (Semana 7-8)
- [ ] Testes
- [ ] Performance
- [ ] Documentação
- [ ] Deploy

## 📊 Métricas de Sucesso

- ⏱️ Tempo de carregamento < 2s
- 📱 100% Responsivo
- ♿ Accessibility Score > 90
- 🔒 Security Score = A
- 📈 Lighthouse Score > 85

---

**Arquitetura Versão**: 1.0.0  
**Última Atualização**: Abril 14, 2024
