# V’Lana — Activewear

Loja conceito de moda fitness feminina, com vitrine responsiva, coleção de 12 peças, montador de looks, sacola e checkout de demonstração.

![Vitrine da V’Lana](docs/vitrine.jpg)

Prévia visual da versão inicial da vitrine.

**Estado atual: demonstração.** Produtos, preços e composição são ilustrativos. Há imagens criadas com IA. No modo padrão, o checkout não transmite os dados do formulário nem cria pedidos ou cobranças reais.

## Executar localmente

Requisito: **Node.js 24 ou superior**, com npm. O projeto usa APIs nativas do Node, incluindo `node:sqlite` nos testes, e não tem dependências npm externas.

```sh
git clone https://github.com/gribeiro239/Site---V-Lana.git
cd Site---V-Lana
npm run dev
```

Abra http://127.0.0.1:4173. A prévia local funciona em modo demo; não simula banco, autenticação da proprietária ou pagamentos reais. Ela não carrega automaticamente arquivos `.env`.

```sh
npm test       # Gera o Worker e executa os testes
npm run build # Gera somente o Worker em dist/
```

O GitHub Actions executa build e testes em pushes e pull requests. Os testes verificam catálogo, estoque, pedidos, autorização, notificações de pagamento e o Worker gerado. A API do Mercado Pago é simulada: esses testes não comprovam pagamentos reais.

## Funcionalidades e rotas

| Rota | Finalidade |
| --- | --- |
| `/` | Coleção, detalhes das peças, looks e sacola |
| `/checkout` | Demonstração de retirada ou entrega local em Campinas |
| `/pedido` | Acompanhamento do último pedido pelo token guardado no navegador |
| `/gestao` | Painel de pedidos e estoque, com autenticação da proprietária pelo Sites |

O backend prepara validação de preços, reserva atômica de estoque, confirmação de frete e integração com Checkout Pro do Mercado Pago. Sua ativação depende da configuração do ambiente e da validação operacional.

## Estrutura

```text
public/           Vitrine, telas, estilos e imagens
server/           API de comércio para Worker
drizzle/          Migrações SQL do banco D1
scripts/          Build e prévia local
tests/            Testes com SQLite em memória e provedor simulado
.openai/          Manifesto de hospedagem do Sites
.github/workflows/ Verificação automática
docs/             Prévia e documentação de hospedagem
```

## Hospedagem e configuração

O destino atual é **Sites**, com Worker e banco D1 vinculado como `DB`. O build incorpora as imagens e os arquivos públicos ao Worker. Consulte [Hospedagem](docs/HOSPEDAGEM.md) e [Operação de pedidos e pagamentos](COMMERCE.md).

GitHub armazena e verifica o código. **GitHub Pages não executa a API, o banco ou a autenticação deste projeto.** Migrar a loja completa para outro host exige adaptar esses serviços, principalmente a autenticação administrativa.

[`.env.example`](.env.example) lista os nomes das configurações, sem credenciais. Configure os valores no ambiente de hospedagem. Nunca versione tokens, segredos ou dados de clientes.

## Próximas etapas para operação comercial

- Confirmar catálogo real, fotos, composição, preços, tamanhos e estoque.
- Validar pagamentos e notificações com a conta Mercado Pago da loja em ambiente de teste antes da produção.
- Definir notificações de atendimento e recuperação do acompanhamento em outro navegador.
- Implementar expiração de reservas e recuperação de pagamentos interrompidos com conciliação no provedor.
- Adicionar limites contra solicitações abusivas, acompanhamento de falhas e rotina de backup/restauração.
- Completar informações de atendimento, entrega, retirada, privacidade e trocas.
- Fazer revisão visual em dispositivos móveis, navegação por teclado e leitores de tela.

Os limites atuais estão descritos em [COMMERCE.md](COMMERCE.md). Os registros das imagens adicionais estão em [COLLECTION-IMAGES.md](COLLECTION-IMAGES.md).
