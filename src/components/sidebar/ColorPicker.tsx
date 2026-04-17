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
        <div>
            <label className="flex justify-between text-sm font-medium text-[#55534e]">
                <div className='m-0 flex w-full cursor-pointer items-center gap-2 rounded-[18px] border border-[#dad4c8] bg-white p-2 transition hover:-translate-y-0.5 hover:-rotate-1 hover:bg-[#f8cc65] hover:shadow-[-5px_5px_0_#000000]'>
                    <div className="relative w-6 h-6 rounded-lg overflow-hidden">
                        <input
                            type="color"
                            value={value}
                            onChange={handleColorChange}
                            className="invisible absolute top-0 left-0 w-full h-full outline-none rounded-full border-none cursor-pointer p-0"
                            style={{transform: 'scale(1.4)'}}
                        />
                        <span style={{background: value}} className="mt-[2px] inline-block h-5 w-5 rounded-full border border-black"></span>
                    </div>
                    <div className="w-full justify-between flex">
                        <span className="font-semibold">{label}</span>
                        <span className="text-[#9f9b93]">{value}</span>
                    </div>
                </div>
            </label>
        </div>
    )
}
