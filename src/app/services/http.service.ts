import {Injectable} from '@angular/core'
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http'
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

@Injectable({
    providedIn: 'root'
})

export class HttpService {

    constructor(private http: HttpClient, private alertService: AlertService) {
    }

    private handleError = (error: HttpErrorResponse): Observable<never> => throwError(this.makeErrorMessage(error))

    private makeErrorMessage = (error: HttpErrorResponse): LWMError => { // TODO move to error service
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message)
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

    get<T>(url: string): Observable<T> {
        return this.http.get<T>(url)
            .pipe(catchError(this.handleError))
    }

    delete<T>(url: string, id: string): Observable<T> {
        return this.http.delete<T>(`${url}/${id}`)
            .pipe(catchError(this.handleError))
    }

    create<I, O>(url: string, ...element: I[]): Observable<O[]> {
        return this.http.post<CreationResponse<O>>(url, element)
            .pipe(
                catchError(this.handleError),
                tap(r => {
                    console.log('attempted: ', r.attempted)
                    console.log('created: ', r.created)
                    console.log('failed: ', r.failed)
                }),
                map(r => r.created as O[])
            )
    }
}