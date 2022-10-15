import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";

@Injectable()
export class Oauth2Interceptor implements HttpInterceptor {

  constructor(private router: Router) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (localStorage.getItem('currentUser') != null) {
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + localStorage.getItem('currentUser'))
      });
      return next.handle(clonedReq).pipe(
        tap(
          succ => { },
          err => {
            //acceso no autorizado
            if (err.status == 401) {
              localStorage.removeItem('currentUser');
              this.router.navigateByUrl('/login');
            }
            //prohibido el accesso
            else if (err.status == 403) {
              localStorage.removeItem('currentUser');
              this.router.navigateByUrl('/login');
            }
            //error en conexion con el servidor
            else if (err.status == 500) {
              localStorage.removeItem('currentUser');
              this.router.navigateByUrl('/login');
            }
          }
        )
      )
    }
    else
      return next.handle(req.clone());
  }
}
