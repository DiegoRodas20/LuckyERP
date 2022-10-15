import { ElementSchemaRegistry } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
// import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class Oauth2Guard implements CanActivate {

  constructor(private router: Router) { }
  canActivate() {
   if (localStorage.getItem('currentUser') != null) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }

  }
}