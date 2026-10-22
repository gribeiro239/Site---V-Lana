# V’Lana — operação de pedidos e pagamentos

## Estado atual

Site público preservado. Checkout e gestão acrescentados no mesmo Site.

- `/checkout`: demonstração de solicitação com retirada ou entrega local em Campinas.
- `/pedido`: consulta do último pedido real feito neste navegador, com um token privado de acesso.
- `/gestao`: pedidos e estoque para a conta proprietária, autenticada pelo Sites.
- Modo padrão: `demo`. Os dados do formulário não são transmitidos e não há pedido nem pagamento real.
- Produtos, preços e composição continuam ilustrativos. Estoque real começa zerado.

Retirada: Rua Londres, 410, Parque São Quirino, Campinas — SP. Horário informado: 8h às 17h. Dias de atendimento ainda precisam ser confirmados.

## Fluxo preparado

1. Em modo ativo, o servidor valida carrinho, preços, tamanho, contato e área de entrega.
2. Registra um pedido e reserva as peças atomicamente. A mesma tentativa não registra duas compras.
3. A proprietária confere disponibilidade, combina prazo e informa o frete em `/gestao`. Retirada tem frete zero.
4. A cliente volta a `/pedido` no navegador da solicitação, confere o total e decide continuar ao Mercado Pago.
5. Uma preferência Checkout Pro é criada pelo servidor. A cliente paga no ambiente do provedor.
6. O webhook valida assinatura, consulta o pagamento pela API e confere vendedor, valor, moeda e ambiente antes de marcar como pago.
7. A proprietária marca o pedido pago como pronto e depois como entregue/retirado.

Ainda não há envio automático de e-mail ou WhatsApp. O acompanhamento é pela página do pedido e pelo painel. Não há conta de cliente nem histórico entre dispositivos. O token de acompanhamento fica apenas no navegador da cliente; sua hash fica no banco. Dados pessoais do pedido não são retornados na consulta pública.

## Próxima etapa: conta Mercado Pago

1. A proprietária cria e verifica sua conta diretamente no Mercado Pago, sem compartilhar senha aqui.
2. Em Mercado Pago Developers, cria a aplicação de Checkout Pro e prepara os usuários/credenciais de teste conforme a documentação atual da conta.
3. Configurar **segredos**, nunca código público: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `MP_COLLECTOR_ID`. O ID do vendedor é conferido em cada pagamento. Não colar esses valores em conversas, fontes ou Git.
4. Configurar notificações de pagamentos para `https://vlana-activewear.famousotter4.chatgpt.site/api/webhooks/mercadopago`.
5. Ativar `STORE_MODE=test`, publicar e verificar o fluxo real do provedor. O código usa `sandbox_init_point` neste modo. Testar também notificações pelo painel do provedor: notificações de compras com certas credenciais de teste podem não ser emitidas automaticamente.
6. Confirmar dados de catálogo, fotos, preços, composição, estoque e dias de retirada. Confirmar canal de atendimento e informações comerciais antes da abertura.
7. Somente após o teste completo e solicitação explícita da proprietária: configurar credenciais de produção, `CATALOG_CONFIRMED=1` e `STORE_MODE=live`, atualizar a comunicação da vitrine e publicar.

Sem conta e credenciais, não é possível comprovar aprovação de pagamentos reais nem concluir a validação externa. Nenhuma conta foi criada nesta implementação.

## Operação e limites desta primeira etapa

- A vitrine consulta a disponibilidade por tamanho em `/api/store`, ao abrir a página, abrir a sacola ou voltar à aba. A resposta pública limita a quantidade informada a 10 por variante e não inclui pedidos nem dados pessoais. O estoque é novamente validado de forma atômica ao registrar o pedido.
- Tamanhos sem estoque ficam bloqueados nos detalhes e no montador. Se a disponibilidade diminuir, a sacola mantém os itens para revisão e bloqueia a continuação até ajustar as quantidades. Falhas de consulta não são tratadas como estoque disponível.
- No modo demo, os tamanhos são ilustrativos; nenhum estoque real é anunciado. O guia explica como medir o corpo, mas a tabela numérica depende das medidas reais de cada peça.
- Frete nunca é tratado como grátis quando ainda está a combinar. A cliente precisa ver o total confirmado antes de pagar.
- Estoque do painel significa unidades disponíveis para novos pedidos, já descontadas as reservas.
- Solicitações sem checkout iniciado podem ser canceladas no painel, liberando a reserva uma única vez.
- Depois de iniciar o checkout, não liberar estoque manualmente antes de conferir o pagamento. Não existe expiração automática de reserva nesta versão.
- Uma falha de rede durante criação da preferência deixa o pedido em `payment_started` para evitar gerar duas cobranças. É preciso conciliar no Mercado Pago antes de uma recuperação manual.
- Não oferecer pagamento dividido em duas modalidades nesta primeira integração. O tratamento atual espera um pagamento integral por pedido; pagamentos parciais não liberam mercadoria.
- Reembolsos e contestações recebidos são refletidos no status, mas não repõem estoque automaticamente: a loja precisa conferir devolução física e ajustar o disponível.
- Autenticação de gestão depende dos headers confiáveis do Sites. Não disponibilizar esse Worker diretamente em um host que aceite headers de identidade fornecidos pelo cliente.
- Antes de vendas reais, completar revisão operacional: notificações de atendimento, conciliação de falhas, limites contra solicitações abusivas, retenção de dados e testes externos com a conta do provedor.

## Arquitetura e validação

`public/`: vitrine e telas. `server/commerce.mjs`: API. D1 `DB`: variantes, pedidos e itens; migração em `drizzle/0000_commerce.sql`. Imagens existentes são preservadas e incorporadas ao Worker por `scripts/build.mjs`.

- `node --test tests/commerce.test.mjs`: testes com SQLite real em memória, API do provedor simulada.
- `node scripts/build.mjs`: gera `dist/server/index.js`, Worker ESM com `fetch`.
- `node scripts/preview.mjs`: prévia local de demonstração. Não simula identidade de proprietária.
- Publicação: Sites aplica a migração e conecta o banco. As credenciais permanecem no ambiente do serviço.

Documentação oficial consultada:
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/overview
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/create-payment-preference
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications
