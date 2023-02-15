
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

/**
 * Parse date as utc and returns in local time.
 * @param datetime YYYY-MM-DD hh-mm-ss.
 * @returns Local Date Time.
 */
function paraseDateTimeAsUTC(dateTime: string): Date {
  return new Date(Date.parse(dateTime) - new Date().getTimezoneOffset() * 60000);
}

/**
 * Convert local date to utc and apply format.
 * @param dateTime Date time in local.
 * @returns YYYY-MM-DD hh-mm-ss.
 */
function toUTCDateTimeString(dateTime: Date): string {
  const utc = new Date(dateTime.getTime() + dateTime.getTimezoneOffset() * 60000);

  const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(utc);
  const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(utc);
  const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(utc);
  const hours = new Intl.DateTimeFormat('en', { hour: '2-digit', hour12: false }).format(utc);
  const minutes = new Intl.DateTimeFormat('en', { minute: '2-digit', hour12: false }).format(utc);
  const seconds = new Intl.DateTimeFormat('en', { second: '2-digit', hour12: false }).format(utc);

  const formatted = `${year}-${month}-${day} ${hours}-${minutes}-${seconds}`;

  return formatted;
}

export { hasAny, hasAll, moveArrayItem, createGUID, groupBy, isNumber }