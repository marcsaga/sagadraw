import { ActionsMenu } from "~/components/actions-menu";
import { useCanvas } from "./hooks/use-canvas";
import { Textarea } from "~/components/textarea";

export const Canvas = () => {
  const {
    canvasRef,
    textInput,
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
      <ActionsMenu selectAction={selectAction} deleteAll={deleteAll} />
      {textInput && (
        <Textarea textInput={textInput} onChangeTextInput={onChangeTextInput} />
      )}
    </div>
  );
};
