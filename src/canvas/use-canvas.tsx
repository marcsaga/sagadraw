import { useEffect, useRef, useState } from "react";
import { checkSelectedCollisions, hasCollided, setUpCanvas } from "./helpers";
import { renderCanvasElements } from "./renders";
import type { BaseElement, CanvasElement } from "./types";
import type { MenuAction } from "~/components/actions-menu";

interface UseCanvas {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startDrawing: (event: React.MouseEvent) => void;
  draw: (event: React.MouseEvent) => void;
  endDrawing: () => void;
  selectAction: (action: MenuAction) => void;
}

export const useCanvas = (): UseCanvas => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const movingPostion = useRef<{ x: number; y: number }>();
  const [action, setAction] = useState<MenuAction>();
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectionElement, setSelectionElement] = useState<BaseElement>();
  const [state, setState] = useState<CanvasElement[]>([]);

  useEffect(() => {
    const context = setUpCanvas(canvasRef.current);
    if (!context) return;

    renderCanvasElements(context, state, selectionElement);
    const collisionResponse = checkSelectedCollisions(state, selectionElement);
    if (collisionResponse?.updated) {
      setState(collisionResponse.newState);
    }
  }, [canvasRef, state, selectionElement]);

  const setCursor = (cursor: string) => {
    if (canvasRef.current) canvasRef.current.style.cursor = cursor;
  };

  const updateMovingPositionForSelectedElements = ({
    nativeEvent: { offsetX, offsetY },
  }: React.MouseEvent): { updated: boolean } => {
    const position = { x: offsetX, y: offsetY, xSize: 0, ySize: 0 };

    const selectionElements = state.filter(
      (rect) => rect.selected && hasCollided(rect, position)
    );
    if (selectionElements.length) {
      movingPostion.current = position;
    }
    return { updated: !!selectionElements.length };
  };

  const drawElement = ({
    nativeEvent: { offsetX, offsetY },
  }: React.MouseEvent) => {
    const position = { x: offsetX, y: offsetY, xSize: 0, ySize: 0 };
    setIsDrawing(true);
    setCursor("crosshair");
    switch (action) {
      case "rectangle":
        setState([...state, { ...position, type: "rectangle" }]);
        break;
      default:
        setSelectionElement(position);
    }
  };

  const updateDrawedPosition = ({
    nativeEvent: { offsetX, offsetY },
  }: React.MouseEvent) => {
    if (!isDrawing) return;
    if (selectionElement) {
      setSelectionElement({
        ...selectionElement,
        xSize: offsetX - selectionElement.x,
        ySize: offsetY - selectionElement.y,
      });
    } else {
      const currentRect = state.splice(-1)[0]!;
      const newRect = {
        ...currentRect,
        xSize: offsetX - currentRect.x,
        ySize: offsetY - currentRect.y,
      };
      setState([...state, newRect]);
    }
  };

  const updateMovingElement = ({
    nativeEvent: { offsetX, offsetY },
  }: React.MouseEvent) => {
    if (!movingPostion.current) return;
    const newState = state.map((rect) => {
      if (rect.selected) {
        const x = rect.x + (offsetX - movingPostion.current!.x);
        const y = rect.y + (offsetY - movingPostion.current!.y);
        return { ...rect, x, y };
      }
      return rect;
    });
    movingPostion.current = { x: offsetX, y: offsetY };
    setState(newState);
  };

  const setMoveCursor = ({
    nativeEvent: { offsetX, offsetY },
  }: React.MouseEvent) => {
    const someCollision = state
      .filter((rect) => rect.selected)
      .some((rect) =>
        hasCollided(rect, { x: offsetX, y: offsetY, xSize: 0, ySize: 0 })
      );
    if (!action) setCursor(someCollision ? "move" : "default");
  };

  const startDrawing = (event: React.MouseEvent) => {
    const { updated } = updateMovingPositionForSelectedElements(event);
    if (updated) return;
    drawElement(event);
  };

  const draw = (event: React.MouseEvent) => {
    updateDrawedPosition(event);
    updateMovingElement(event);
    setMoveCursor(event);
  };

  const endDrawing = () => {
    setCursor("default");
    setIsDrawing(false);
    movingPostion.current = undefined;
    setAction(undefined);
    if (selectionElement) {
      setSelectionElement(undefined);
    }
  };

  const selectAction = (action: MenuAction) => {
    setAction(action);
    setCursor("crosshair");
  };

  return { canvasRef, startDrawing, draw, endDrawing, selectAction };
};
