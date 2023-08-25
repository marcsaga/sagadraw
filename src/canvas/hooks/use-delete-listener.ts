import { useEffect } from "react";
import type { CanvasElement } from "../types";

export function useDeleteListener(
  updateState: (callback: (state: CanvasElement[]) => CanvasElement[]) => void
) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Backspace") {
        updateState((state) => state.filter((element) => !element.selected));
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [updateState]);
}
