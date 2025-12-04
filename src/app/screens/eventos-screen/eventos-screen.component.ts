import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { EventosService } from 'src/app/services/eventos.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss']
})
export class EventosScreenComponent {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_eventos: any[] = [];
  private isAdmin: boolean = false;

  displayedColumns: string[];
  dataSource = new MatTableDataSource<DatosEvento>(this.lista_eventos as DatosEvento[]);
  
  private paginator: MatPaginator | null = null;
  private sort: MatSort | null = null;

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  constructor(public facadeService: FacadeService, 
    public eventosService:EventosService, 
    private router: Router, 
    public dialog: MatDialog) { }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    this.obtenerEventos();

    this.isAdmin = this.rol === 'administrador';
    if (this.isAdmin) {
    
      this.displayedColumns = ['nombre', 'tipo', 'fecha', 'hora_inicio', 'hora_fin', 'lugar', 'publico_objetivo', 'programa_educativo', 'responsable', 'descripcion', 'cupo_max', 'editar', 'eliminar'];
      
    } else {
      this.displayedColumns = ['nombre', 'tipo', 'fecha', 'hora_inicio', 'hora_fin', 'lugar', 'publico_objetivo', 'programa_educativo', 'responsable', 'descripcion', 'cupo_max'];
    }

  }

  public obtenerEventos() {
      this.eventosService.obtenerListaEventos().subscribe(
        (response) => {
          this.lista_eventos = response;
          console.log("Lista eventos: ", this.lista_eventos);
          if (this.lista_eventos.length > 0) {
            this.dataSource.data = this.lista_eventos as DatosEvento[];
          }
        }, (error) => {
          console.error("Error al obtener la lista de eventos: ", error);
          alert("No se pudo obtener la lista de eventos");
        }
      );
    }

  public goEditar(idEvento: number) {
    this.router.navigate(["registro-eventos-academicos/" + idEvento]);
  }

  public delete(idEvento: number) {
      if (this.rol === 'administrador') {
        const dialogRef = this.dialog.open(EliminarUserModalComponent,{
          data: {id: idEvento, rol: 'evento'},
          height: '288px',
          width: '328px',
        });
  
      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
          console.log("Evento eliminado");
          alert("Evento eliminado correctamente.");
          //Recargar página
          window.location.reload();
        }else{
          alert("Evento no se ha podido eliminar.");
          console.log("No se eliminó el Evento");
        }
      });
      }else{
        alert("No tienes permisos para eliminar este evento.");
      }
    }

}

export interface DatosEvento {
  id?: number;
  nombre: string;
  tipo: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  lugar: string;
  publico_objetivo: string;
  programa_educativo?: string;
  responsable: string;
  descripcion: string;
  cupo_max: number;
}
