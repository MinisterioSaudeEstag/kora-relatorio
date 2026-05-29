# System navigation

## Objective
Definir o fluxo de navegação entre as páginas principais do sistema, garantindo uma experiência clara e consistente para o usuário.

---

## General flow
1. **Login**
   - Página inicial do sistema.
   - Usuário insere credenciais.
   - Se válido → redireciona para **Home**.
   - Se inválido → mensagem de erro.

2. **Home**
   - Página principal após login.
   - Exibe **Header**, **Perfil**, **Configurações** e **Footer**.
   - Acesso direto às funcionalidades:
     - Chat
     - Upload de documentos
     - Perfil do usuário
     - Configurações

3. **Header**
   - Navegação global.
   - Links: Home | Perfil | Configurações | Logout.
   - Logout → redireciona para **Login**.

4. **Profile**
   - Exibe dados do usuário.
   - Opção de editar informações.
   - Retorno para Home via Header.

5. **Config**
   - Ajustes de preferências (tema, idioma, senha).
   - Retorno para Home via Header.

6. **Chat**
   - Caixa de texto para perguntas.
   - Exibição das respostas da IA.
   - Histórico de interações.
   - Integração com Upload.

7. **Upload**
   - Upload de PDFs.
   - Validação e armazenamento.
   - Documento disponível para consultas no Chat.

8. **Footer**
   - Links para documentação e suporte.
   - Exibido em todas as páginas.

---

## Considerations
- Todas as páginas (exceto Login) exigem autenticação JWT.
- Navegação deve ser responsiva e intuitiva.
- Cookies HttpOnly garantem segurança na sessão.
- Header e Footer são componentes fixos presentes em todas as páginas autenticadas.

## Priority order
1. Home
2. Login  
3. Upload  
4. Chat  
5. Perfil  
6. Configurações  
7. Footer
