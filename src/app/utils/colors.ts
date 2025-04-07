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
