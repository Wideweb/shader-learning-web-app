export const easeOutQuint = (x: number): number => {
    return 1 - Math.pow(1 - x, 5);
}

export const easeOutQuart = (x: number): number => {
    return 1 - Math.pow(1 - x, 4);
}

export const easeLinier = (x: number): number => {
    return x;
}