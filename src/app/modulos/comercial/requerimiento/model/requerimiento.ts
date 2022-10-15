export class Requerimiento{

    constructor(public nroRequerimiento:number,
        public  responsable:string,
        public fechaSolicitud:Date,public fechaRecibido:Date,
        public fechaInicio:Date, public cuenta:string){}

}