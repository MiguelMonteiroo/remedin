# Privacidade e declarações do Remedin

## Fonte e responsáveis

- Texto único: `src/legal/privacy.json`, exibido offline em Perfil > Privacidade e uso.
- Responsável: Miguel de França Monteiro.
- Contato público: monteiro.miguel9752@gmail.com.
- Página estática gerada: `privacy-site/index.html`.
- URL prevista após ativar Pages: https://MiguelMonteiroo.github.io/remedin/.
- A URL prevista só deve ser cadastrada no Play Console depois de retornar HTTP 200 e exibir a política sem login.

## Publicação no GitHub Pages

1. Enviar os arquivos ao GitHub quando revisados.
2. No repositório, abrir Settings > Pages > Build and deployment e selecionar GitHub Actions.
3. Em Actions, executar manualmente o workflow `Publish privacy policy` na branch que contém estes arquivos.
4. Conferir a URL pública pelo celular e sem login. Não usar a URL de edição do arquivo nem um PDF.
5. Cadastrar a URL em Play Console > Conteúdo do app > Política de privacidade e na ficha da loja.

O workflow publica somente `privacy-site/`, sem código do app, dados locais, chaves ou logs. Se o repositório for privado e o plano não oferecer Pages, hospedar a mesma pasta em um repositório público dedicado e atualizar `publicUrl`.

Para alterar o texto, editar o JSON e executar `node scripts/build-privacy-site.mjs`. O workflow também gera a página automaticamente antes da publicação. Revalidar as declarações ao adicionar bibliotecas, servidores, analytics, publicidade ou backup.

## Data Safety: respostas propostas para a versão atual

Estas respostas descrevem o código revisado em 25/11/2026; conferir o AAB final e seus SDKs antes de enviar.

| Pergunta | Resposta proposta e justificativa |
| --- | --- |
| O app coleta ou compartilha os tipos de dados exigidos? | Não. Nome, avatar e dados de medicamentos são processados somente no dispositivo; não há transmissão para desenvolvedor ou terceiros pelo app. O Google distingue processamento local de coleta fora do dispositivo. |
| Há criação de conta? | Não. O nome do perfil é local e não cria conta online. |
| Há venda de dados ou publicidade? | Não. |
| Criptografia em trânsito | Não declarar criptografia do banco nem inventar transmissão. Seguir as perguntas aplicáveis que o formulário mostrar após informar ausência de coleta. |
| Exclusão de dados | Dados locais podem ser removidos nas configurações Android (Limpar dados) ou na desinstalação sem manter dados. Não há conta ou cópia de servidor a excluir. |
| Política de privacidade | Usar a URL pública verificada acima. |

A política descreve os dados locais mesmo que eles não sejam classificados como coleta no formulário. A visita ao site tem o tratamento técnico do GitHub; mensagens de suporte enviadas voluntariamente são recebidas pelo responsável e pelo provedor de e-mail. Não usar respostas de Data Safety de uma versão debug conectada ao Metro como descrição da versão de produção.

## Declaração de saúde e descrição da loja

Declarar a funcionalidade real de organização de medicamentos, lembretes e registros de doses. Selecionar as categorias correspondentes no formulário atual; não declarar Health Connect, diagnóstico, prescrição, dispositivo médico ou funcionalidades inexistentes.

Incluir na descrição completa da loja:

> O Remedin organiza medicamentos, horários e registros pessoais de doses. Não é um dispositivo médico e não diagnostica, trata, cura ou previne doenças ou outras condições de saúde. Consulte um profissional de saúde para orientação, diagnóstico ou tratamento. Não altere doses ou horários prescritos com base no aplicativo. Os lembretes dependem das permissões e configurações do aparelho e não substituem o acompanhamento do seu tratamento.

O aviso também está visível no Perfil e na tela de privacidade. As declarações de tela cheia e foreground service continuam em `docs/legal/google-play-alarm-declarations.md`.

## Verificação antes do envio

- Política abre offline no app; contato é selecionável e falha ao abrir e-mail tem mensagem legível.
- Política pública acessível sem login, sem bloqueio geográfico, sem PDF e com contato correto.
- AAB release sem SDKs de analytics, anúncios ou transmissão não documentada.
- Backup/transferência Android continuam desativados e exclusão local funciona.
- Política, ficha da loja e formulários descrevem o mesmo comportamento.
- Responsável revisou os textos e enviou as declarações no Play Console; documentação local não equivale ao envio.

## Fontes

- [Política de apps de saúde](https://support.google.com/googleplay/android-developer/answer/16679511?hl=en)
- [Data Safety e processamento somente local](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- [Política de dados do usuário](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en)
