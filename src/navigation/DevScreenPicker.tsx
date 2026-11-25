import { Fragment, useEffect, useState } from "react";
import { DevSettings, Modal, ScrollView, StyleSheet } from "react-native";
import type { InitialState } from "@react-navigation/native";
import type { OnboardingStep } from "../components/onboarding/FirstRunOnboarding";
import { AppButton } from "../components/ui/AppButton";
import { AppText } from "../components/ui/AppText";
import { Screen } from "../components/ui/Screen";
import { useAppData } from "../services/appDataProvider";
import { spacing } from "../theme/spacing";
import { useAppTheme } from "../theme/ThemeProvider";
import type { RootStackParamList, RootTabParamList } from "./types";

export type ScreenPreview =
  | { kind: "intro" | "splash" | "alarm" }
  | { kind: "onboarding"; step: OnboardingStep }
  | { kind: "navigation"; state: InitialState };

const onboardingScreens: { step: OnboardingStep; label: string }[] = [
  { step: "welcome", label: "Boas-vindas" },
  { step: "profile", label: "Configurar perfil local" },
  { step: "guide", label: "Guia rápido" },
  { step: "notifications", label: "Permissão de notificações" },
  { step: "exact", label: "Permissão de horário exato" },
  { step: "fullScreen", label: "Permissão de tela cheia" },
  { step: "ready", label: "Conclusão do onboarding" },
];

const tabs: { name: keyof RootTabParamList; label: string }[] = [
  { name: "Home", label: "Hoje" },
  { name: "Medications", label: "Medicamentos" },
  { name: "History", label: "Histórico" },
  { name: "Profile", label: "Perfil e configurações" },
];

function stackPreview(
  name: Exclude<keyof RootStackParamList, "MainTabs">,
  medicationId?: string
): ScreenPreview {
  return {
    kind: "navigation",
    state: {
      index: 1,
      routes: [
        { name: "MainTabs", state: { routes: [{ name: "Medications" }] } },
        { name, params: medicationId ? { medicationId } : undefined },
      ],
    },
  };
}

export function DevScreenPicker({ onSelect }: { onSelect: (preview: ScreenPreview | null) => void }) {
  const { medications } = useAppData();
  const { colors } = useAppTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    DevSettings.addMenuItem("Telas do Remedin", () => setVisible(true));
  }, []);

  function select(preview: ScreenPreview | null) {
    setVisible(false);
    onSelect(preview);
  }

  return (
    <Modal onRequestClose={() => setVisible(false)} visible={visible}>
      <Screen style={{ backgroundColor: colors.background }}>
        <ScrollView contentContainerStyle={styles.content}>
          <AppText accessibilityRole="header" variant="title">Telas do Remedin</AppText>
          <AppButton title="Fechar seletor" variant="ghost" onPress={() => setVisible(false)} />
          <AppButton title="Voltar ao fluxo normal" variant="ghost" onPress={() => select(null)} />
          <AppText accessibilityRole="header" variant="subheading">Aplicativo</AppText>
          {tabs.map(({ name, label }) => (
            <AppButton
              key={name}
              title={label}
              variant="secondary"
              onPress={() => select({
                kind: "navigation",
                state: { routes: [{ name: "MainTabs", state: { routes: [{ name }] } }] },
              })}
            />
          ))}
          <AppButton title="Adicionar medicamento" variant="secondary" onPress={() => select(stackPreview("AddMedication"))} />
          {medications.map(({ id, name }) => (
            <Fragment key={id}>
              <AppButton title={`Detalhes de ${name}`} variant="secondary" onPress={() => select(stackPreview("MedicationDetail", id))} />
              <AppButton title={`Editar ${name}`} variant="secondary" onPress={() => select(stackPreview("EditMedication", id))} />
            </Fragment>
          ))}
          {medications.length === 0 ? (
            <AppText muted variant="small">Detalhes e edição aparecem aqui quando houver um medicamento cadastrado.</AppText>
          ) : null}
          <AppButton title="Tela de alarme" variant="secondary" onPress={() => select({ kind: "alarm" })} />
          <AppText accessibilityRole="header" variant="subheading">Primeiro acesso</AppText>
          <AppButton title="Animação de abertura" variant="secondary" onPress={() => select({ kind: "intro" })} />
          <AppButton title="Tela de carregamento" variant="secondary" onPress={() => select({ kind: "splash" })} />
          {onboardingScreens.map(({ step, label }) => (
            <AppButton
              key={step}
              title={label}
              variant="secondary"
              onPress={() => select({ kind: "onboarding", step })}
            />
          ))}
        </ScrollView>
      </Screen>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm, paddingBottom: spacing.lg },
});
