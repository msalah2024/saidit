export const getBreakClass = (text: string): string => {
    return /\s/.test(text) ? 'break-words' : 'break-all'
}
