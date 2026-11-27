# Validacao E2E Android - 26/11/2026

## Escopo E Isolamento

Testes reais de interface com UI Automator, SQLite e servicos de lembretes do
aplicativo, sem fixtures de banco ou Metro. O APK empacotado usa
`com.remedin.e2e`; o driver independente usa `com.remedin.e2e.driver`.
O pacote normal `com.remedin` nao e limpo nem substituido.

A rodada partiu de `db0c358` e testou alteracoes locais, sem commit ou push
automatico nesta etapa. Os comandos reproduziveis estao em [E2E Android](../../e2e/README.md).

## Matriz

| Perfil | API / Android | Resolucao / densidade | Tamanho aproximado | Pagina |
| --- | --- | --- | --- | --- |
| Compacto | 33 / 13 | 720x1600 / 320 | 360x800 dp | 4 KB |
| Padrao | 34 / 14 | 1080x2400 / 440 | 393x873 dp | 4 KB |
| Grande | 36 / 16 | 1080x2400 / 420 | 411x914 dp | 4 KB |
| Emulador existente | 37 | 1080x2400 / 420 | 411x914 dp | 16 KB |

Escalas de fonte: 100%, 130% e 150%. Todas as imagens sao do Google, x86_64.
Um perfil com dimensoes de outro aparelho nao reproduz HyperOS, One UI nem as
restricoes de bateria de fabricantes. Nao ha validacao de Xiaomi/Samsung real.

## Cenarios

1. Primeiro acesso: nome obrigatorio, retomada apos encerrar o processo,
   recusa de notificacoes e confirmacao explicita para seguir sem lembretes.
2. Cadastro, edicao, intervalo, dias da semana, pausa, reativacao e exclusao.
3. Wheel: loop de minutos, acessibilidade e preservacao do horario salvo.
4. Tomar, pular, desfazer e preservar o registro apos reiniciar o processo.
5. Adiar cinco minutos: horario efetivo na Home e horario original nos detalhes.
6. Tres cadastros consecutivos sem inventar doses para dias anteriores.
7. Perfil: nome, avatar persistido e contatos publicos de privacidade.
8. Dois pre-avisos imediatos para horarios diferentes: canal silencioso, sem
   vibracao configurada, sem servico de audio; toque abre o aplicativo normal.
9. Teste nativo: uma unica notificacao real, tela de teste e encerramento do servico.
10. Alarme real com processo morto, PIN, lockscreen, desbloqueio e tomada da dose.

O resumo automatico de grupo criado pelo Android nao e contado como uma segunda
notificacao de dose. O teste de pre-aviso usa medicamentos cadastrados dentro da
janela de cinco minutos; nao prova a entrega de um trigger cinco minutos antes
em todos os estados de energia.

## Defeitos Corrigidos

### Desfazer Dose Tomada

`CareCompletedDoseRow` recebia callback de desfazer para dose tomada, mas so
renderizava o botao quando a dose era pulada. Agora o callback habilita ambas
as acoes, com label e hint acessiveis e bloqueio durante a operacao.
Regressao coberta por teste de componente e pelo fluxo E2E de tomada/restart.

### Linha Registrada Em Tela Pequena Ou Fonte Grande

Horario, icone e botao de desfazer podiam consumir toda a largura, deixando o
nome/status vertical ou produzindo um grande card vazio. A acao passa para uma
linha propria abaixo de 390 dp ou a partir de 130% de fonte. A dosagem ausente
nao e repetida como parte do nome. Testes de componente cobrem os dois limites.

### Limiar De Fonte Em 130%

O Android pode transportar 130% como `1.2999999523162842`, por usar Float no
modulo nativo. Comparar diretamente com `1.3` impedia o layout acessivel e o
label curto da aba Medicamentos. `isLargeText` compara a porcentagem arredondada,
com regressao para esse valor real, 100%, 115%, 130% e 150%.

Nao foram alterados banco, migrations, agendamentos, audio ou contratos nativos.

### Ajustes Rapidos Do Wheel Por Acessibilidade

Acoes rapidas reproduziram um quarto defeito: o horario podia voltar a um valor
anterior quando terminava uma animacao programatica de momentum. O ajuste por
acessibilidade agora alinha a coluna sem iniciar essa animacao e cancela o
fallback pendente de arraste. A rolagem manual e o desenho permanecem iguais.
Um novo teste de componente falhou antes da correcao e passou depois; o mesmo
helper nativo rapido e usado para revalidar o comportamento no APK corrigido.

## Evidencias E Resultados

A matriz inicial percorreu as 12 combinacoes de API e fonte, com dez cenarios
por combinacao. Ela terminou com falhas, incluindo problemas de preparacao e
rolagem do proprio driver. As tentativas foram preservadas e nao devem ser
apresentadas como uma unica matriz verde: houve retestes dirigidos e mudancas
no APK e no driver durante a investigacao.

Nos retestes anteriores ao ultimo APK, passaram seis casos pendentes da API 33
em 100%, os casos de edicao semanal/perfil/dose em 130% e 150% nas APIs 33/34/36
(com uma repeticao isolada do Perfil em API 33/150%), e as suites completas de
dez casos em API 34/150%, API 36/100% e API 37/100% e 150%.

O APK final, que tambem corrige o wheel, passou em cinco execucoes limpas:

