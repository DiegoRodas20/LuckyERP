/****** Object:  StoredProcedure [Comercial].[sp_Tareo_Staff]    Script Date: 31/01/2021 17:47:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 /****************************************************************************************                            
Autor: Juan Gutierrez                            
Fecha: Diciembre 2020                            
Asunto: Store Procedure para el registro de "Tareo Staff" SYS. ERP => Aplicativo => Comercial.                            
Exec  [Comercial].[sp_Tareo_Staff] 6,N'193|1|198|0|2021|1456|337|0|0|0|0|0|0|0|0|0'

Exec  [Comercial].[sp_Tareo_Staff] 5,N'1|1|0|0|0|0|0|0|0|0|0|0|341|0|0|0'
Exec  [Comercial].[sp_Tareo_Staff] 9,N'1|1|193|93|0|0|0|0|0|0|0|0|337|0|0|0'
exec  [Comercial].[sp_Tareo_Staff] 11,N'200044,Ppto impulso Blanca Flor Dic,001,62,100,30,119,428,2003,1,6790.04|30|2020|1467|193|1|198'
exec  [Comercial].[sp_Tareo_Staff] 10,N'200044,Ppto impulso Blanca Flor Dic,001,62,100,30,119,428,2003,1,6790.04|30|2020|1467|193|1|198'
                                        210002,Presupuesto 21-01           ,001,62,10,2.3,123,428,2003,2,1958.67,23|23|2021|1456|211|1|198

Exec  [Comercial].[sp_Tareo_Staff] 11,N'200044,Ppto impulso Blanca Flor Dic,001,62,15,3.45,119,428,2003,1,6790.04|23|2020|1467|211|1|198'


delete from Det_TareoStaff
select * from #tmpDet_TareoStaff
****************************************************************************************/                                       
ALTER Proc [Comercial].[sp_Tareo_Staff]                            
(                            
   @pOpcion    Int                            
 , @pParametro Varchar(Max)                             
)                            
As                              
Set NoCount On;                            
Begin                                                
--Eliminacion de tablas temporales de consultas en la 'TEMPDB'                      
If Object_Id('tempdb.dbo.#tmpConsultaEmpleadoTareo','U') Is not Null Drop Table #tmpConsultaEmpleadoTareo;                       
If Object_Id('tempdb.dbo.#tmpConsultaListadoTareos','U') Is not Null Drop Table #tmpConsultaListadoTareos;        

IF OBJECT_ID('tempdb..##tmpDet_TareoStaff') IS NULL
BEGIN
	create table ##tmpDet_TareoStaff	 
 		(
		nId                Int,
		nIdTareoStaffDet   Int,
		nIdTareoStaff	   Int,     
		nIdCentroCosto	   Int,                     --1
		nIdPerfil	       Int,                     --2  
		nIdCanal	       Int,                     --3   
		nSaldoDias	       Int,                     --4 calculado
		nSaldoDinero	   Decimal(15,4),           --5 calculado
		nPorcentaje	       Decimal(15,4),           --6 calculado
		nDiasPropor	       Decimal(15,4),           --7 calculado
		nCostoEmpPropor	   Decimal(15,4),           --8 calculado
		nSaldoDiasTrab	   Decimal(15,4),           --8 calculado
		nSaldoDineroTrab   Decimal(15,4),           --8 calculado
	   ) 
