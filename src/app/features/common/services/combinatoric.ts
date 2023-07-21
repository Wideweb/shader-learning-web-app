export const generateCombinations = (symbols: string[], maxLength: number): string[] => {
    let result: string[] = [];
    for (let length = 1; length <= maxLength; length++) {
        result = result.concat(generateCombinationsFixedLength(symbols, length));
    }

    return result;
}

export const generateCombinationsFixedLength = (symbols: string[], length: number): string[] => {
    if (length === 0) {
        return [''];
    }

    const result: string[] = [];
    symbols.forEach(symbol => {
        const combinations = generateCombinationsFixedLength(symbols, length - 1);
        combinations.forEach(combination => {
            result.push(symbol + combination);
        })
    });
    return result;
}