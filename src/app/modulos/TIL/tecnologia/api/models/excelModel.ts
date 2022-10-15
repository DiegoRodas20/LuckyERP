export interface ExcelObject {
  data: any[];
  error: String[];
}

export interface ExcelFormato {
  cabeceraExcel: string;
  cabeceraSQL: string;
  tipo: any;
  vacio?: boolean
}