END

   	 Drop Table  If Exists #tmpConsultaStoreCampania  
	 Create Table #tmpConsultaStoreCampania
	 (
		nId                  Int Identity(1,1) Primary Key,
		idCC	             Int          ,
		sCodCC				 Varchar(10)  ,
		sDescCC				 Varchar(120) ,
		dFecIni				 date         ,
		dFecFin				 date         ,  
		idCanal				 int          ,
		sCodCanal			 Varchar(3)   ,
		sCanal				 Varchar(60)  ,
		idCategoria			 int          ,
		codCategoria		 Varchar(4)   ,
		desCategoria		 Varchar(60)  ,
		ndiaPla				 Int		  ,
		nEstado				 int          ,
		sEstado				 Varchar(30)  ,
		nAprobacionPre		 int          ,
		sAprobacionPre		 Varchar(30)  ,
		idSuc				 int          ,
		sCod				 Varchar(3)   ,
		sDesc				 Varchar(30)  ,
		nIdPartida			 Int          ,
		CodEsp				 Varchar(4)   , 
		desEsp				 Varchar(30)  ,
		nImporte			 decimal(15,4)      
	);                          

	Begin
	

 Declare @vr_nIdTareoStaff As Int, @v_sTipoDoc   As Varchar(2) , @v_nIdEmpresa  As Int  , @v_sCorrelativo As Varchar(7)     , @v_nEj  As Int            ,                             
   @v_nIdMes         As Int, @v_nIdResponsable   As Int        , @v_nIdPersonal As Int  , @v_nIdCargo     As Int            , @v_nIdPartida As Int            ,                             
   @v_nIdSucursal    As Int, @v_dFchIng          As Date       , @v_dFchBaja    As Date , @v_nTotalDias   As Int            , @v_nTotalPorc As Int            ,                                        
   @v_nCreaIdUsr     As Int, @v_nEstado          As Int        , @v_nDiasMaxPer As Int  , @v_cCostoEmp    As Decimal (15,2) , @v_cTotal     As Decimal (15,2) ,            
   @v_cPorcentaje    As Int, @v_cNameUser        As Varchar(25), @v_sDetalle    As Varchar (max)                             
              
 --variables Busqueda de Sucursal, Pais                          
 Declare @v_nIdEntidad     As Int, @v_sIdUbigeo  As Int , @v_nSucCod  As Int,  @v_sIdPais  As Int,   @v_nIdTareoStaff  As Int                
 --Variable para la busqueda de tareos por años                      
 Declare @v_nConsultaAnio  As Int                
 --Variable para la busqueda de partida y descripcion (sCodPartida sDescPartida)                
 Declare @v_sCodPartida    As Varchar(25) = '', @v_sDescPartida as Varchar(25) = ''                 
 Declare @v_tblPartida     As Table(nIdPartida Int,sCodPartida Varchar(25),sDescPartida Varchar(25))                            
 Declare @tParametro       As Table (id Int Identity(1,1) Primary key, valor Varchar(max))  ---cabecera 
 --Declare @LParametro       As Table (id Int Identity(1,1) Primary key, valor Varchar(max))  ---consultaLineas   
 --            
 Declare @tmpPersonal      As Table (nidPersonal Smallint,sNombres Varchar(40),nIdCargo smallint);            
 Declare @tablaMeses      As Table (id Int Identity Primary Key,cEleNam Varchar(40),nEleCod Smallint,nidPersonal Smallint,sNombres Varchar(40),nIdCargo smallint);            
 --declare @v_nCostoEmpPropor as int = 0
 Declare  @contDias  as Int = 0, @v_Subsidios   as Int = 0, @v_Vacaciones as Int = 0;			
 Declare @xv_nIdMes as int,@xv_nEj as int,@xv_nIdPersonal as int ,  @tareoDias as int           

 Declare  @ncostoEmpresa        decimal(18,4)  = FLOOR(RAND()*(3000-1000)+1000);

 If(Len(Ltrim(Rtrim(@pParametro))) > 0 and @pOpcion <> 6 And  @pOpcion  <> 11)                             
  Begin                            
    Insert Into @tParametro(valor)  Select data From split(@pParametro, '|');                                        
  End 

  Begin                                          
   Set @v_sTipoDoc        = 'TS';   
   Set @v_nIdEmpresa      = (Select valor From @tParametro Where id = 1);     
   Set @v_sCorrelativo    = (Select RIGHT('0000000' + Ltrim(Str(Count(*) + 1)),7) From [Comercial].[TBL_TareoStaff] Where nIdEmpresa = @v_nIdEmpresa);                                                                
   Set @v_nIdResponsable  = (Select nCodPer  From SYSTEM_ERP.TBL_USER     Where  nCodUser  = (Select valor From @tParametro Where id = 2));                
   
   Set @v_cNameUser       = (Select nameUser From SYSTEM_ERP.TBL_USER     Where  nCodUser  = (Select valor From @tParametro Where id = 2));                
   Set @v_nIdPersonal     = (Select valor    From @tParametro Where id = 3);                         
   Set @v_nIdCargo        = (Select valor    From @tParametro Where id = 4);                             
   --Se obtiene el el Id del pais de la empresa, luego la partida.                          
   Set  @v_sIdPais        = (Select sIdPais From [System_Erp].[TBL_EMPRESA]  Where nIdEmp = @v_nIdEmpresa)                               
            
   Insert into @v_tblPartida Select MAT.nIdPartida As nIdPartida,PAR.sCod    As sCodPartida,PAR.sDesc As sDescPartida From Presupuesto.TBL_PARTIDA_CARGO MAT                           
           Inner join [System_Erp].[TBL_TIPO_ELEMENTO] PAR On PAR.nIdTipEle = MAT.nIdPartida                           
           Inner join [System_Erp].[TBL_TIPO_ELEMENTO] CAR On CAR.nIdTipEle = MAT.nIdCargo                           
           Where  PAR.nIdPais = @v_sIdPais And MAT.nIdCargo = @v_nIdCargo   And MAT.nIdEstado = 1                       
            
   Set @v_nIdPartida     =  (Select nIdPartida   From @v_tblPartida)                
   Set @v_sCodPartida    =  (Select sCodPartida  From @v_tblPartida)                
   Set @v_sDescPartida   =  (Select sDescPartida From @v_tblPartida)                                                        
   Set @v_nTotalDias      = (select [Comercial].[fn_DiasEnMes](GETDATE()));
   Set @v_nTotalPorc      = (Select valor        From @tParametro Where id = 6);                                 
   Set @v_nCreaIdUsr      = (Select valor        From @tParametro Where id = 7);                           
   Set @v_nEstado         = (Select nEleCod      From General.SYSTEM_ELEMENTS  Where nElecodDad = 2050 And cEleCod = ( Select valor from @tParametro where id = 8));                                                       
   Set @v_cCostoEmp       = @ncostoEmpresa
   Set @v_cPorcentaje     = (Select valor        From @tParametro where id = 11);                                                                          
   Set @v_nConsultaAnio   = (Select valor        From @tParametro where id = 12); --variable para obtener el año a Consultar            
   Set @v_nIdTareoStaff   = (Select valor        From @tParametro where id = 13)  --IdTareoStaff;           
   Set @v_nIdMes          = (Select valor        From @tParametro where id = 14)  --mes          
   Set @v_nEj             = (Select valor        From @tParametro where id = 15) --anio          
   Set @v_sDetalle        = (Select valor        From @tParametro where id = 16)  --Detalle;              
            
   ---Busqueda de Sucursal                              
   Set @v_nIdEntidad      = (Select nIdEntidad   From  [System_Erp].[TBL_ENTIDAD]       Where NIDPERSONAL = @v_nIdPersonal)                           
   Set @v_sIdUbigeo       = (Select sIdUbigeo    From  [System_Erp].[TBL_DIRECCION]     Where nIdEntidad  = @v_nIdEntidad)                           
   Set @v_nSucCod         = (Select nSucCod      From  geographiclocation.GEO_ENTITIES  Where cEntCod     = @v_sIdUbigeo)                           
   Set @v_nIdSucursal     = (Select nIdTipEle    From  [System_Erp].[TBL_TIPO_ELEMENTO] Where nDadTipEle  = 694 And nIdTipEle = @v_nSucCod)                      
   End              
  Begin              
   --Consulta listado Tareos Staff (busqueda por años, por usuarios)              


   Set @v_dFchIng  = (Select B.dFechIni From [RRHH].[TBL_PERSONAL] A 
							   Join [RRHH].[TBL_PERIODO_LABORAL] B On ( A.nIdPersonal = B.nIdPersonal And B.dFechFin is Null )                            
							   Where A.nIdPersonal = @v_nIdResponsable
							  );

	Set @v_dFchBaja = (Select dFechFin From [RRHH].[TBL_PERSONAL] A 
							   Join [RRHH].[TBL_PERIODO_LABORAL] B On ( A.nIdPersonal = B.nIdPersonal And B.dFechFin Is Null )                            
							   Where A.nIdPersonal = @v_nIdResponsable
							   );

  Select        
  I.nIdTareoStaff                         As idTareo     ,       
  I.sCorrelativo                          As nro         ,                          
  I.nEj                                   As anio        ,               
  K.cEleCod                               As mes         ,                          
  B.sDocumento                            As descripcion ,                          
  Rtrim(Concat(Rtrim(A.sApePa)                           ,                          
  Space(1),Rtrim(A.sApeMa)                               ,                          
  Space(1),Rtrim(A.sPriNom)                              ,                          
  Space(1),Rtrim(A.sSegNom)))             As personal ,                          
  J.cEleNam                               As estado      ,                      
  I.nIdPersonal                           As IdPersonal  ,              
  I.nIdCargo                              As idCargo     ,                               
  dCreaFecha                              As FechaCreate ,
  I.nIdResponsable 
           
  Into #tmpConsultaListadoTareos                    
  From [RRHH].[TBL_PERSONAL]            A                     
  Join [RRHH].[DET_DOCUMENTO]           B   On (A.nIdPersonal = B.nIdPersonal And B.dFechFin IS NULL)                     
  Join [RRHH].[TBL_TIPO_DOCUMENTO]      C   On  B.nIdTipoDoc  = C.nIdTipoDoc                     
                                                  
  Join [RRHH].[TBL_PERIODO_LABORAL]     D   On (A.nIdPersonal = D.nIdPersonal And D.dFechFin IS NULL)                                          
  Join [RRHH].[DET_PLPLANILLA]          E   On (D.nIdPerLab   = E.nIdPerLab   And E.dFechFin IS NULL)                     
  Join [RRHH].[TBL_PLANILLA]            F   On  E.nIdPlla     = F.nIdPlla                                     
  Join [RRHH].[DET_PLCARGO]             G   On (D.nIdPerLab   = G.nIdPerLab   And G.dFechFin IS NULL)                     
  Join [System_Erp].[Tbl_Tipo_Elemento] H   On  G.nIdCargo    = H.nIdTipEle                     
                                      
  Join [Comercial].[TBL_TareoStaff]     I   On I.nIdPersonal  = A.nIdPersonal                    
  Join General.SYSTEM_ELEMENTS          J   On J.nEleCod      = I.nEstado                         
  Join General.SYSTEM_ELEMENTS          k   On K.nEleCod      = I.nIdMes                         
  Where sCodPlla in('7')            
  End            
  Begin            
  Insert Into @tmpPersonal            
  Select   A.nIdPersonal, Rtrim(sPriNom)+ Space(1) +Rtrim(sSegNom) + Space(1) + Rtrim(sApePa)+ Space(1) +Rtrim(sApeMa) as sNombres, G.nIdCargo            
  From    [RRHH].[TBL_PERSONAL]                       A                           
    Inner Join [RRHH].[DET_DOCUMENTO]           B    On (A.nIdPersonal = B.nIdPersonal And B.dFechFin Is Null)                           
    Inner Join [RRHH].[TBL_TIPO_DOCUMENTO]      C    On  B.nIdTipoDoc  = C.nIdTipoDoc                           
    Inner Join [RRHH].[TBL_PERIODO_LABORAL]     D    On (A.nIdPersonal = D.nIdPersonal And D.dFechFin Is Null)                            
    Inner Join [RRHH].[DET_PLPLANILLA]          E    On (D.nIdPerLab   = E.nIdPerLab   And E.dFechFin Is Null)                           
    Inner Join [RRHH].[TBL_PLANILLA]            F    On  E.nIdPlla     = F.nIdPlla                           
    Inner Join [RRHH].[DET_PLCARGO]             G    On (D.nIdPerLab   = G.nIdPerLab   And G.dFechFin Is Null)                           
    Inner Join [System_Erp].[Tbl_Tipo_Elemento] H    On  G.nIdCargo   = H.nIdTipEle                 
  Where  sCodPlla in('7')                 
  And G.nIdCargo in(8,26,32,93)                
  End                   
        
  If(@pOpcion = 1)                             
   Begin                   
   Declare @v_tblDetalleTareo as Table(nIdTareoStaff int, nIdCentroCosto int, nIdPerfil  int, nIdCanal  int, nSaldoDias Decimal (15,4),            
                                       nSaldoDinero Decimal (15,4), nPorcentaje Decimal (15,4), nDiasPropor  Decimal (15,4), nCostoEmpPropor Decimal (15,4))                        
            
    Insert Into @v_tblDetalleTareo  Select 0,[1],[2],[3],[4],[5],[6],[7],[8]       From (                
         Select a.id  pri ,s.id segu,s.[data] valor From  dbo.Split(@v_sDetalle,'/') a Cross Apply dbo.Split(a.[data],',') s ) As SourceTable             
      Pivot(Max(valor) For segu In ([1], [2], [3], [4], [5], [6],[7],[8])) As PivotTable;                                
              
 If Not Exists(Select 1 from [Comercial].[TBL_TareoStaff] Where nIdTareoStaff = @v_nIdTareoStaff )              
	Begin   ---Inicio 01            
 
	Insert into [Comercial].[TBL_TareoStaff]             
	(sTipoDoc       ,nIdEmpresa    ,sCorrelativo    ,nEj            ,nIdMes     ,nIdResponsable    ,nIdPersonal                              
	,nIdCargo       ,nIdPartida    ,nIdSucursal     ,dFchIng        ,dFchBaja   ,nTotalDias        ,nTotalPorc            
	,dCreaFecha     ,nCreaIdUsr    ,nModIdUsr       ,dModFecha      ,nEstado    ,DiasMaxPer        ,nCostoEmp)                             
                               --select * from  TBL_TareoStaff	
	Values                       
	(@v_sTipoDoc    ,@v_nIdEmpresa ,@v_sCorrelativo ,@v_nEj         ,@v_nIdMes  ,@v_nIdResponsable             
	,@v_nIdPersonal ,@v_nIdCargo   ,@v_nIdPartida   ,@v_nIdSucursal ,@v_dFchIng ,@v_dFchBaja       ,@v_nTotalDias                                 
	,@v_nTotalPorc  ,GETDATE()     ,@v_nCreaIdUsr   ,NULL ,NULL     ,@v_nEstado ,@v_nDiasMaxPer    ,@v_cCostoEmp);                                   
	Set @vr_nIdTareoStaff = Scope_Identity()                           
	Insert into [Comercial].[DET_TareoStaff]    
	(nIdTareoStaff  ,nIdCentroCosto, nIdPerfil, nIdCanal, nSaldoDias,nSaldoDinero, nPorcentaje ,nDiasPropor,nCostoEmpPropor)                                                  
	--Select  @vr_nIdTareoStaff      ,nIdCentroCosto, nIdPerfil, nIdCanal, nSaldoDias,nSaldoDinero, nPorcentaje ,nDiasPropor,nCostoEmpPropor From @v_tblDetalleTareo                  
	Select     @vr_nIdTareoStaff,	        
	T.nIdCentroCosto ,
	T.nIdPerfil ,
	T.nIdCanal,
	T.nSaldoDias,
	T.nSaldoDinero,
	T.nPorcentaje,
	T.nDiasPropor,
	T.nCostoEmpPropor		  
	From ##tmpDet_TareoStaff as T    
	Select  id = @vr_nIdTareoStaff ,usua = @v_cNameUser      , tareo   = @v_sCorrelativo        , estado = 'P - PENDIENTE' For Json Path                 
	-- Begin
	--Drop Table If Exists ##tmpDet_TareoStaff
	-- End
	Return;              
	End  --Fin 01            
    
 IF Exists(Select 1 from [Comercial].[TBL_TareoStaff] Where nIdTareoStaff = @v_nIdTareoStaff AND  nEstado = @v_nEstado)              
  Begin                
   Begin              
    Delete From [Comercial].[DET_TareoStaff]  Where nIdTareoStaff  =  @v_nIdTareoStaff                  
   End              
    Begin              
	Update [Comercial].[TBL_TareoStaff] Set  nModIdUsr = @v_nCreaIdUsr,dModFecha = GETDATE(), nEstado = @v_nEstado   Where  nIdTareoStaff = @v_nIdTareoStaff 
	Insert into [Comercial].[DET_TareoStaff] (nIdTareoStaff, nIdCentroCosto, nIdPerfil, nIdCanal, nSaldoDias, nSaldoDinero, nPorcentaje, nDiasPropor, nCostoEmpPropor)                                    

	--Select  @v_nIdTareoStaff,nIdCentroCosto,nIdPerfil,nIdCanal,nSaldoDias,nSaldoDinero,nPorcentaje,nDiasPropor,@v_nCostoEmpPropor                         
	--From @v_tblDetalleTareo        
	Select  @v_nIdTareoStaff,	        
	T.nIdCentroCosto ,
	T.nIdPerfil ,
	T.nIdCanal,
	T.nSaldoDias,
	T.nSaldoDinero,
	T.nPorcentaje,
	T.nDiasPropor,
	T.nCostoEmpPropor		  
	From ##tmpDet_TareoStaff as T 
	Select  id = @vr_nIdTareoStaff ,usua = @v_cNameUser      , tareo   = @v_sCorrelativo        , estado = 'P - PENDIENTE' For Json Path    
    End
	
    End     
    Else    
    Begin    
   Begin              
    Delete From [Comercial].[DET_TareoStaff]  Where nIdTareoStaff  =  @v_nIdTareoStaff                  
   End              
      Begin              
    Update [Comercial].[TBL_TareoStaff] Set  nModIdUsr = @v_nCreaIdUsr,dModFecha = GETDATE(), nEstado = @v_nEstado   Where  nIdTareoStaff = @v_nIdTareoStaff   
	
    Insert into [Comercial].[DET_TareoStaff] (nIdTareoStaff, nIdCentroCosto, nIdPerfil, nIdCanal, nSaldoDias, nSaldoDinero, nPorcentaje, nDiasPropor, nCostoEmpPropor)                                    

    --Select  @v_nIdTareoStaff,nIdCentroCosto,nIdPerfil,nIdCanal,nSaldoDias,nSaldoDinero,nPorcentaje,nDiasPropor,@v_nCostoEmpPropor                         
    --From @v_tblDetalleTareo               

	--Insert Into Det_TareoStaff	
	 Select @v_nIdTareoStaff,	        
	        T.nIdCentroCosto ,
			  T.nIdPerfil ,
			  T.nIdCanal,
			  T.nSaldoDias,
			  T.nSaldoDinero,
			  T.nPorcentaje,
			  T.nDiasPropor,
			  T.nCostoEmpPropor		  
	 From ##tmpDet_TareoStaff as T 

       Select id = @v_nIdTareoStaff,usua = @v_cNameUser,tareo = @v_sCorrelativo, estado = 'V - ENVIADO A RRHH' For Json Path                 
	   Begin
	   Delete From ##tmpDet_TareoStaff
       End
      End  	  
    End    
    
 End --fIN Exists                                
                             
	If(@pOpcion = 2)  --Listado de empleados a Atarear.(Select-ComboBox)                           
	Begin                             		
		Select * From @tmpPersonal a Order by  sNombres                                 	
    End                            
 If(@pOpcion = 3)  --Listado de empleados a Atarear.(Select-ComboBox)                           
 Begin                       
  Insert Into @tablaMeses            
  Select A.cEleNam,A.nEleCod,B.nidPersonal,B.sNombres,B.nIdCargo From @tmpPersonal B            
  cross Join General.SYSTEM_ELEMENTS  A              
  Where nEleCodDad = 1455             
  Order By A.cEleCod                         
  Set @v_nIdMes = (Select nEleCod  From General.SYSTEM_ELEMENTS Where nEleCodDad = 1455 And Cast(cEleCod as Int) = Month(Getdate()));                            
                
  If(@v_nConsultaAnio = YEAR(GETDATE()))            
  Begin            
   If Exists ((Select 1 From  Comercial.TBL_TareoStaff Where nIdPersonal = @v_nIdPersonal and  nEj = @v_nConsultaAnio))            
   Begin            
    Select * From @tablaMeses  Where id Not In            
    (            
     Select id  From @tablaMeses as A              
     Join  Comercial.TBL_TareoStaff B On B.nIdPersonal = A.nidPersonal             
     And A.nEleCod = B.nIdMes            
     Where A.nIdPersonal In (Select nIdPersonal From Comercial.TBL_TareoStaff Where nEj = @v_nConsultaAnio)             
     And   A.nEleCod     In (Select nIdMes      From Comercial.TBL_TareoStaff Where nEj = @v_nConsultaAnio)            
    )            
    And nIdPersonal = @v_nIdPersonal             
    And nEleCod = @v_nIdMes            
   End            
   Else            
   Begin            
    Select * From @tablaMeses  Where nIdPersonal = @v_nIdPersonal             
    And nEleCod = @v_nIdMes            
   End            
  End            
  Else            
  Begin            
    If Exists ((Select 1 From  Comercial.TBL_TareoStaff Where nIdPersonal = @v_nIdPersonal and  nEj = @v_nConsultaAnio))            
    Begin            
     Select * From @tablaMeses  Where id Not In            
     (            
    Select id  From @tablaMeses as A              
      Join  Comercial.TBL_TareoStaff B On B.nIdPersonal = A.nidPersonal             
      And A.nEleCod = B.nIdMes            
      Where A.nIdPersonal In (Select nIdPersonal From Comercial.TBL_TareoStaff Where nEj = @v_nConsultaAnio)             
      And   A.nEleCod     In (Select nIdMes      From Comercial.TBL_TareoStaff Where nEj = @v_nConsultaAnio)            
     )            
     And nIdPersonal = @v_nIdPersonal             
    End            
    Else            
    Begin            
     Select * From @tablaMeses  Where nIdPersonal = @v_nIdPersonal                
    End 
	Begin
	Delete From ##tmpDet_TareoStaff
	End
   End            
 End                                                             
    If(@pOpcion = 4)  --Consulta tareo por empleados                      
    Begin 
		Begin
		Select                                                         
		idCargo     = H.sCod,           
		idPartida   = @v_nIdPartida ,                          
		codPartida  = @v_sCodPartida ,                          
		partida     = @v_sDescPartida ,                                       
		estado      = 'NUEVO',                          
		idQuincena  = 02,                          
		quincena    = 'Fin de Mes',                                            
		cargo       = Rtrim(H.sDesc),                          
		idCiudad    = (Select sCod   From  [System_Erp].[TBL_TIPO_ELEMENTO] Where nDadTipEle   = 694 And nIdTipEle  = @v_nSucCod),                       
		ciudad      = (Select sDesc  From  [System_Erp].[TBL_TIPO_ELEMENTO] Where nDadTipEle   = 694 And nIdTipEle  = @v_nSucCod),
		nTotalDias  = @v_nTotalDias 
		--nDiasMaxPer = @v_nDiasMaxPer            
		From      [RRHH].[TBL_PERSONAL]             A                             
		Inner Join [RRHH].[DET_DOCUMENTO]           B    On (A.nIdPersonal = B.nIdPersonal And B.dFechFin Is Null)                             
		Inner Join [RRHH].[TBL_TIPO_DOCUMENTO]      C    On  B.nIdTipoDoc  = C.nIdTipoDoc                             
		Inner Join [RRHH].[TBL_PERIODO_LABORAL]     D    On (A.nIdPersonal = D.nIdPersonal And D.dFechFin Is Null)                              
		Inner Join [RRHH].[DET_PLPLANILLA]          E    On (D.nIdPerLab   = E.nIdPerLab   And E.dFechFin Is Null)                             
		Inner Join [RRHH].[TBL_PLANILLA]            F    On  E.nIdPlla     = F.nIdPlla            
		Inner Join [RRHH].[DET_PLCARGO]             G    On (D.nIdPerLab   = G.nIdPerLab   And G.dFechFin Is Null)                             
		Inner Join [System_Erp].[Tbl_Tipo_Elemento] H    On  G.nIdCargo    = H.nIdTipEle                                 
		Where   sCodPlla in('7') And   A.nIdPersonal = @v_nIdPersonal  Order by A.sApePa           	
       End
		Begin
	    Delete From ##tmpDet_TareoStaff
	    End
    End                                  

	If(@pOpcion = 5)  --Consulta listado Tareo Staff              
	Begin    
	
		If(Select top 1 nIdTipUsu From [System_Erp].[TBL_USER] usr 
								  left join System_Erp.DET_EMP_USU empu   on empu.nCodUser=usr.nCodUser 
								  left join [System_Erp].[TBL_NIVEL] niv  on niv.nIdEmpUser=empu.nIdEmpUser 
								  left join General.SYSTEM_ELEMENTS nivel on nivel.nEleCod=niv.nIdTipUsu 
								  Where empu.nIdEmp = @v_nIdEmpresa And usr.nCodPer = @v_nIdResponsable) = 1758

		Begin		                
			Select * from #tmpConsultaListadoTareos order by anio DESC                         
		 End                   
		Else                      
		Begin                           
			Select * from #tmpConsultaListadoTareos A Where A.nIdResponsable  = @v_nIdResponsable   order by anio DESC
		End               
	End              

	--- juan sanches idpersonal 193
	 -- juan aYala idpersonal 211
	---                                          
	If(@pOpcion = 6)  
	Begin 	
		Begin
			Delete From ##tmpDet_TareoStaff
		End
		Declare @zParametro  As Table (id Int Identity(1,1) Primary key, valor Varchar(50))
		Declare @xv_idTareo  int , @xv_mes as int
		
		If(Len(Ltrim(Rtrim(@pParametro))) > 0)                             
		Begin                            			
			Insert Into @zParametro(valor)    Select data From split(@pParametro, '|')	
			Set @xv_nIdPersonal			   = (Select valor        From @zParametro where id = 1) --IdPersonal    	
			Set @xv_nEj					   = (Select valor        From @zParametro where id = 5) --anio    	
			Set @xv_nIdMes				   = (Select valor        From @zParametro where id = 6)  --mes
			Set @xv_idTareo				   = (Select valor        From @zParametro where id = 7)  --IdTareo     			
		End
		Begin
			If(@xv_idTareo > 0)
			Delete From DET_TareoStaff Where nIdTareoStaff = @xv_idTareo 			
		End

		Begin			
		    
			Set @tareoDias =  (Select isnull(sum(nDiasPropor),0) From DET_TareoStaff  A
							   Join TBL_TareoStaff  B  On B.nIdTareoStaff = A.nIdTareoStaff 									
							   And nIdMes           =  @xv_nIdMes
							   And B.nIdPersonal    =  @xv_nIdPersonal
							   Where nEj            =  @xv_nEj
							  );										

			Set @v_dFchIng  = (Select B.dFechIni From [RRHH].[TBL_PERSONAL] A 
							   Join [RRHH].[TBL_PERIODO_LABORAL] B On ( A.nIdPersonal = B.nIdPersonal And B.dFechFin is Null )                            
							   Where A.nIdPersonal = @xv_nIdPersonal
							  );

			Set @v_dFchBaja = (Select dFechFin From [RRHH].[TBL_PERSONAL] A 
							   Join [RRHH].[TBL_PERIODO_LABORAL] B On ( A.nIdPersonal = B.nIdPersonal And B.dFechFin Is Null )                            
							   Where A.nIdPersonal = @xv_nIdPersonal
							   );
			
			Set @xv_mes =(Select Cast(cEleCod as smallint)  From General.SYSTEM_ELEMENTS Where nEleCodDad = 1455 And nEleCod  = @xv_nIdMes)                            						      
			If(@v_dFchBaja is null)
			Begin
				Set @contDias =  (select [Comercial].[fn_DiasEnMes](CAST(CONCAT(@xv_mes,@xv_nEj) AS int)))
			End

			If( DateDiff ( Day, @v_dFchIng, Getdate()) >= 30)
			Begin
			       --select cast(concat(@xv_nIdMes,@xv_nEj) as datetime)
				Set @contDias =  (select [Comercial].[fn_DiasEnMes](CAST(CONCAT(@xv_mes,@xv_nEj) AS int)))
			End
			Else
			Begin
				Set @contDias = (DateDiff(Day,@v_dFchIng, @v_dFchBaja))
			End
		
			Set @v_Subsidios  = (Select  DateDiff(Day,C.dFechIni, C.dFechFin) From [RRHH].[TBL_PERSONAL] A 
								 Join [RRHH].[TBL_PERIODO_LABORAL] B On ( A.nIdPersonal = B.nIdPersonal And B.dFechFin Is Null ) 
								 Join [RRHH].[TBL_SUBSIDIO]        C On B.nIdPerLab     = C.nIdPerLab 
								 And   Month(C.dFechIni)           =  (Select CAST(cEleCod as smallint)  From General.SYSTEM_ELEMENTS Where nEleCodDad = 1455 And nEleCod  = @xv_nIdMes)        
								 And   Year (C.dFechIni)           = @xv_nEj
								 Where A.nIdPersonal = @xv_nIdPersonal
								 );										 
					
			Set  @v_Vacaciones = (Select DateDiff(Day,C.dFechIni,    C.dFechFin) From  [RRHH].[TBL_PERSONAL] A 
								  Join  [RRHH].[TBL_PERIODO_LABORAL] B On ( A.nIdPersonal = B.nIdPersonal AND B.dFechFin IS NULL ) 
								  Join  [RRHH].[TBL_VACACION]        C On B.nIdPerLab     = C.nIdPerLab 
								  And   Month(C.dFechIni)			 =  (Select CAST(cEleCod as smallint)  From General.SYSTEM_ELEMENTS Where nEleCodDad = 1455 And nEleCod  = @xv_nIdMes)        
								  And   Year (C.dFechIni)			 = @xv_nEj						      
								  Where A.nIdPersonal			     = @xv_nIdPersonal
								  );
			Set  @v_nDiasMaxPer = @contDias - (Isnull(@v_Subsidios,0) + Isnull(@v_Vacaciones,0)) - @tareoDias					
		End
		Begin
			Insert Into #tmpConsultaStoreCampania	
			Exec  [Presupuesto].[SP_Lista_Presupuesto_v2] 6,@pParametro
		End
		Begin
			Select T.nId,idCC,idCanal,idCategoria,T.nImporte,T.sCodCC,T.sDescCC,T.sCodCanal,T.codCategoria, @v_nDiasMaxPer as 'nDiasMaxPer'  From #tmpConsultaStoreCampania T 
			Where Month(T.dFecIni) = (Select CAST(cEleCod as smallint)  From General.SYSTEM_ELEMENTS Where nEleCodDad = 1455 And nEleCod  = @xv_nIdMes)                            
			And   Month(T.dFecFin) = (Select CAST(cEleCod as smallint)  From General.SYSTEM_ELEMENTS Where nEleCodDad = 1455 And nEleCod  = @xv_nIdMes)                            
			And   Year(T.dFecIni)  = @xv_nEj
			And   Year(T.dFecFin)  = @xv_nEj
		End	
	End                          
 If(@pOpcion = 7)  --Consulta listado de campañas por(empleados) asociado a los años.              
 Begin       
  If (@v_nIdResponsable = 167)                      
  Begin                      
   Select * From  #tmpConsultaListadoTareos Where  anio = @v_nConsultaAnio order by anio desc                        
  End                      
  Else                      
  Begin                         
   Select * From  #tmpConsultaListadoTareos Where  anio = @v_nConsultaAnio And IdPersonal  = @v_nIdResponsable order by anio desc                         
  End                                                                            
 End   
                        
 If(@pOpcion = 8)      
 Begin              
  Declare @v_Solicitante       As Varchar(120) = ''                          
  Set     @v_Solicitante       = (Select Concat(sApePa + Space(1)+ sApeMa, + ',' + Space(1)+sPriNom + Space(1) + sSegNom) From [RRHH].[TBL_PERSONAL]             
                                  Where nidPersonal    = @v_nIdResponsable)                          
  Select Upper(@v_Solicitante) As Solicitante    	  
 End             
      
  If(@pOpcion = 9)                            
  Begin                             
        
   Select                    
   top 1       
   I.nIdTareoStaff                           As idTareo   ,       
   I.sCorrelativo                            As nro       ,                          
   I.nEj                                     As anio      ,               
   --K.cEleCod                               As idMes     ,                          
   k.nEleCod                                 As idMes     ,                          
   K.cEleNam                                 As mes       ,                                                 
   Rtrim(Concat(Rtrim(A.sApePa)                           ,                          
   Space(1),Rtrim(A.sApeMa)                               ,                          
   Space(1),Rtrim(A.sPriNom)                              ,                          
   Space(1),Rtrim(A.sSegNom)))              As personal    ,                          
   estado  = case when J.cEleNam ='ENVIADO' THEN 'ENVIADO A RR.HH' Else Upper(J.cEleNam) end,       
   I.nIdPersonal                            As idPersonal  ,              
   dCreaFecha                               As fechaCreate ,      
   dModFecha                                As fechaMod    ,      
   idCiudad                                 = (Select sCod   From  [System_Erp].[TBL_TIPO_ELEMENTO] Where nDadTipEle   = 694 And nIdTipEle  = @v_nSucCod),                       
   ciudad                                   = (Select sDesc  From  [System_Erp].[TBL_TIPO_ELEMENTO] Where nDadTipEle   = 694 And nIdTipEle  = @v_nSucCod) ,       
   idPartida                                = @v_nIdPartida ,                          
   codPartida                               = @v_sCodPartida ,                          
   partida                                  = @v_sDescPartida ,      
   cargo                                    = Rtrim(H.sDesc),      
   codcargo                                 = H.sCod ,
   nTotalDias                               = @v_nTotalDias ,
   nDiasMaxPer                              = case when @v_nDiasMaxPer <= 0 THEN  0 Else @v_nDiasMaxPer end      
   From [RRHH].[TBL_PERSONAL]            A                     
   Join [RRHH].[DET_DOCUMENTO]           B   On (A.nIdPersonal = B.nIdPersonal And B.dFechFin IS NULL)                     
   Join [RRHH].[TBL_TIPO_DOCUMENTO]      C   On  B.nIdTipoDoc  = C.nIdTipoDoc                     
                                                  
   Join [RRHH].[TBL_PERIODO_LABORAL]     D   On (A.nIdPersonal = D.nIdPersonal And D.dFechFin IS NULL)                                          
   Join [RRHH].[DET_PLPLANILLA]          E   On (D.nIdPerLab   = E.nIdPerLab   And E.dFechFin IS NULL)                     
   Join [RRHH].[TBL_PLANILLA]            F   On  E.nIdPlla     = F.nIdPlla                                     
   Join [RRHH].[DET_PLCARGO]             G   On (D.nIdPerLab   = G.nIdPerLab   And G.dFechFin IS NULL)                     
   Join [System_Erp].[Tbl_Tipo_Elemento] H   On  G.nIdCargo    = H.nIdTipEle                     
      
   Join [Comercial].[TBL_TareoStaff]     I   On I.nIdPersonal  = A.nIdPersonal                    
   Join General.SYSTEM_ELEMENTS          J   On J.nEleCod      = I.nEstado                         
   Join General.SYSTEM_ELEMENTS          k   On K.nEleCod      = I.nIdMes                         
   Where sCodPlla in('7') And nIdTareoStaff =  @v_nIdTareoStaff      
   
  End       
  If(@pOpcion = 10)                            
  Begin     
 

	  Select   
		     A.nIdTareoStaff      , A.nIdTareoStaffDet   
		    ,D.sCodCC             , D.sDescCC         , B.cEleCod As sPerfil      
		    ,C.cEleCod  as sCanal , A.nPorcentaje     , A.nDiasPropor  
		    ,A.nIdCentroCosto     , A.nIdPerfil       , nIdCanal,A.nSaldoDias,A.nSaldoDinero,  
			'nDiasMaxPer'         = isnull((
									Select Sum(nDiasPropor) From DET_TareoStaff            X   
									                        Join Comercial.TBL_TareoStaff  Y   On Y.nIdTareoStaff  = X.nIdTareoStaff
															Where Y.nIdTareoStaff = @v_nIdTareoStaff
			                       ),0)
	  From   Comercial.det_TareoStaff          As A  
	  Join   General.SYSTEM_ELEMENTS           As B  On B.nEleCod        = A.nIdPerfil   
	  Join   General.SYSTEM_ELEMENTS           As C  On C.nEleCod        = A.nIdCanal  
	  join   Presupuesto.TBL_CENTRO_COSTO      As D  On D.nIdCentroCosto = A.nIdCentroCosto 
	  Join   Comercial.TBL_TareoStaff          As E  On E.nIdTareoStaff  = A.nIdTareoStaff
 	  And    B.nEleCodDad           =  427     And   C.nEleCodDad = 1989   And D.nIdEmp = 1  
	  Where  A.nIdTareoStaff        =  @v_nIdTareoStaff  
	  
	Begin
	Delete From ##tmpDet_TareoStaff
	End

  End  

  If(@pOpcion = 11)                            
   Begin

    
	Declare  @nId as int, @sConsultaStore varchar(20)
	Declare  @nIdCentroCosto       int               ,@nIdPerfil          as  int, @nIdCanal as int, @nImporte as varchar(25),@xImporte as decimal(18,4) --variables de entrada
	Declare  @diasmaxipermitidos   decimal(18,4)     ,@nporcentaje        as  decimal(18,4), @ndiasPropor int  --variables de entrada a calcular
	Declare  @ndiasConsumidos      decimal(18,4)     ,@diasHabilesReales  as  int, @diasEquivalentes as decimal(18,4)       --calcular
	declare  @diasHabiles          int               ,@costoEquivalente   as  decimal(18,4)
	declare  @importeConsumido     as  decimal(18,4) ,@importeSaldo       as  decimal(18,4)

	Declare @xpptoDias  Decimal(18,4) , @xpptosaldo Decimal(18,4) ---(saldodias) y (saldopptos) --(presupuestos)
	Declare @diasHabilesTrabajador as Decimal(18,4), @nSaldoImportTrab as Decimal(18,4)--costoempresa, y dias habiles (empleados)
    Declare @LParametro       As Table (id Int Identity(1,1) Primary key, valor Varchar(max))  ---consultaLineas   
  Begin	
	If(Len(Ltrim(Rtrim(@pParametro))) > 0)                             
	Begin                            	
		Insert Into @LParametro(valor) Select data From split(@pParametro, ',');                                        
	End 	 
  End     
   Declare @xParametro       As Table (id Int Identity(1,1) Primary key, valor Varchar(max))  ---consultaLineas                                            	       
   Insert Into  @xParametro(valor) Select data From split(@pParametro, '|');      
   delete from  @xParametro where id = 1   
   Set  @nporcentaje      = (Select valor From @LParametro Where id = 5);  
   Set  @nIdCentroCosto   = (Select valor From @LParametro Where id = 7);  
   Set  @nIdPerfil        = (Select valor From @LParametro Where id = 8);  
   Set  @nIdCanal         = (Select valor From @LParametro Where id = 9);  
   Set  @nId              = (Select valor From @LParametro Where id = 10);     

   Set @nImporte = (select valor from @LParametro where id=11)
   Set @xImporte  =(select CAST(SUBSTRING(@nImporte,0, CHARINDEX('|',@nImporte)) as decimal(18,4)))
   Set @diasmaxipermitidos = (Select valor   From  @xParametro  WHeRE id= 2 )   
   Set @xv_nEj             = (Select valor   From  @xParametro  WHeRE id= 3 )   
   Set @xv_nIdMes          = (Select valor   From  @xParametro  WHeRE id= 4 )    	
   Set @xv_nIdPersonal     = (Select valor   From  @xParametro  WHeRE id= 5 )    	
   Set @sConsultaStore     = (Select 
   (Select valor   from        @xParametro  WHeRE id  = 5 ) + '|'+
   (Select valor   from        @xParametro  WHeRE id  = 6 ) + '|'+
   (Select valor   from        @xParametro  WHeRE id  = 7 ))      
   
		--------INICIO Consultos los tareos del personal.	
	Begin	
	Insert Into #tmpConsultaStoreCampania
	exec  [Presupuesto].[SP_Lista_Presupuesto_v2] 6,@sConsultaStore	
	Set    @diasEquivalentes = @nporcentaje * (@diasmaxipermitidos / 100)       ---@diasEquivalentes(8)	
	--Set    @ncostoEmpresa =2500

	--2 Inicio tmpDetalle	   
