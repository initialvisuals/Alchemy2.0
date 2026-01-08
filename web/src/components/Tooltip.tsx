import { useEffect, useState } from "react";
import { useStore } from "../store";

export function Tooltip() {
  const { tooltip } = useStore();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (tooltip) {
      const handleMove = (e: MouseEvent) => {
        setPos({ x: e.clientX, y: e.clientY });
      };

      // Delay visibility slightly for smoothness? Or instant?
      // Instant is snappier for this app.
      setVisible(true);

      window.addEventListener("mousemove", handleMove);
      return () => {
        window.removeEventListener("mousemove", handleMove);
        setVisible(false);
      };
    } else {
      setVisible(false);
    }
  }, [tooltip]);

  if (!tooltip || !visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[100] px-2 py-1 bg-black/80 text-white text-[10px] font-sans border border-gray-600 rounded shadow-lg backdrop-blur-sm whitespace-pre-line"
      style={{
        left: pos.x + 12,
        top: pos.y + 12,
      }}
    >
      {tooltip}
    </div>
  );
}
