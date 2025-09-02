export interface Html {
    kind: 'html'
    value: string
}

export const makeHtmlParagraphs = <A>(xs: Array<A>, content: (a: A) => string): Html => ({
    kind: 'html',
    value: xs.reduce((str, x) => `${str}<p>${content(x)}</p>`, '')
})
