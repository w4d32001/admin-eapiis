interface FormFieldProps {
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    className?: string;
}

export function FormField({ label, type = 'text', value, onChange, error, className = 'w-1/2' }: FormFieldProps) {
    return (
        <div className={`relative flex flex-col ${className}`}>
            <input
                id={label} 
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder=" "
                className="peer w-full border-b px-4 pt-4 pb-2 outline-none focus:border-b-blue-600"
            />
            <label
                htmlFor={label}
                className={`pointer-events-none absolute left-4 text-sm text-gray-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-1 peer-focus:text-sm ${value ? '-top-1 text-sm left-2' : ''} `}
            >
                {label}
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
