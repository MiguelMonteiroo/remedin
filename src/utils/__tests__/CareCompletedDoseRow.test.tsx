import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import { AppThemeProvider } from "../../theme/ThemeProvider";
import { CareCompletedDoseRow } from "../../components/CareCompletedDoseRow";

jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: jest.fn(),
}));

beforeEach(() => {
  (useWindowDimensions as jest.MockedFunction<typeof useWindowDimensions>).mockReturnValue({
    width: 411, height: 914, fontScale: 1, scale: 2,
  });
});

describe("CareCompletedDoseRow", () => {
  it.each([[360, 1], [411, 1.5]])("stacks undo at width %s and font scale %s", async (width, fontScale) => {
    (useWindowDimensions as jest.MockedFunction<typeof useWindowDimensions>).mockReturnValue({
      width, height: 800, fontScale, scale: 2,
    });
    let renderer!: ReturnType<typeof TestRenderer.create>;
    await act(async () => {
      renderer = TestRenderer.create(
        <AppThemeProvider><CareCompletedDoseRow name="Teste" status="taken" time="08:00" onUndo={jest.fn()} /></AppThemeProvider>
      );
    });
    const row = renderer.root.findByType(CareCompletedDoseRow).findAllByType(View)[0];
    expect(StyleSheet.flatten(row.props.style).flexDirection).toBe("column");
    await act(async () => renderer.unmount());
  });
  it("allows undoing a taken dose when the callback is supplied", async () => {
    const onUndo = jest.fn();
    let renderer!: ReturnType<typeof TestRenderer.create>;
    await act(async () => {
      renderer = TestRenderer.create(
        <AppThemeProvider><CareCompletedDoseRow name="Teste" status="taken" time="08:00" onUndo={onUndo} /></AppThemeProvider>
      );
    });
    const undo = renderer.root.findByProps({ accessibilityLabel: "Desfazer dose tomada" });
    await act(async () => undo.props.onPress());
    expect(onUndo).toHaveBeenCalledTimes(1);
    await act(async () => renderer.unmount());
  });
  it("offers undo for a skipped dose and disables it while busy", async () => {
    const onUndo = jest.fn();
    let renderer!: ReturnType<typeof TestRenderer.create>;

    await act(async () => {
      renderer = TestRenderer.create(
        <AppThemeProvider><CareCompletedDoseRow
          name="Dipirona"
          onUndo={onUndo}
          status="skipped"
          time="08:00"
        /></AppThemeProvider>
      );
    });

    const undo = renderer.root.findByProps({
      accessibilityLabel: "Desfazer dose pulada",
    });
    await act(async () => undo.props.onPress());
    expect(onUndo).toHaveBeenCalledTimes(1);

    await act(async () => {
      renderer.update(
        <AppThemeProvider><CareCompletedDoseRow
          name="Dipirona"
          onUndo={onUndo}
          status="skipped"
          time="08:00"
          undoing
        /></AppThemeProvider>
      );
    });
    expect(
      renderer.root.findByProps({ accessibilityLabel: "Desfazer dose pulada" })
        .props.disabled
    ).toBe(true);

    await act(async () => renderer.unmount());
  });

  it("does not offer undo when no callback is supplied", async () => {
    let renderer!: ReturnType<typeof TestRenderer.create>;

    await act(async () => {
      renderer = TestRenderer.create(
        <AppThemeProvider><CareCompletedDoseRow name="Dipirona" status="taken" time="08:00" /></AppThemeProvider>
      );
    });

    expect(
      renderer.root.findAllByProps({
        accessibilityLabel: "Desfazer dose tomada",
      })
    ).toHaveLength(0);

    await act(async () => renderer.unmount());
  });
});
