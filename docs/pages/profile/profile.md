# Profile page

## Objective
Exibir e permitir edição das informações do usuário.

## Features
- Exibir nome, email e foto do usuário.
- Opção de editar dados (nome, senha).
- Integração com banco de dados para persistência.

## Flow
1. Usuário acessa `/perfil`.
2. Dados são carregados do banco.
3. Usuário pode editar e salvar alterações.
4. Alterações são validadas e persistidas.

## Considerations
- Garantir segurança ao atualizar senha.
- Validar dados antes de salvar.