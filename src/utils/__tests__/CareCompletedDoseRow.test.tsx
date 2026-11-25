import React from "react";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import { AppThemeProvider } from "../../theme/ThemeProvider";
import { CareCompletedDoseRow } from "../../components/CareCompletedDoseRow";

describe("CareCompletedDoseRow", () => {
  it("offers an explicit undo action only for a skipped dose", async () => {
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

  it("does not offer undo for a taken dose", async () => {
    let renderer!: ReturnType<typeof TestRenderer.create>;

    await act(async () => {
      renderer = TestRenderer.create(
        <AppThemeProvider><CareCompletedDoseRow name="Dipirona" status="taken" time="08:00" /></AppThemeProvider>
      );
    });

    expect(
      renderer.root.findAllByProps({
        accessibilityLabel: "Desfazer dose pulada",
      })
    ).toHaveLength(0);

    await act(async () => renderer.unmount());
  });
});
