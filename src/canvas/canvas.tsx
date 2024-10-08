import { ActionsMenu } from "~/components/actions-menu";
import { useCanvas } from "./hooks/use-canvas";
import { TextEditor } from "~/components/text-editor";

export const Canvas = () => {
  const {
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
  } = useCanvas();

  return (
    <div>
      <canvas
        id="canvas"
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onDoubleClick={onDoubleClick}
      ></canvas>
      <ActionsMenu
        selectAction={selectAction}
        deleteAll={deleteAll}
        action={action}
      />
      {textInput && (
        <TextEditor
          textInput={textInput}
          onChangeTextInput={onChangeTextInput}
        />
      )}
    </div>
  );
};
