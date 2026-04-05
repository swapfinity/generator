export const safeParseFromBase64 = <T>(param: string | null | undefined): T | undefined => {
    if (!param) {
        return undefined;
    }

    try {
        return JSON.parse(atob(param)) as T;
    } catch {
        return undefined;
    }
};