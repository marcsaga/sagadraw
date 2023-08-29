import { useEffect, useRef } from "react";
import type { CanvasElement, Position } from "../types";
import { unSelectAll } from "../helpers";
import { getSelectedRect } from "../renders";
import { getRelativePosition } from "../elements/resize";

export function useShortcutsListener(
  state: CanvasElement[],
  updateState: (state: CanvasElement[]) => void
) {
  const mousePosition = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      mousePosition.current = { x: event.clientX, y: event.clientY };
    };

    document.addEventListener("mousemove", listener);
    return () => {
      document.removeEventListener("mousemove", listener);
    };
  }, []);

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

      if ((event.metaKey || event.ctrlKey) && event.key === "a") {
        event.preventDefault();
        updateState(state.map((element) => ({ ...element, selected: true })));
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "c") {
        event.preventDefault();
        const selectedElements = state.filter((element) => element.selected);
        void navigator.clipboard.writeText(JSON.stringify(selectedElements));
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "v") {
        event.preventDefault();
        void navigator.clipboard.readText().then((text) => {
          try {
            const copiedElements = positionElementsCentered(
              JSON.parse(text) as CanvasElement[],
              mousePosition.current
            );
            updateState([...unSelectAll(state), ...copiedElements]);
          } catch {
            return;
          }
        });
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "x") {
        event.preventDefault();
        const selectedElements = state.filter((element) => element.selected);
        void navigator.clipboard.writeText(JSON.stringify(selectedElements));
        updateState(state.filter((element) => !element.selected));
      }
    };

    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [state, updateState]);
}

function positionElementsCentered(
  elements: CanvasElement[],
  mousePosition: Position
) {
  const selectedRect = getSelectedRect(elements);
  if (!selectedRect) return elements;
  return elements.map((element) => {
    const relativePosition = getRelativePosition(selectedRect.element, element);
    return {
      ...element,
      x: mousePosition.x + relativePosition.x - selectedRect.element.xSize / 2,
      y: mousePosition.y + relativePosition.y - selectedRect.element.ySize / 2,
    };
  });
}
