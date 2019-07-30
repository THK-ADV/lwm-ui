import {Injectable} from '@angular/core'
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http'
import {Observable} from 'rxjs'
import {environment} from '../../environments/environment'

@Injectable()
export class RouteInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!req.url.startsWith('http')) {
            const url = `${environment.backendUrl}:${environment.backendPort}/`
            req = req.clone({
                url: url + req.url
            })
        }

        console.log(req.url, req.params)

        return next.handle(req)
    }
}
