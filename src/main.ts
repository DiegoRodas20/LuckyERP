/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */ 
 import '@angular/localize/init'; 
 import { enableProdMode } from '@angular/core';
 import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 
 import { AppModule } from './app/app.module';
 import { environment } from './environments/environment';
 
 const url = environment.BASE_URL;
 const urlTFI = environment.BASE_URL_TFI;
 const urlTIL = environment.BASE_URL_TIL;
 const urlEyGH = environment.BASE_URL_EyGH;
 const urlFinLeg = environment.BASE_URL_FinLeg;
 const urlComercial = environment.BASE_URL_Comercial;
 
 export function getBaseUrl() { 
   return url;
 }
 export function getBaseUrlTFI() {
    return urlTFI;
 }
 export function getBaseUrlTIL() {
  return urlTIL;
}
export function getBaseUrlEyGH() {
  return urlEyGH;
}
export function getBaseUrlFinLeg() {
  return urlFinLeg;
}
export function getBaseUrlComercial() {
  return urlComercial;
}
	
  
 const providers = [
   { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
   { provide: 'BASE_URL_TFI', useFactory: getBaseUrlTFI, deps: [] },
   { provide: 'BASE_URL_TIL', useFactory: getBaseUrlTIL, deps: [] },
   { provide: 'BASE_URL_EyGH', useFactory: getBaseUrlEyGH, deps: [] },
   { provide: 'BASE_URL_FinLeg', useFactory: getBaseUrlFinLeg, deps: [] },
   { provide: 'BASE_URL_Comercial', useFactory: getBaseUrlComercial, deps: [] }
 ];
 
 if (environment.production) {
   enableProdMode();
 }
 
 platformBrowserDynamic(providers).bootstrapModule(AppModule)
   .catch(err => console.log(err));
 