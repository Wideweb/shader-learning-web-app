
function hasAny (actual: string[], expected: string[]): boolean {
    const has = expected.some(e => actual.some(a => e.toLowerCase() == a.toLowerCase()));
    return has;
}

function hasAll (actual: string[], expected: string[]): boolean {
    const has = expected.every(e => actual.some(a => e.toLowerCase() == a.toLowerCase()));
    return has;
}

function moveArrayItem<T>(arr: T[], oldIndex: number, newIndex: number): T[] {
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    return arr;
};

export { hasAny, hasAll, moveArrayItem }