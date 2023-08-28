import type { MenuAction } from "~/components/actions-menu";
import type { CanvasElement, ResizeDirection } from "../types";
import { useEffect } from "react";
import { hasMovingCollision, hasResizeCollision } from "../elements/collisions";

type ResizeCursor =
  | "nesw-resize"
  | "nwse-resize"
  | "ns-resize"
  | "ew-resize"
  | "pointer";

type Cursor = "default" | "move" | "pointer" | "crosshair" | ResizeCursor;

const resizeCursorDict: Record<ResizeDirection, ResizeCursor> = {
  "top-left": "nwse-resize",
  "top-right": "nesw-resize",
  "bottom-left": "nesw-resize",
  "bottom-right": "nwse-resize",
  bottom: "ns-resize",
  top: "ns-resize",
  left: "ew-resize",
  right: "ew-resize",
  "line-start": "pointer",
  "line-end": "pointer",
};

export function useCursorUpdate(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  state: CanvasElement[],
  action: MenuAction
) {
  useEffect(() => {
    function updateCursor({ clientX: x, clientY: y }: MouseEvent) {
      let cursor: Cursor = "default";
      if (action !== "select") {
        cursor = "crosshair";
      }
      const resizeCollision = hasResizeCollision(state, { x, y });
      if (resizeCollision.ok) {
        cursor = resizeCursorDict[resizeCollision.direction];
      }
      if (hasMovingCollision(state, { x, y }).ok) {
        cursor = "move";
      }
      canvasRef.current!.style.cursor = cursor;
    }

    const ref = canvasRef.current;
    if (!ref) return;
    ref.addEventListener("mousemove", updateCursor);
    return () => {
      ref.removeEventListener("mousemove", updateCursor);
    };
  }, [canvasRef, state, action]);
}
