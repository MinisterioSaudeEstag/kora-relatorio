# Data model

## User
- id (UUID)
- nome
- email
- senha (hash)
- data_criacao

## Document
- id (UUID)
- userId (FK)
- nome_arquivo
- caminho_armazenamento
- data_upload

## Question/Answer
- id (UUID)
- userId (FK)
- documentoId (FK)
- pergunta (string)
- resposta (string)
- data_criacao