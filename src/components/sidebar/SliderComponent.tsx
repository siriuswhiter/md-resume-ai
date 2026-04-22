import { Slider } from "@/components/ui/slider";

interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (event: number) => void;
    currentValue: string
}

export const SliderComponent = ({label, value, min, max, step, onChange, currentValue}: SliderProps) => {
    const handleChange = (event: number[]) => {
        onChange(event[0]);
    };

    return (
        <div className='mb-2'>
            <label className="mb-1.5 flex justify-between text-xs text-[--ui-text-muted]">
                {label}
                <span className="text-[--ui-text]">{currentValue}</span>
            </label>
            <Slider
                value={[value]}
                max={max}
                min={min}
                step={step}
                onValueChange={handleChange}
                className='py-1'
            />
        </div>
    );
}
