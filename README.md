# Remedin

Aplicativo Android para organizar medicamentos, registrar doses e receber lembretes. O perfil, a rotina e o histórico ficam no SQLite do aparelho.

## Rodar no Android

Use Node.js 22.13 ou superior na série 22, Node.js 24.3 ou superior na série 24, ou Node.js 25+. Use JDK 17 e o Android SDK. O [Gradle do projeto](android/build.gradle) declara as versões do SDK e do NDK. Configure `JAVA_HOME`, `ANDROID_HOME` e o `adb` no PATH. Abra um emulador ou conecte um aparelho de teste.

```sh
npm ci
npm start
```

Em outro terminal, rode `npm run android`. No menu de desenvolvimento, **Telas do Remedin** abre as abas e as etapas do primeiro acesso individualmente.

## Onde mexer

| Área | Caminho |
| --- | --- |
| Inicialização, providers, primeira abertura e alarme direto | [App.tsx](App.tsx), [index.ts](index.ts) |
| Telas, componentes e navegação | [src/screens](src/screens), [src/components](src/components), [src/navigation](src/navigation) |
| Marca, temas e tipografia | [DESIGN.md](DESIGN.md), [src/theme](src/theme), [RemedinBrand.tsx](src/components/brand/RemedinBrand.tsx) |
| Perfil local e avatares | [ProfileAvatarPicker.tsx](src/components/ProfileAvatarPicker.tsx), [assets/avatars](assets/avatars) |
| Primeiro acesso e permissões do Android | [FirstRunOnboarding.tsx](src/components/onboarding/FirstRunOnboarding.tsx), [useOnboardingPermissions.ts](src/components/onboarding/useOnboardingPermissions.ts) |
| Persistência e migrações | [src/database](src/database) |
| Doses, permissões e conciliação de lembretes | [src/services](src/services), [src/services/reminders](src/services/reminders) |
| Serviço de áudio, AlarmManager e reinicialização | [android/app/src/main/java/com/remedin](android/app/src/main/java/com/remedin) |

Os ADRs em [docs/adr](docs/adr) registram as decisões e suas substituições. Para alterar a experiência atual, use as telas React Native e a documentação acima. Protótipos HTML, imagens antigas e o cofre Obsidian são materiais locais não versionados; não são necessários para compilar ou executar o app.

A política de privacidade usa [src/legal/privacy.json](src/legal/privacy.json) como fonte. O [workflow do Pages](.github/workflows/privacy-pages.yml) gera e publica `privacy-site/`; essa saída não é versionada. As instruções estão em [Privacidade e envio](docs/legal/privacy-and-store-submission.md).

## Bancada de testes

O [workflow de CI](.github/workflows/ci.yml) instala as dependências com o lockfile, checa o TypeScript e roda o Jest em cada pull request.

```sh
npm run typecheck
npm test -- --runInBand --detectOpenHandles
```

A suíte usa SQLite real em memória para migrações e transações. Inclui cargas de 72 mil registros de dose e 512 transações concorrentes com falhas simuladas. Os testes dos lembretes cobrem perda de triggers, doses já registradas e soneca que atravessa meia-noite.

No Windows, gere um APK de bancada com `cd android` e `.\gradlew.bat :app:assembleRelease -PreactNativeArchitectures=x86_64`. Instale esse APK em um emulador x86_64 e valide com Wi-Fi e dados móveis desligados. O APK local usa a chave de depuração configurada no Gradle. A distribuição exige assinatura de produção.

1. Faça o primeiro acesso com um perfil de teste e escolha um avatar. Feche e reabra o app para conferir o perfil.
2. Cadastre um medicamento fictício para alguns minutos à frente. Passe o app para segundo plano e bloqueie a tela.
3. Confira o disparo, registre a dose e verifique a entrada no Histórico. Edite o horário, pause, reative e remova o cadastro de teste.
4. Reinicie o emulador depois de cadastrar uma próxima dose. Confira se o Android volta a listar o alarme em `adb shell dumpsys alarm`.

Valide em aparelho físico o som, a vibração, o Não Perturbe, a tela bloqueada e as restrições de bateria do fabricante. Consulte a [matriz de permissões Android](docs/product/android-permission-matrix.md) para o comportamento esperado em cada caso.