| API / fonte | Cenarios no APK final | Resultado | ID UTC da evidencia em 2026-11-27 |
| --- | --- | --- | --- |
| 33 / 150% | Wheel ciclico e dose/tomada/pular/desfazer/restart/historico | 2/2 | `01-48-44-432Z-emulator-5560-font1.5` |
| 34 / 100% | Wheel ciclico e permissoes/adiamento/horario original | 2/2 | `01-41-13-485Z-emulator-5562-font1.0` |
| 36 / 100% | Wheel ciclico e alarme real com processo morto/PIN | 2/2 | `01-43-08-802Z-emulator-5564-font1.0` |
| 37 / 130% / 16 KB | Suite completa dos dez cenarios rapidos | 10/10 | `01-40-28-453Z-emulator-5554-font1.3` |
| 37 / 150% / 16 KB | Dois pre-avisos independentes silenciosos e abertura normal | 1/1 | `01-47-14-729Z-emulator-5554-font1.5` |

Total do APK final: **17 execucoes de cenarios aprovadas, zero falhas e zero ignorados**, com
coleta de evidencias e limpeza bem-sucedidas. Nao foram reexecutadas integralmente
as 12 combinacoes com esse ultimo APK; os demais resultados pertencem aos
artefatos anteriores, identificados por hash nos metadados.

Os checks de codigo passaram: TypeScript, 263 testes Jest em 53 suites e tres
testes Node do parser E2E. Foram compilados o APK E2E empacotado, o driver de
instrumentacao e o APK debug normal sem `-Pe2e`.

O APK usado nos retestes de layout e na retomada tem SHA-256
`1bde53e67ca7f6943d359298708c0cbd53b89b963ae81bf5454ced1bd0662853`.
O hash do driver varia entre investigacoes e fica registrado por execucao.
O APK final, incluindo a correcao do wheel, tem SHA-256
`834ac1e0e10444d26f6162f3785b845ebc238811902f5513ca5f11eb104dd271`.

O alarme real passou na API 36 com processo encerrado por `am kill`, PIN
temporario e keyguard conferido antes e depois da apresentacao. Ele continuou
visivel depois do desbloqueio e a tomada levou a Home. Nao foi usado
`force-stop` para simular entrega. O PIN temporario foi removido em `finally`.

Esse caso optou explicitamente por mostrar detalhes. Com detalhes ocultos,
foi preservada a regra atual de privacidade, que nao revela automaticamente o
conteudo da dose apos desbloquear. O fluxo completo de tomada desse caso nao
deve ser interpretado como cobertura do modo privado.

## Rastreabilidade

O driver tambem foi endurecido durante a investigacao: aguarda o fechamento de
dialogos nativos, usa rolagem de acessibilidade no container externo para nao
girar o wheel interno, fecha a central de notificacoes entre cenarios e falha
se a captura de evidencia nao puder ser produzida. O runner rejeita zero testes,
resultados incompletos e testes ignorados. Erros de configuracao e encerramento
de AVDs tambem fazem a matriz falhar.

Outra falha de preparacao foi confirmada no log Android: a limpeza assincrona
de dados removia a Activity que o driver acabava de iniciar. A preparacao passou
a aguardar a estabilizacao apos `pm clear` e conferir o resultado de `am start`.
O app nao e relancado automaticamente para esconder um crash.

Evidencias brutas ficam apenas em `e2e/artifacts/`, ignorado pelo Git. Cada
execucao registra APK/driver SHA-256, commit, working tree sujo, API, modelo,
fingerprint, dimensoes, densidade, pagina, fonte e resultados por cenario.
Os runs mais recentes tambem registram horario e desvio de relogio do dispositivo.
Capturas e hierarquia de interface incluem estados de falha e sucesso.

Os logs podem conter notificacoes de outros aplicativos; nao publicar os arquivos
brutos sem revisao. Apenas o relatorio resumido e versionado.

## Limites E Pendencias

- Validar em aparelhos fisicos Xiaomi/HyperOS e Samsung/One UI, incluindo ARM.
- Conferir som audivel, vibracao percebida e uso real com TalkBack.
- Executar DND/silencioso/Doze, reboot, revogacao de permissoes e mudanca de fuso.
- A permissao runtime de notificacoes e respondida na UI real do Android.
  Horario exato e tela cheia sao concedidos via `appops` no driver; os redirects
  para configuracoes do sistema e todas as permissoes opcionais precisam de QA manual.
- Observar lembretes apos 48 horas e repetir casos criticos tres vezes por perfil.
- Testar API 24 a 32; a matriz atual comeca em 33.
- A imagem API 37 e uma imagem de teste, nao substitui cobertura de Android estavel.
- Foi observado desvio de relogio no emulador existente durante a rodada inicial.
  Na retomada, seu desvio medido pelo runner era de aproximadamente um segundo.
  Os scripts nao alteram horario, fuso ou dados do aplicativo normal.
- Os tres tipos de agendamento sao exercitados, mas nao todas as combinacoes de
  intervalo, dias, limites de data, horario de verao ou edicoes concorrentes.
- A captura imediata do alarme sob keyguard pode incluir o fade de entrada. A
  captura apos desbloqueio foi conferida estavel; o teste nao certifica ocultacao
  de barras de sistema nem uma comparacao visual pixel a pixel da lockscreen.

Esta rodada nao e uma certificacao de ausencia de bugs nem aprova o aplicativo
para todos os fabricantes.
