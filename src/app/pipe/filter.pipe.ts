import {Pipe, PipeTransform} from '@angular/core'

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {

    transform(text: string, search): string {
        const pattern = search
            .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
            .split(' ')
            .filter(t => t.length > 0)
            .join('|')
        const regex = new RegExp(pattern, 'gi')

        return search ? text.replace(regex, match => `<b>${match}</b>`) : text
    }
}
