# Login page

## Objective
Permitir que o usuário acesse o sistema de forma segura utilizando autenticação JWT com cookies HttpOnly.

## Features
- Formulário com campos de email e senha.
- Validação de credenciais no backend.
- Geração de JWT e armazenamento em cookie HttpOnly.
- Redirecionamento para página Home após login.

## Flow
1. Usuário acessa `/login`.
2. Preenche email e senha.
3. API valida credenciais.
4. JWT é gerado e armazenado em cookie.
5. Usuário é redirecionado para `/home`.

## Considerations
- Exibir mensagens de erro em caso de falha.
- Implementar middleware para proteger rotas.