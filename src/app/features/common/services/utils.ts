
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

function createGUID() {
    function _p8(s: boolean) {  
        var p = (Math.random().toString(16)+"000000000").substring(2,8);  
        return s ? "-" + p.substring(0,4) + "-" + p.substring(4,4) : p ;  
     }  
     return _p8(false) + _p8(true) + _p8(true) + _p8(false);  
}

function groupBy<T, K extends keyof any>(arr: T[], key: (i: T) => K) {
  return arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

function isNumber(value: string | number): boolean {
   return ((value != null) &&
           (value !== '') &&
           !isNaN(Number(value.toString())));
}

export { hasAny, hasAll, moveArrayItem, createGUID, groupBy, isNumber }