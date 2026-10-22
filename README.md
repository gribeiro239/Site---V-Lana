# V’Lana — Activewear

A V’Lana é um projeto de loja virtual de moda fitness feminina. A proposta foi criar uma experiência que vai além de apresentar as peças: a pessoa pode conhecer a coleção, montar suas próprias combinações e adicionar o look completo à sacola, escolhendo o tamanho de cada item.

O projeto começou pela vitrine e foi ampliado com novas peças, imagens de campanha e um fluxo de checkout, além da estrutura de pedidos, estoque e pagamentos no backend.

## O que foi desenvolvido

A interface ganhou uma identidade visual em tons de oliva, com tipografia de destaque e uma apresentação voltada para as imagens da coleção. O layout se adapta a celulares e computadores, e a navegação reúne a coleção, o montador de looks e a apresentação da marca.

Na vitrine, foram implementados:

- Catálogo com 12 peças e detalhes de cada produto, incluindo preço, cor, composição ilustrativa e seleção de tamanho.
- Busca por nome, categoria ou cor, filtros combinados por categoria, cor, tamanho e faixa de preço, com ordenação por nome ou valor.
- Guia com orientações para medir busto, cintura e quadril. A tabela de medidas por tamanho aguarda os dados reais da coleção.
- Consulta de disponibilidade por tamanho, com bloqueio de tamanhos esgotados e revisão de quantidades na sacola quando a loja está ativa. Na demonstração, os tamanhos ficam identificados como ilustrativos.
- Montador de looks com escolha de top, base e camada adicional, além de combinações sugeridas.
- Sacola com alteração de quantidades, remoção de itens e cálculo do subtotal.
- Persistência da sacola no navegador com `localStorage`.
- Checkout demonstrativo com opções de retirada e entrega local em Campinas.
- Imagens de campanha criadas com IA e conversão das duas imagens maiores para WebP, reduzindo seu peso em cerca de 96%.

No backend, foi preparada uma API para validar os preços do carrinho, registrar pedidos e reservar estoque por peça e tamanho. Também foram desenvolvidos o painel de gestão, a confirmação do frete e a integração com o Checkout Pro do Mercado Pago, incluindo a validação das notificações de pagamento.

**A loja está em demonstração.** Produtos, preços e composições são ilustrativos. No modo padrão, o checkout não envia os dados preenchidos nem gera pedidos ou cobranças reais. A estrutura de comércio depende da configuração do ambiente e dos testes com a conta da loja para entrar em operação.

## Tecnologias utilizadas

| Tecnologia | Como foi utilizada |
| --- | --- |
| **HTML5** | Estrutura das páginas, formulários e janelas de detalhes e sacola |
| **CSS3** | Identidade visual, layouts com Grid e Flexbox, responsividade e estados de interação |
| **JavaScript** | Catálogo interativo, montagem de looks, sacola e comunicação com a API |
| **Node.js 24+** | Scripts de build, servidor de prévia local e execução dos testes |
| **Worker com Fetch API** | Backend de pedidos, estoque e pagamentos |
| **D1 / SQLite** | Armazenamento de variantes, pedidos e itens, com migrações SQL |
| **Mercado Pago Checkout Pro** | Integração preparada para criar sessões de pagamento e conferir notificações por webhook |
| **Sites** | Ambiente de hospedagem previsto para o Worker, banco D1 e autenticação da gestão |
| **GitHub Actions** | Execução automática do build e dos testes a cada push ou pull request |

O frontend foi feito com HTML, CSS e JavaScript puro. Os scripts e testes usam recursos nativos do Node.js, sem dependências npm externas.

## Como executar

Com **Node.js 24 ou superior** e npm instalados:

```sh
git clone https://github.com/gribeiro239/Site---V-Lana.git
cd Site---V-Lana
npm run dev
```

Depois, abra [http://127.0.0.1:4173](http://127.0.0.1:4173).

A prévia local permite explorar a vitrine e o checkout de demonstração. Ela não simula o banco, a autenticação da proprietária ou pagamentos reais, e não carrega arquivos `.env` automaticamente.

## Testes e build

```sh
npm test
```

Esse comando gera o Worker e executa os testes automatizados. Eles verificam a consistência do catálogo, a reserva e liberação de estoque, a validação dos pedidos, as restrições de acesso e o tratamento das notificações de pagamento. O Mercado Pago é simulado nos testes; a validação com o serviço real ainda precisa ser feita.

Para gerar apenas os arquivos de publicação:

```sh
npm run build
```

O resultado fica em `dist/`. O GitHub Actions também executa o build e os testes automaticamente, sem fazer deploy.

## Organização do projeto

```text
public/             Páginas, estilos, scripts do navegador e imagens
server/             API de pedidos, estoque e pagamentos
drizzle/            Migrações SQL do banco
scripts/            Build e servidor de prévia local
tests/              Testes automatizados
docs/               Prévia visual e documentação de hospedagem
.openai/            Manifesto de hospedagem do Sites
.github/workflows/  Workflow de build e testes
```

As principais páginas são a vitrine (`/`), o checkout (`/checkout`), o acompanhamento do último pedido feito no navegador (`/pedido`) e a gestão da loja (`/gestao`). O painel de gestão exige autenticação da proprietária pelo Sites.

## Hospedagem e próximos passos

A aplicação foi preparada para rodar no Sites, com um Worker e banco D1. O GitHub guarda o código e executa as verificações automáticas. Para hospedar a loja completa em outro ambiente, será necessário adaptar o banco e a autenticação administrativa; o GitHub Pages sozinho não executa esses serviços.

As configurações esperadas estão em [`.env.example`](.env.example), sem credenciais. Os valores reais devem ser cadastrados no ambiente de hospedagem.

Para transformar a demonstração em uma loja em operação, os próximos passos são confirmar o catálogo e o estoque reais, validar o fluxo completo com o Mercado Pago, adicionar notificações de atendimento e melhorar a recuperação de pedidos e pagamentos interrompidos. Também estão previstas a expiração de reservas, medidas contra solicitações abusivas e uma revisão de acessibilidade e das informações de atendimento, privacidade, entrega e trocas.

Mais detalhes estão na [documentação de hospedagem](docs/HOSPEDAGEM.md), nas [notas de operação e pagamentos](COMMERCE.md) e no [registro das imagens da coleção](COLLECTION-IMAGES.md).
