// Compare answers sets
export const isSameAnswer = (selected: number[], correct: number[]): boolean => {

    if (selected.length === 0 || selected.length !== correct.length) {
        return false
    }

    const correctSet = new Set(correct)

    return selected.every(index => correctSet.has(index))

}



// Rank label helper
export const rankLabel = (rank: number): string => {
    return rank === 1 ? '1er' : `${rank}e`
}
