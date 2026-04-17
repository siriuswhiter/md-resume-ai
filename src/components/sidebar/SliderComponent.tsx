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
        <div className='mb-3'>
            <label className="mb-2 flex justify-between text-sm font-medium text-[#55534e]">
                {label}
                <span>{currentValue}</span>
            </label>
            <Slider
                value={[value]}
                max={max}
                min={min}
                step={step}
                onValueChange={handleChange}
                className='py-2'
            />
        </div>
    );
}
