import { useEffect, useRef, useState } from "react";
import {
  checkSelectedElements,
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
import { type ResizeState, resize } from "../elements/resize";
import { getCursor } from "../elements/get-cursor";
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

  useEffect(() => {
    function updateCursor(event: MouseEvent) {
      const cursor = getCursor({
        mousePosition: { x: event.offsetX, y: event.offsetY },
        state,
        action,
      });
      canvasRef.current!.style.cursor = cursor;
    }
    const ref = canvasRef.current;
    if (!ref) return;
    ref.addEventListener("mousemove", updateCursor);
    return () => {
      ref.removeEventListener("mousemove", updateCursor);
    };
  }, [canvasRef, state, action]);

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
      setSelectionElement({
        ...selectionElement,
        xSize: mousePosition.x - selectionElement.x,
        ySize: mousePosition.y - selectionElement.y,
      });
    } else if (state.length) {
      const currentElement = state.splice(-1)[0]!;
      const newRect = {
        ...currentElement,
        xSize: mousePosition.x - currentElement.x,
        ySize: mousePosition.y - currentElement.y,
      };
      setState([...state, newRect]);
    }
  };

  const updateMovingElement = (mousePosition: Position) => {
    if (!movingPostion.current) return;
    const newState = state.map((rect) => {
      if (rect.selected) {
        rect = {
          ...rect,
          x: rect.x + (mousePosition.x - movingPostion.current!.x),
          y: rect.y + (mousePosition.y - movingPostion.current!.y),
        };
      }
      return rect;
    });
    movingPostion.current = mousePosition;
    setState(newState);
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
        direction: resizeCollision.position,
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
    const mousePosition = { x, y };
    updateDrawedElement(mousePosition);
    updateMovingElement(mousePosition);
    updateResizingElement(mousePosition);
  };

  const endDrawing = () => {
    let newState = [...state];
    if (isDrawing && newState.length) {
      let lastElement = newState.splice(-1)[0];
      if (
        Math.abs(lastElement?.xSize ?? 0) < 4 &&
        Math.abs(lastElement?.ySize ?? 0) < 4
      ) {
        lastElement = undefined;
      } else if (lastElement?.type === "rectangle") {
        lastElement = standarizeElement(lastElement);
      }
      if (lastElement) {
        newState.push(lastElement);
      }
      setIsDrawing(false);
    }
    setAction("select");
    movingPostion.current = undefined;
    if (selectionElement) {
      setSelectionElement(undefined);
    }
    if (resizingPosition.current) {
      resizingPosition.current = undefined;
      newState = newState.map((element) =>
        "resizeDirection" in element
          ? { ...element, resizeDirection: undefined }
          : element
      );
    }
    setState(newState);
  };

  const selectAction = (action: MenuAction) => {
    setAction(action);
  };

  const deleteAll = () => setState([]);

  const onDoubleClick = ({ clientX: x, clientY: y }: React.MouseEvent) => {
    const textInputCollision = hasTextInputCollision(state, { x, y });
    setAction("select");
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
