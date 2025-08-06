
export default function Logo() {
    return (
        <div className="flex items-center justify-center gap-x-2">
            <img src="/img/eapiis.png" alt="Logo Universidad" className="w-24" />
            <div className="flex h-28 items-center gap-x-0.5">
                <hr className="h-full w-0.5 bg-accent" />
            </div>
            <img src="/img/text.png" alt="Logo Universidad" className="w-80" />
        </div>
    );
}
