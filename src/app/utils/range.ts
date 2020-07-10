export const rangeUntil = (start, end) =>
    Array.from({length: (end - start)}, (v, k) => k + start)

export const rangeTo = (start, end) =>
    rangeUntil(start, end + 1)
