import {Pipe, PipeTransform} from '@angular/core'

@Pipe({
    name: 'sort',
    standalone: false
})
export class SortPipe implements PipeTransform {

    transform<A>(array: Array<A>, f: (a: A, b: A) => number): Array<A> {
        if (!Array.isArray(array)) {
            return []
        }

        array.sort(f)

        return array
    }
}
