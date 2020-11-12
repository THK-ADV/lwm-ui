import {Injectable} from '@angular/core'
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http'
import {Observable, throwError} from 'rxjs'
import {catchError, map, tap} from 'rxjs/operators'
import {AlertService} from './alert.service'

export interface LWMError {
    status: number
    message: string
}

export interface PartialResult<A> {
    created: A[]
    failed: string[]
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
            console.error('Backend returned', error)
        }

        const status = error.status
        const msg = error.error.message
        const lwmError = {status: status, message: msg}

        this.alertService.reportLWMError(lwmError)

        return lwmError
    }

    // tslint:disable-next-line:no-console
    private logResp = <T>(action: string, url: string) => (t: T) => console.debug('HTTP SERVICE', action, url, t)

    getAll = <T>(
        url: string,
        params?: HttpParams
    ): Observable<T[]> => this.http
        .get<T[]>(url, {params})
        .pipe(
            catchError(this.handleError),
            tap(this.logResp('getAll', url))
        )

    get = <T>(
        url: string,
        id: string,
        params?: HttpParams
    ): Observable<T> => this.http
        .get<T>(`${url}/${id}`, {params})
        .pipe(
            catchError(this.handleError),
            tap(this.logResp('get', url))
        )

    get_ = <T>(
        url: string,
        params?: HttpParams
    ): Observable<T> => this.http
        .get<T>(url, {params})
        .pipe(
            catchError(this.handleError),
            tap(this.logResp('get_', url))
        )

    downloadXlsSheet = (
        url: string
    ): Observable<Blob> => {
        const options = {
            responseType: 'blob' as 'json'
        }

        return this.http
            .get<Blob>(url, options)
            .pipe(
                catchError(this.handleError),
                tap(this.logResp('download', url)),
                map(data => new Blob([data], {type: 'application/vnd.ms-excel'}))
            )
    }

    delete = <T>(
        url: string,
        id: string
    ): Observable<T> => this.http
        .delete<T>(`${url}/${id}`)
        .pipe(
            catchError(this.handleError),
            tap(this.logResp('delete', url))
        )

    delete_ = (
        url: string,
    ): Observable<unknown> => this.http
        .delete(url)
        .pipe(
            catchError(this.handleError),
            tap(this.logResp('delete', url))
        )

    create = <I, O>(
        url: string,
        element: I,
        params?: HttpParams
    ): Observable<O> => this.http
        .post<O>(url, element, {params})
        .pipe(
            catchError(this.handleError),
            tap(this.logResp('create', url))
        )

    put = <I, O>(
        url: string,
        id: string,
        element: I,
        params?: HttpParams
    ): Observable<O> => this.http
        .put<O>(`${url}/${id}`, element, {params})
        .pipe(
            catchError(this.handleError),
            tap(this.logResp('put', url))
        )

    put_ = <I, O>(
        url: string,
        body: I
    ): Observable<O> => this.http
        .put<O>(url, body)
        .pipe(
            catchError(this.handleError),
            tap(this.logResp('put_', url))
        )
}
