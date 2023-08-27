import type { TextElement } from "~/canvas/types";
import { useEffect, useRef } from "react";

interface TextareaProps {
  textInput: TextElement;
  onChangeTextInput: (textInput: TextElement) => void;
}

export function Textarea({ textInput, onChangeTextInput }: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.parentElement!.dataset.replicatedValue = textInput.text;
    }
  }, [ref, textInput.text]);

  return (
    <div
      className="canvas-text-input absolute"
      style={{ top: textInput.y - 5, left: textInput.x }}
    >
      <textarea
        wrap="off"
        defaultValue={textInput.text}
        ref={ref}
        autoFocus
        className="grid-area-1-1-2-2 grid resize-none overflow-hidden bg-transparent"
        style={{ fontSize: textInput.fontSize + "px" }}
        onChange={({ target }) => {
          onChangeTextInput({
            ...textInput,
            text: target.value,
            ySize: target.clientHeight,
            xSize: target.clientWidth + 8,
          });
        }}
      />
    </div>
  );
}
