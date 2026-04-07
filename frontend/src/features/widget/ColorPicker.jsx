import { Check, Plus } from "lucide-react"; // Optional: Use any icon library

const DEFAULT_COLORS = ["#6366F1", "#0F766E", "#EA580C", "#DB2777"];

export default function ColorPicker({ value, onChange }) {
  const isCustomColor = !DEFAULT_COLORS.includes(value);

  return (
    <div className="space-y-4">
      <div 
        className="flex flex-wrap gap-3" 
        role="radiogroup" 
        aria-label="Select a color"
      >
        {DEFAULT_COLORS.map((color) => {
          const isActive = value === color;

          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(color)}
              className={`group relative flex h-11 w-11 items-center justify-center rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
                isActive 
                  ? "border-white ring-2 ring-indigo-500 ring-offset-2" 
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            >
              {isActive && <Check className="h-5 w-5 text-white drop-shadow-md" />}
              <span className="sr-only">{color}</span>
            </button>
          );
        })}

        {/* Custom Color Trigger */}
        <label 
          className={`relative flex h-11 min-w-[100px] cursor-pointer items-center justify-center gap-2 rounded-xl border-2 transition-all hover:bg-[var(--color-input-hover)] ${
            isCustomColor 
              ? "border-indigo-500 bg-[var(--color-input-bg)] ring-2 ring-indigo-500 ring-offset-2" 
              : "border-[var(--color-border)] bg-[var(--color-input-bg)]"
          }`}
        >
          {isCustomColor ? (
             <div 
               className="h-4 w-4 rounded-full border border-white/20" 
               style={{ backgroundColor: value }} 
             />
          ) : (
            <Plus className="h-4 w-4 text-[var(--color-muted)]" />
          )}
          
          <span className="text-xs font-semibold text-[var(--color-text)]">
            {isCustomColor ? value : "Custom"}
          </span>

          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <div 
          className="h-3 w-3 rounded-full" 
          style={{ backgroundColor: value }} 
        />
        <p className="text-xs text-[var(--color-muted)]">
          Hex Code: <span className="font-mono font-bold text-[var(--color-text)]">{value}</span>
        </p>
      </div>
    </div>
  );
}