--IF OBJECT_ID('tempdb..##tmpDet_TareoStaff') IS NULL

BEGIN
    If Exists(select 1 from  ##tmpDet_TareoStaff Where nId = @nId)
	Begin	    
		Delete From  ##tmpDet_TareoStaff Where nId = @nId  
	End    
	Set  @ndiasConsumidos = isnull((
							  Select Sum(nDiasPropor) From DET_TareoStaff  A
							  Join TBL_TareoStaff B on B.nIdTareoStaff = A.nIdTareoStaff							  
							  Where nEj  = @xv_nEj
							  And nIdMes = @xv_nIdMes
							  --And nIdResponsable = @xv_nIdPersonal
							  And nIdCentroCosto In(@nIdCentroCosto)
							  And nIdPerfil      In(@nIdPerfil) 
							  And nIdCanal       In(@nIdCanal)		 							 
							  )	,0)						  
							  +  
							  (Select ISNULL(sum(nDiasPropor),0) From  ##tmpDet_TareoStaff 							  
							     Where nIdCentroCosto = @nIdCentroCosto 
																	And   nIdPerfil      = @nIdPerfil 
																	And   nIdCanal       = @nIdCanal
																	 )																	 						
Set @diasHabilesReales = (
						  Select top 1 ndiaPla AS 'DIAS HABILES' from #tmpConsultaStoreCampania as T 
                          Where Month(T.dFecIni) = (Select CAST(cEleCod as smallint)  From General.SYSTEM_ELEMENTS Where nEleCodDad = 1455 And nEleCod  = @xv_nIdMes)                            
						  And   Month(T.dFecFin) = (Select CAST(cEleCod as smallint)  From General.SYSTEM_ELEMENTS Where nEleCodDad = 1455 And nEleCod  = @xv_nIdMes)                            
						  And   year(T.dFecIni)  = @xv_nEj
						  And   year(T.dFecFin)  = @xv_nEj
						  And   nEstado          In(Select nEleCod From General.SYSTEM_ELEMENTS  Where nElecodDad = 2071 And nEleCod In(2073,2076))       						  
						  And   T.idCC           = @nIdCentroCosto 
						  And   idCanal          = @nIdPerfil 
						  And   idcategoria      = @nIdCanal						  
                        )												   
	Set @importeConsumido =	isnull((
							  Select Sum(nCostoEmpPropor) From DET_TareoStaff  
							  Where nIdCentroCosto IN(@nIdCentroCosto)
							  And nIdPerfil  In(@nIdPerfil) 
							  And nIdCanal   In(@nIdCanal)		 
							  ),0)						
	Set     @costoEquivalente =  @nporcentaje * (@ncostoEmpresa/100)

	Set     @diasHabiles = isnull(@diasHabilesReales,0) - isnull(@ndiasConsumidos,0) --pptos

	Set     @importeSaldo = @importeConsumido + @costoEquivalente + (Select ISNULL(sum(nCostoEmpPropor),0) From  ##tmpDet_TareoStaff
																	Where nIdCentroCosto = @nIdCentroCosto 
																	And   nIdPerfil      = @nIdPerfil 
																	And   nIdCanal       = @nIdCanal
																	 )	
	if(@diasmaxipermitidos <= 0) 
	Begin 
		Select  mensaje = 'Saldo de Dias (0).' For Json Path   		
	End

	if(@ncostoEmpresa >= @importeSaldo)
	begin  
	  Set @ncostoEmpresa  =  isnull(@ncostoEmpresa,0) - ISNULL(@importeSaldo,0)   	  
	End
	Else
	Begin
	
	Select mensaje = 'La suma de los porcentajes supera el 100%.' 	For Json Path   	
	Return;
	End
	

	if(@diasHabiles > = @diasEquivalentes )
	begin
		set @diasHabilesTrabajador = ISNULL(@diasmaxipermitidos,0) -ISNULL(@ndiasConsumidos,0)-ISNULL(@diasEquivalentes,0)
	End
	Else
	Begin		
		Select  mensaje = 'Los dias proporcional supera los dias màximo permitidos.' For Json Path
		Return;
	End 
	 if(@diasHabiles >= @diasEquivalentes)
	 Begin
		Set @xpptoDias = 	@diasHabiles - @diasEquivalentes		
	 End
	 Else
	 Begin
		Select  mensaje = 'No cuenta con dias habiles el ppto.' For Json Path   
	--	Select *  From ##tmpDet_TareoStaff	
		Return;
	 End

	 If(@xImporte > = @importeSaldo)
	 Begin 
		set @xpptosaldo = 	@xImporte - @importeSaldo 
	 End
	 else
	 Begin
		select  mensaje = 'No cuenta con saldo suficiente en el ppto. para cargar su CE, debe ajustar su porcentaje o converse con su ejecutivo(a).' For Json Path   
		--Select       *  From ##tmpDet_TareoStaff	
		Return;
	 End

		Begin
		Insert Into  ##tmpDet_TareoStaff	
		Select @nId, 0,0 , @nIdCentroCosto ,@nIdPerfil ,@nIdCanal, @xpptoDias, @xpptosaldo,@nporcentaje ,@diasEquivalentes,@costoEquivalente ,@diasHabilesTrabajador,@ncostoEmpresa        
		Select    mensaje ='OK' For Json Path   
		End
	End
  End
	
END
End 
End 