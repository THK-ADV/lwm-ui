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

export const CALENDAR_ENTRY_COLOR = [
    {background: '#ff0033', font: '#ffffff'},  //red
    {background: '#ffcc00', font: '#ffffff'},  //orange
    {background: '#ff3300', font: '#ffffff'},  //darkorange
    {background: '#cc33ff', font: '#ffffff'},  //lavender
    {background: '#cc00cc', font: '#ffffff'},  //magenta
    {background: '#cc0000', font: '#ffffff'},  //darkred
    {background: '#993300', font: '#ffffff'},  //brown
    {background: '#9900cc', font: '#ffffff'},  //violet
    {background: '#663300', font: '#ffffff'},  //darkbrown
    {background: '#6600ff', font: '#ffffff'},  //midblue
    {background: '#6600cc', font: '#ffffff'},  //darkviolet
    {background: '#3300cc', font: '#ffffff'},  //darkblue
    {background: '#32cc00', font: '#ffffff'},  //green
    {background: '#009933', font: '#ffffff'},  //darkgreen
    {background: '#0033ff', font: '#ffffff'}  //blue
]