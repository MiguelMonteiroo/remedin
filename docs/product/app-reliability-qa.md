# Confiabilidade do aplicativo

## Mudanças de novembro de 2026

- Operações de dose são serializadas por ocorrência. A Home bloqueia comandos enquanto uma operação está em andamento e mostra falhas sem esconder registros já salvos.
- A gravação da dose é independente da atualização dos alarmes. Falhas de atualização acionam recuperação e têm mensagem específica. Três adiamentos continuam sendo o limite, com explicação na Home e no alarme.
- A migração SQLite 5 adiciona limites de validade aos agendamentos. Editar recorrência cria uma versão; não altera retroativamente as anteriores. Pausar encerra a cobertura e reativar inicia uma nova versão. Ações explícitas, inclusive tomadas antecipadas, continuam visíveis.
- Adiamentos pendentes de versões anteriores são recuperados pela reconciliação. O horário adiado permanece visível mesmo depois de vencer.
- O onboarding salva sua etapa em app_settings e retorna a ela em uma nova abertura. A escolha de detalhes na tela bloqueada é explícita e o padrão continua oculto.
- O worker periódico só confirma sucesso após a reconciliação JavaScript. Falha, interrupção ou falta de confirmação solicitam nova tentativa; eventos de dispositivo bloqueados pelo Android enfileiram trabalho de recuperação.
- Card de dose adapta ações a fonte ampliada; a aba Medicamentos usa o rótulo curto Lista com fonte grande, mantendo o nome acessível completo.

Versões de agendamento não recuperam configurações que já foram sobrescritas por versões antigas do aplicativo. A migração preserva os dados existentes; não inventa horários anteriores.

## Verificado automaticamente

- Duplicação de comandos, liberação de bloqueio após falha e recuperação quando cancelamento falha após gravação.
- Migração repetível, edição sem destruir dias anteriores e preservação de tomada antecipada.
- Pausa, edição durante pausa (inclusive somente nome) e reativação sem criar doses durante a pausa.
- Reconciliação após avanço de vários dias, recuperação de adiamento de agendamento arquivado e preservação do horário efetivo após vencer.
- Persistência da etapa do onboarding, retomada e escolha explícita de privacidade.
- Limite de adiamento não fecha indevidamente a tela do alarme.

## Verificado no emulador

- APK debug compilado e instalado sobre o app existente sem reset de dados.
- Nova abertura sem erros ReactNativeJS ou AndroidRuntime no log consultado.
- Inspeção da Home vazia com fonte 150%; corrigido o rótulo da aba que quebrava uma palavra em duas linhas. Fonte restaurada a 100%.
- Trabalho periódico registrado no JobScheduler. Antecipar somente o job Android não executa a renovação antes do prazo: o WorkManager aplica seu próprio horário; isso não comprova uma execução periódica real.

## QA ainda necessária em dispositivos reais

1. Manter o app sem abrir por mais de 48 horas e verificar renovação efetiva com e sem economia de bateria, incluindo Xiaomi.
2. Reiniciar o aparelho, mudar fuso/data e revogar permissões com alarmes futuros; confirmar cancelamento e recuperação.
3. Testar doses simultâneas, tomada antecipada seguida de edição, adiamento na virada do dia e ações pelas notificações com processo encerrado.
4. Percorrer cadastro, edição, detalhes, histórico, perfil e alarme com fontes 100%, 130% e 150% em tela pequena.
5. Percorrer os fluxos com TalkBack; conferir ordem do foco e leitura de mensagens e estados ocupados.

O funcionamento depende das restrições do Android e do fabricante. Build e testes unitários não equivalem a certificação de entrega pontual em todos os aparelhos.
