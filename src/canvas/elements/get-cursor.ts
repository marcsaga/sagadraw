import type { MenuAction } from "~/components/actions-menu";
import { getResizeRectangles } from "../helpers";
import type {
  CanvasElement,
  Position,
  ResizeRectanglePosition,
} from "../types";
import { getSelectedRect } from "../renders";
import { hasCollided } from "./collisions";

type ResizeCursor = "nesw-resize" | "nwse-resize" | "ns-resize" | "ew-resize";
type Cursor = "default" | "move" | "pointer" | "crosshair" | ResizeCursor;

const resizeCursorDict: Record<ResizeRectanglePosition, ResizeCursor> = {
  "top-left": "nwse-resize",
  "top-right": "nesw-resize",
  "bottom-left": "nesw-resize",
  "bottom-right": "nwse-resize",
  bottom: "ns-resize",
  top: "ns-resize",
  left: "ew-resize",
  right: "ew-resize",
};

function getCursorFromResizeCollision(
  elements: CanvasElement[],
  mousePosition: Position
): ResizeCursor | undefined {
  const selectedRect = getSelectedRect(elements);
  if (!selectedRect) return;

  const collision = getResizeRectangles(
    selectedRect.element,
    selectedRect.mode
  ).find(([, rectangle]) => {
    return hasCollided(rectangle, mousePosition);
  });
  if (collision) return resizeCursorDict[collision[0]];
}

interface GetCursorInput {
  mousePosition: Position;
  state: CanvasElement[];
  action?: MenuAction;
}

export const getCursor = ({
  mousePosition,
  state,
  action,
}: GetCursorInput): Cursor => {
  const resizeCursor = getCursorFromResizeCollision(state, mousePosition);
  if (resizeCursor) {
    return resizeCursor;
  }

  const selectedRect = getSelectedRect(state);
  if (selectedRect && hasCollided(selectedRect.element, mousePosition)) {
    return "move";
  }

  if (action !== undefined) {
    return "crosshair";
  }

  return "default";
};
