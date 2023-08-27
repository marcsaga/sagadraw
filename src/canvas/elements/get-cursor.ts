import type { MenuAction } from "~/components/actions-menu";
import type { CanvasElement, Position, ResizeDirection } from "../types";
import { hasMovingCollision, hasResizeCollision } from "./collisions";

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

interface GetCursorInput {
  mousePosition: Position;
  state: CanvasElement[];
  action: MenuAction;
}

export const getCursor = ({
  mousePosition,
  state,
  action,
}: GetCursorInput): Cursor => {
  if (action !== "select") {
    return "crosshair";
  }
  const resizeCollision = hasResizeCollision(state, mousePosition);
  if (resizeCollision.ok) {
    return resizeCursorDict[resizeCollision.position];
  }
  if (hasMovingCollision(state, mousePosition).ok) {
    return "move";
  }
  return "default";
};
