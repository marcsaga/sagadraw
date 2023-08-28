import { useEffect, useRef, useState } from "react";
import {
  checkSelectedElements,
  hasMinimumSize,
  resetAllResizeDirections,
  setUpCanvas,
  standarizeElement,
  unSelectAll,
} from "../helpers";
import { renderCanvasElements } from "../renders";
import type {
  BaseElement,
  CanvasElement,
  Position,
  TextElement,
} from "../types";
import type { MenuAction } from "~/components/actions-menu";
import { useShortcutsListener } from "./use-shortcuts-listener";
import {
  type ResizeState,
  resize,
  resizeDrawingRectangle,
} from "../elements/resize";
import {
  hasMovingCollision,
  hasResizeCollision,
  hasTextInputCollision,
} from "../elements/collisions";
import { useSyncLocalStorage } from "./use-sync-local-storage";
import {
  createLineElement,
  createRectangleElement,
  createTextElement,
} from "../elements/create";
import { moveSelectedElements } from "../elements/move";
import { useCursorUpdate } from "./use-cursor-update";

interface UseCanvas {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  action: MenuAction;
  startDrawing: (event: React.MouseEvent) => void;
  draw: (event: React.MouseEvent) => void;
  endDrawing: () => void;
  selectAction: (action: MenuAction) => void;
  deleteAll: () => void;
  onDoubleClick: (event: React.MouseEvent) => void;
  textInput?: TextElement;
  onChangeTextInput: (textInput: TextElement) => void;
}

export const useCanvas = (): UseCanvas => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const movingPostion = useRef<{ x: number; y: number }>();
  const resizingPosition = useRef<ResizeState>();
  const [action, setAction] = useState<MenuAction>("select");
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectionElement, setSelectionElement] = useState<BaseElement>();
  const [state, setState] = useState<CanvasElement[]>([]);
  const [textInput, setTextInput] = useState<TextElement | undefined>();

  useShortcutsListener(state, setState);
  useCursorUpdate(canvasRef, state, action);
  const { syncLocalStorage } = useSyncLocalStorage(setState);

  useEffect(() => {
    const context = setUpCanvas(canvasRef.current);
    if (!context) return;

    renderCanvasElements(context, state, selectionElement);
    const collisionResponse = checkSelectedElements(state, selectionElement);
    if (collisionResponse?.updated) {
      setState(collisionResponse.newState);
    }
    syncLocalStorage(state);
  }, [canvasRef, state, selectionElement, syncLocalStorage, textInput]);

  const drawElement = (mousePosition: Position) => {
    setIsDrawing(true);
    if (action === "select") {
      setSelectionElement(createRectangleElement(mousePosition));
    }
    const newState = unSelectAll(state);
    switch (action) {
      case "rectangle":
        setState([...newState, createRectangleElement(mousePosition)]);
        break;
      case "line":
        setState([...newState, createLineElement(mousePosition)]);
        break;
      default:
        throw new Error(`Action ${action} not implemented`);
    }
  };

  const updateDrawedElement = (mousePosition: Position) => {
    if (!isDrawing) return;
    if (selectionElement) {
      setSelectionElement(
        resizeDrawingRectangle(selectionElement, mousePosition)
      );
    } else if (state.length) {
      const currentDrawedElement = state.splice(-1)[0]!;
      setState([
        ...state,
        resizeDrawingRectangle(currentDrawedElement, mousePosition),
      ]);
    }
  };

  const updateMovingElement = (mousePosition: Position) => {
    if (!movingPostion.current) return;
    setState(moveSelectedElements(state, mousePosition, movingPostion.current));
    movingPostion.current = mousePosition;
  };

  const updateResizingElement = (mousePosition: Position) => {
    if (!resizingPosition.current) return;
    const newState = resize(mousePosition, state, resizingPosition.current);
    setState(newState);
    resizingPosition.current = {
      ...resizingPosition.current,
      position: mousePosition,
    };
  };

  const startDrawing = ({ clientX, clientY }: React.MouseEvent) => {
    if (textInput !== undefined) {
      if (textInput.text) {
        setState([...state, { ...textInput, selected: false }]);
      }
      setTextInput(undefined);
      return;
    }

    const mousePosition = { x: clientX, y: clientY };
    if (action !== "select") {
      drawElement(mousePosition);
      return;
    }

    const resizeCollision = hasResizeCollision(state, mousePosition);
    if (resizeCollision.ok) {
      resizingPosition.current = {
        position: mousePosition,
        direction: resizeCollision.direction,
      };
      if (resizeCollision.newState) {
        setState(resizeCollision.newState);
      }
      return;
    }

    const movingCollsion = hasMovingCollision(state, mousePosition);
    if (movingCollsion.ok) {
      movingPostion.current = mousePosition;
      setState(movingCollsion.newState);
      return;
    }

    setIsDrawing(true);
    setSelectionElement(createRectangleElement(mousePosition));
  };

  const draw = ({ clientX: x, clientY: y }: React.MouseEvent) => {
    updateDrawedElement({ x, y });
    updateMovingElement({ x, y });
    updateResizingElement({ x, y });
  };

  const endDrawing = () => {
    let newState = [...state];
    const lastElement = newState.slice(-1)[0];
    if (isDrawing) {
      if (lastElement && !hasMinimumSize(lastElement)) {
        newState.splice(-1);
      } else if (lastElement?.type === "rectangle") {
        newState = [...newState.slice(0, -1), standarizeElement(lastElement)];
      }
      setIsDrawing(false);
    }
    setAction("select");
    movingPostion.current = undefined;
    setSelectionElement(undefined);
    if (resizingPosition.current) {
      resizingPosition.current = undefined;
      newState = resetAllResizeDirections(newState);
    }
    setState(newState);
  };

  const selectAction = (action: MenuAction) => setAction(action);
  const deleteAll = () => setState([]);

  const onDoubleClick = ({ clientX: x, clientY: y }: React.MouseEvent) => {
    const textInputCollision = hasTextInputCollision(state, { x, y });
    if (!textInputCollision.ok) {
      setTextInput(createTextElement({ x, y }));
      setState(unSelectAll(state));
      return;
    }
    setState(textInputCollision.newState);
    setTextInput(textInputCollision.textElement);
  };

  const onChangeTextInput = (element: TextElement) => setTextInput(element);

  return {
    canvasRef,
    textInput,
    action,
    onChangeTextInput,
    startDrawing,
    draw,
    endDrawing,
    selectAction,
    deleteAll,
    onDoubleClick,
  };
};
