import { Component, OnInit, Inject } from "@angular/core";
import { Router } from "@angular/router";
import { SergeneralService } from "../../services/sergeneral.service";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  url: string
  lMenuName: string
  lEmpList: any = []
  lCabeceraBoolean: boolean = true
  listadoEmpresa: any[]
  nombreEmpresa: string
  lMenuList: any = []
  lMenuBoolean: boolean = false

  constructor(
    private vSerGeneral: SergeneralService,
    private spinner: NgxSpinnerService,
    private vRouter: Router,
    @Inject("BASE_URL") baseUrl: string
  ) {
    this.url = baseUrl;
  }

  ngOnInit(): void {
    let uno = localStorage.getItem("ListaMenu");

    if (!uno) {
      this.changeMessage();
    }
    else {
      this.lMenuList = JSON.parse(localStorage.getItem("ListaMenu"));
    }

    let user = localStorage.getItem("currentUser");
    this.vSerGeneral.customCabecera.subscribe(
      (msg) => (this.lCabeceraBoolean = msg)
    );

    this.vSerGeneral.customEmpList.subscribe((msg) => (this.lEmpList = msg));
    this.vSerGeneral.customEmpnom.subscribe((msg) => (this.nombreEmpresa = msg));
    this.lMenuName = JSON.parse(window.atob(user.split(".")[1])).uno;
    this.lEmpList = JSON.parse(localStorage.getItem("ListaEmpresa"));
    this.nombreEmpresa = localStorage.getItem("NomEmpresa");

  }

  fnMenu = function () {
    if (!this.lMenuBoolean) {
      this.vSerGeneral.changeMenuBoolean(true);
      this.lMenuBoolean = true;
    } else {
      this.vSerGeneral.changeMenuBoolean(false);
      this.lMenuBoolean = false;
    }
  };

  fnList = function (empresa, pais) {

    this.listadoEmpresa = JSON.parse(localStorage.getItem("ListaEmpresa"));
    const empresaSeleccionada = this.listadoEmpresa.filter(x => x.nIdEmp == empresa)
    this.nombreEmpresa = empresaSeleccionada[0].sDespEmp;
    localStorage.setItem('NomEmpresa', empresaSeleccionada[0].sDespEmp);
    let user = localStorage.getItem("currentUser");
    let id = JSON.parse(window.atob(user.split(".")[1])).uid;
    localStorage.setItem("Empresa", empresa);
    localStorage.setItem("Pais", pais);

    let pParametro = [];
    pParametro.push(id);
    pParametro.push(empresa);

    this.spinner.show();

    this.vSerGeneral.fnBarra("1", pParametro.join("|"), this.url).subscribe(
      (res) => {
        localStorage.setItem("ListaMenu", JSON.stringify(res.lMenu));
        this.vSerGeneral.changeMenuList(res.lMenu);
        this.vRouter.navigateByUrl("/inicio");
      },
      (err) => {
        console.log(err);
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    );
  };


  fnCerrarSesion = function () {
    this.vRouter.navigateByUrl("/login");
  };

  fnChange = function (op,id) { 
    localStorage.setItem('Menu',JSON.stringify(id));    
    this.vRouter.navigateByUrl("/" + op + "");
  };


  changeMessage() {    
    let user = localStorage.getItem('currentUser');
    let id = JSON.parse(window.atob(user.split('.')[1])).uid;  

    this.vSerGeneral.fnBarra('0',id, this.url).subscribe(
      res => {     
          
        this.lMenuBoolean = false;
        this.lMenuList = res.lMenu;
        localStorage.setItem('ListaMenu',JSON.stringify(res.lMenu));  
        localStorage.setItem('ListaEmpresa',JSON.stringify(res.lEmpresa)); 
        this.vSerGeneral.changeEmpList(res.lEmpresa);  
        this.isBigEnough(res.lEmpresa); 
      },
      err => {
        console.log(err);
        this.spinner.hide(); 
      },
      () => { 
        this.spinner.hide();  
      } 
    ) 
  }

  isBigEnough(array) {  
    for (var v in array) {     
      localStorage.setItem('Empresa',array[v].nIdEmp);  
      localStorage.setItem('NomEmpresa',array[v].sDespEmp);  
      this.vSerGeneral.changeEmpNom(array[v].sDespEmp);  
      localStorage.setItem('Pais',array[v].sIdPais);  
      if(v == '0')
      {
        return ;
      }
      
    }  
  }
}
