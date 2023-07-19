export function isExpired(expiresAt: number): boolean {
    if (Number.isNaN(expiresAt)) {
        return true;
    }

    if (expiresAt <= 0) {
        return false;
    }

    return expiresAt < new Date().getTime();
}