export default function debounceAsync<T extends (...args: any[]) => Promise<any>>(
    func: T,
    delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
        if (timeout) clearTimeout(timeout);

        return new Promise((resolve, reject) => {
            timeout = setTimeout(async () => {
                try {
                    const result = await func(...args);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    };
}