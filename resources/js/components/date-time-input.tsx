import React from 'react';

type DateTimeInputProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
};

export default function DateTimeInput({ value, onChange, error }: DateTimeInputProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const openPicker = () => {
        if (inputRef.current && inputRef.current.showPicker) {
            inputRef.current.showPicker();
        } else {
            inputRef.current?.focus();
        }
    };

    return (
         <div className="flex flex-col">
            <div
                className="relative flex items-center rounded-md border border-gray-300 focus-within:border-blue-500 transition"
                onClick={openPicker}
            >
                <input
                    ref={inputRef}
                    type="datetime-local"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full rounded-md p-2 pr-10 focus:outline-none"
                />
            </div>
            {error && <span className="mt-1 text-sm text-red-600">{error}</span>}
        </div>
    );
}
