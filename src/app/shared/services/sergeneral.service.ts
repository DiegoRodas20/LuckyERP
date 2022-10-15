import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class SergeneralService {
  private vMenu = new BehaviorSubject<boolean>(false);
  private vCabecera = new BehaviorSubject<boolean>(true);
  private vMenuList = new BehaviorSubject<string>('');
  private vEmpList = new BehaviorSubject<string>("");
  private vNomList = new BehaviorSubject<string>("");
  public customMenu = this.vMenu.asObservable();
  public customMenuList = this.vMenuList.asObservable();
  public customCabecera = this.vCabecera.asObservable();
  public customEmpList = this.vEmpList.asObservable();
  public customEmpnom = this.vNomList.asObservable();

  constructor(private http: HttpClient) {}

  fnBarra(a: string, b: string, url: string): Observable<any> {
    const urlEndpoint = url + "GeneralService/GetMenu";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = "?pOpcion=" + a + "&pParametro=" + b;
    return this.http
      .get(urlEndpoint + params, { headers: httpHeaders })
      .pipe(map((response) => response));
  }

  fnSystemElements(
    a: string,
    b: string,
    c: string,
    d: string,
    e: string,
    url: string
  ): Observable<any> {
    const urlEndpoint = url + "GeneralService/GetSystemElements";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params =
      "?pOpcion=" +
      a +
      "&pCodTabla=" +
      b +
      "&pStatus=" +
      c +
      "&pCampos=" +
      d +
      "&pValues=" +
      e;

    return this.http
      .get(urlEndpoint + params, { headers: httpHeaders })
      .pipe(map((response) => response));
  }

  fnElementos(
    a: string,
    b: string,
    c: string,
    d: string,
    e: string,
    url: string
  ): Observable<any> {
    const urlEndpoint = url + "GeneralService/GetElementos";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params =
      "?pOpcion=" +
      a +
      "&pCodTabla=" +
      b +
      "&pPais=" +
      c +
      "&pOrden=" +
      d +
      "&pValor=" +
      e;

    return this.http
      .get(urlEndpoint + params, { headers: httpHeaders })
      .pipe(map((response) => response));
  }

  fnUbigeos(pOpcion: string, pParametro: string, url: string): Observable<any> {
    const urlEndpoint = url + "GeneralService/GetUbigeoElements";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = "?pOpcion=" + pOpcion + "&pParametro=" + pParametro;

    return this.http
      .get(urlEndpoint + params, { headers: httpHeaders })
      .pipe(map((response) => response));
  }

  public changeMenuBoolean(msg): void {
    this.vMenu.next(msg);
  }

  public changeCabeceraBoolean(msg): void {
    this.vCabecera.next(msg);
  }

  public changeEmpList(msg): void {
    this.vEmpList.next(msg);
  }

  public changeMenuList(msg): void { 
    this.vMenuList.next(msg);
  }

  public changeEmpNom(msg): void { 
    this.vNomList.next(msg);
  }

}
