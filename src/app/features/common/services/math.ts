export const saturate = (x: number) => {
    return Math.max(0.0, Math.min(1.0, x));
}

export const clamp = (x: number, minVal: number, maxVal: number) => {
    return Math.max(minVal, Math.min(x, maxVal));
}

export const smoothstep = (edge0: number, edge1: number, x: number) => {
    const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
}