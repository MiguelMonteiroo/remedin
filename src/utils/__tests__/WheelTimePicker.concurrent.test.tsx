import React from "react";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import { WheelTimePicker } from "../../components/WheelTimePicker";
import { AppThemeProvider } from "../../theme/ThemeProvider";

const mockScrollTo = jest.fn();

jest.mock("react-native/Libraries/Components/ScrollView/ScrollView", () => {
  const { createElement, forwardRef, useImperativeHandle } = jest.requireActual("react");
  return {
    __esModule: true,
    default: forwardRef((props: { children?: React.ReactNode }, ref: React.Ref<unknown>) => {
      useImperativeHandle(ref, () => ({ scrollTo: mockScrollTo }));
      return createElement("ScrollView", props, props.children);
    }),
  };
});

describe("WheelTimePicker concurrent adjustments", () => {
  beforeEach(() => mockScrollTo.mockClear());

  it("does not start momentum animations for accessibility adjustments", async () => {
    let renderer!: ReturnType<typeof TestRenderer.create>;
    await act(async () => {
      renderer = TestRenderer.create(
        <AppThemeProvider><WheelTimePicker value="08:00" onChange={jest.fn()} /></AppThemeProvider>
      );
    });
    const hour = renderer.root.find(
      (node: { props: { accessibilityLabel?: string; onAccessibilityAction?: unknown } }) =>
        node.props.accessibilityLabel?.endsWith(", hora") === true &&
        typeof node.props.onAccessibilityAction === "function"
    );
    await act(async () => hour.props.onAccessibilityAction({ nativeEvent: { actionName: "increment" } }));
    expect(mockScrollTo).toHaveBeenCalledWith(expect.objectContaining({ animated: false }));
    expect(mockScrollTo).not.toHaveBeenCalledWith(expect.objectContaining({ animated: true }));
    await act(async () => renderer.unmount());
  });

  it("combines hour and minute changes made before the next render", async () => {
    const onChange = jest.fn();
    let renderer!: ReturnType<typeof TestRenderer.create>;

    await act(async () => {
      renderer = TestRenderer.create(
        <AppThemeProvider><WheelTimePicker value="08:00" onChange={onChange} /></AppThemeProvider>
      );
    });

    const hour = renderer.root.find(
      (node: { props: { accessibilityLabel?: string; onAccessibilityAction?: unknown } }) =>
        node.props.accessibilityLabel?.endsWith(", hora") === true &&
        typeof node.props.onAccessibilityAction === "function"
    );
    const minute = renderer.root.find(
      (node: { props: { accessibilityLabel?: string; onAccessibilityAction?: unknown } }) =>
        node.props.accessibilityLabel?.endsWith(", minuto") === true &&
        typeof node.props.onAccessibilityAction === "function"
    );

    await act(async () => {
      hour.props.onAccessibilityAction({
        nativeEvent: { actionName: "increment" },
      });
      minute.props.onAccessibilityAction({
        nativeEvent: { actionName: "increment" },
      });
    });

    expect(onChange).toHaveBeenLastCalledWith("09:01");

    await act(async () => renderer.unmount());
  });
});
