import { useEffect } from "react";
import type { CanvasElement } from "../types";
import { unSelectAll } from "../helpers";

export function useShortcutsListener(
  state: CanvasElement[],
  updateState: (state: CanvasElement[]) => void
) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Backspace") {
        updateState(state.filter((element) => !element.selected));
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "d") {
        event.preventDefault();
        const selectedElements = state
          .filter((element) => element.selected)
          .map((element) => ({
            ...element,
            selected: true,
            x: element.x + 10,
            y: element.y + 10,
          }));
        updateState([...unSelectAll(state), ...selectedElements]);
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [state, updateState]);
}
