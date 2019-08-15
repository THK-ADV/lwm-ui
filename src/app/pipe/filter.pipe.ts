import {Pipe, PipeTransform} from '@angular/core'

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {

    transform(items: any[], predicate: (item: any) => boolean): any[] {
        return items.filter(predicate)
    }
}
