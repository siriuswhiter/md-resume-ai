import {ChangeEvent} from "react";

interface ColorSectionProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
}

export default function ColorPicker({label, value, onChange}: ColorSectionProps) {
    const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    return (
        <div className="flex items-center justify-between gap-2 rounded-[4px] border border-[--ui-border] px-2 py-1.5 hover:border-[--ui-text]">
            <span className="text-xs text-[--ui-text]">{label}</span>
            <label className="flex cursor-pointer items-center gap-1.5">
                <span className="text-xs text-[--ui-text-muted]">{value}</span>
                <div className="relative h-5 w-5 overflow-hidden rounded-[3px] border border-[--ui-border]">
                    <input
                        type="color"
                        value={value}
                        onChange={handleColorChange}
                        className="invisible absolute inset-0 h-full w-full cursor-pointer"
                    />
                    <span style={{background: value}} className="absolute inset-0 block" />
                </div>
            </label>
        </div>
    )
}
