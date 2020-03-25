import {Pipe, PipeTransform} from '@angular/core'

@Pipe({
    name: 'sort'
})
export class SortPipe implements PipeTransform {

    transform(array: any, f: (a: any, b: any) => number) {
        if (!Array.isArray(array)) {
            return []
        }

        array.sort(f)

        return array
    }
}
