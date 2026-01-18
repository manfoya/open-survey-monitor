export function errorDiv(messages: string[] | undefined) {
    if (!messages || messages.length === 0) return null;
    return <div className="mt-1 text-sm text-red-600">{messages[0]}</div>;
}