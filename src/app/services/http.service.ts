import {Injectable} from '@angular/core'
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http'
import {Observable, throwError} from 'rxjs'
import {catchError, map, tap} from 'rxjs/operators'
import {AlertService} from './alert.service'

export interface LWMError {
    status: number
    message: string
}

export interface CreationResponse<T> {
    status: string
    attempted: T[]
    created: T[]
    failed: T[]
}

export interface UpdatedResponse<T> {
    updated: T
}

export const nonAtomicParams = new HttpParams().set('atomic', 'false')
export const atomicParams = new HttpParams().set('atomic', 'true')

@Injectable({
    providedIn: 'root'
})

export class HttpService {

    constructor(private http: HttpClient, private alertService: AlertService) {
    }

    private handleError = (error: HttpErrorResponse): Observable<never> => throwError(this.makeErrorMessage(error))

    private makeErrorMessage = (error: HttpErrorResponse): LWMError => { // TODO move to alert service
        if (error.error instanceof ErrorEvent) {
            // A client-side or network alert occurred. Handle it accordingly.
            console.error('An alert occurred:', error.error.message)
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error('Backend returned code', error.status)
            console.error('body was', error.error)
        }

        const status = error.status
        const msg = error.error.message
        const lwmError = {status: status, message: msg}

        this.alertService.reportError(lwmError)

        return lwmError
    }

    get<T>(url: string, params?: HttpParams): Observable<T> {
        return this.http.get<T>(url, {params})
            .pipe(catchError(this.handleError))
    }

    delete<T>(url: string, id: string): Observable<T> {
        return this.http.delete<T>(`${url}/${id}`)
            .pipe(catchError(this.handleError))
    }

    createMany<I, O>(url: string, element: I[], params?: HttpParams): Observable<O[]> { // TODO change to single creation
        return this.http.post<CreationResponse<O>>(url, element, {params})
            .pipe(
                catchError(this.handleError),
                tap(r => {
                    console.log('status: ', r.status)
                    console.log('attempted: ', r.attempted)
                    console.log('created: ', r.created)
                    console.log('failed: ', r.failed)
                }),
                map(r => r.created as O[])
            )
    }

    create<I, O>(url: string, element: I, params?: HttpParams): Observable<O> { // TODO change to single creation
        return this.http.post<O>(url, element, {params})
            .pipe(
                catchError(this.handleError),
                tap(r => console.log('created', r))
            )
    }

    put<I, O>(url: string, id: string, element: I, params?: HttpParams): Observable<O> { // TODO response has nested updated object. remove it
        return this.http.put<UpdatedResponse<O>>(`${url}/${id}`, element, {params})
            .pipe(
                catchError(this.handleError),
                map(r => r.updated),
                tap(r => console.log('put resp: ', r))
            )
    }
}
