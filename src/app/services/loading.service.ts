import {Injectable} from '@angular/core'
import {Observable, Subscription} from 'rxjs'
import {tap} from 'rxjs/operators'
import {subscribe} from '../utils/functions'

@Injectable({
    providedIn: 'root'
})
export class LoadingService {

    private isLoading: boolean

    constructor() {
        this.isLoading = false
    }

    startSpinning = () => this.isLoading = true

    stopSpinning = () => this.isLoading = false

    isSpinning = (): boolean => this.isLoading
}

export const withSpinning = <A>(service: LoadingService): ($: Observable<A>) => Observable<A> => {
    return $ => {
        service.startSpinning()
        return $.pipe(tap(undefined, undefined, () => service.stopSpinning()))
    }
}
