export type MenuAction = "rectangle";

interface ActionsMenuProps {
  selectAction: (action: MenuAction) => void;
}

const options: { label: string; action: MenuAction }[] = [
  { label: "Rectangle", action: "rectangle" },
];

export function ActionsMenu({ selectAction }: ActionsMenuProps) {
  return (
    <div className="absolute bottom-24 right-24 rounded bg-black p-2">
      {options.map(({ label, action }) => (
        <button
          key={action}
          className="text-white"
          onClick={() => selectAction(action)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
