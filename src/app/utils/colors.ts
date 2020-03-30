export type LWMColor = 'primary' | 'accent' | 'warn'

export const color = (c: LWMColor) => {
    switch (c) {
        case 'primary':
            return '#b43092'
        case 'accent':
            return '#ea5a00'
        case 'warn':
            return '#c81e0f'
    }
}

export const whiteColor = () => '#ffffff'

export const chipColorPalette = [
    '#6975A6',
    '#F28A30',
    '#F05837',
    '#0584F2',
    '#A7414A',
    '#00743F',
    '#888C46',
    '#A3586D',
    '#0ABDA0',
    '#8D2F23'
]