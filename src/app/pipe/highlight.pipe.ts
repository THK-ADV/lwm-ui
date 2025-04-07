import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'highlight',
  standalone: false,
})
export class HighlightPipe implements PipeTransform {
  // copied from https://stackblitz.com/edit/angular-nue8pb?file=app%2Fautocomplete-overview-example.ts
  transform(text: string, search): string {
    const pattern = search
      .replace(/[\-\[\]\/{}()*+?.\\^$|]/g, '\\$&')
      .split(' ')
      .filter((t) => t.length > 0)
      .join('|')
    const regex = new RegExp(pattern, 'gi')
    return search ? text.replace(regex, (match) => `<b>${match}</b>`) : text
  }
}
