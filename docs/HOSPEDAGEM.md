# Hospedagem

## Ambiente atual

A aplicação foi preparada para o Sites, que executa o Worker gerado em `dist/server/index.js`, aplica as migrações SQL de `drizzle/` e disponibiliza um banco D1 no binding `DB`.

O manifesto `.openai/hosting.json` identifica o projeto atual. O identificador não é uma credencial; ao usar outra instância do Sites, o manifesto precisa corresponder ao projeto de destino.

## Configuração

| Nome | Uso |
| --- | --- |
| `STORE_MODE` | `demo` por padrão; `test` para testes do provedor; `live` para produção |
| `STORE_ORIGIN` | Origem HTTPS da loja, também usada nos retornos e notificações de pagamento |
| `STORE_ADMIN_EMAIL` | E-mail da proprietária autorizada no painel |
| `MP_ACCESS_TOKEN` | Credencial secreta da API do Mercado Pago |
| `MP_WEBHOOK_SECRET` | Segredo de validação das notificações |
| `MP_COLLECTOR_ID` | Identificador do vendedor esperado nos pagamentos |
| `CATALOG_CONFIRMED` | `1` somente após confirmar o catálogo real; necessário para modo live |
| `DB` | Binding de banco D1, configurado pela hospedagem |

Use `.env.example` apenas como referência. Os scripts locais não carregam esse arquivo. Cadastre valores e segredos no ambiente da hospedagem, sem colocá-los no código ou no Git.

## Validação antes de publicar

1. Execute `npm test` com Node.js 24 ou superior.
2. Confirme o manifesto e a origem do projeto de destino.
3. Publique pelo Sites e confira as quatro rotas, os arquivos públicos e `/api/store`.
4. Em demonstração, confira `mode: "demo"` e `active: false` em `/api/store`.
5. Para testar pagamentos, siga o roteiro de `COMMERCE.md`; os testes automatizados usam um provedor simulado.

O workflow do GitHub valida o código, sem realizar deploy ou configurar credenciais.

## Migração de hospedagem

O painel confia nos headers `oai-authenticated-user-email` e `oai-authenticated-user-id` inseridos pelo Sites. Em outro host, é necessário substituir essa autenticação ou garantir que a infraestrutura autentique a pessoa e remova/substitua headers de identidade enviados pelo cliente. Não exponha o Worker diretamente confiando nesses headers recebidos da internet.

Também é necessário preparar o banco D1 ou adaptar a camada de dados, aplicar as migrações, configurar HTTPS e origem, registrar a URL do webhook e testar o fluxo completo.

GitHub Pages pode servir arquivos estáticos, mas não oferece a infraestrutura necessária para executar esta loja completa.
