import {Injectable} from '@angular/core'
import {HttpClient, HttpErrorResponse} from '@angular/common/http'
import {Observable, throwError} from 'rxjs'
import {catchError} from 'rxjs/operators'

export interface LWMError {
    status: number
    msg: string
    message(): string
}

@Injectable({
    providedIn: 'root'
})

export class HttpService {

    constructor(private http: HttpClient) {
    }

    private handleError = (error: HttpErrorResponse): Observable<never> => throwError(this.makeErrorMessage(error))

    private makeErrorMessage = (error: HttpErrorResponse): LWMError => {
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
        return {status: status, msg: msg, message: () => msg + ' (Status Code: ' + status + ')'}
    }

    get<T>(url: string): Observable<T> {
        return this.http.get<T>(url)
            .pipe(catchError(this.handleError))
    }

    delete<T>(url: string, id: string): Observable<T> {
        return this.http.delete<T>(url + '/' + id)
            .pipe(catchError(this.handleError))
    }
}
