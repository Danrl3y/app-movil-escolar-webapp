import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { MatDialog } from '@angular/material/dialog';
import { EditarUserModalComponent } from 'src/app/modals/editar-user-modal/editar-user-modal.component';

@Component({
  selector: 'app-registro-eventos',
  templateUrl: './registro-eventos.component.html',
  styleUrls: ['./registro-eventos.component.scss']
})
export class RegistroEventosComponent {

  @Input() rol: string = "";
  @Input() datos_evento: any = {};

  tiposEventos: any[] = [];
  publicoObjetivo: any[] = [];
  programasEducativos: any[] = [];

  responsables: any[] = [];

  public minDate: Date = new Date();

  public evento:any= {};
  public token: string = "";
  public errors:any={};
  public editar:boolean = false;
  public idEvento: Number = 0;
  
  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private eventosService: EventosService,
    private facadeService: FacadeService, 
    private administradoresService: AdministradoresService, 
    private maestrosService: MaestrosService, public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
   
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log("ID Evento: ", this.idEvento);
      setTimeout(() => {
        this.evento = this.datos_evento;
        this.evento.hora_inicio = this.evento.hora_inicio ? this.evento.hora_inicio.slice(0, 5) : '';
        this.evento.hora_fin = this.evento.hora_fin ? this.evento.hora_fin.slice(0, 5) : '';
      }, 1000);
    }else{
      // Si no va a this.editar, entonces inicializamos el JSON para registro nuevo
      this.evento = this.eventosService.esquemaEvento();
      this.evento.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    console.log("Evento: ", this.evento);

    this.eventosService.getTiposEventos().subscribe(data => {
      console.log("Tipos de eventos: ", data);
      this.tiposEventos = data.tipos_eventos;
      this.publicoObjetivo = data.publico_objetivo;
      this.programasEducativos = data.programas_educativos;
    });

    if (this.editar && this.evento.fecha) {
          this.evento.fecha = new Date(this.evento.fecha + 'T00:00:00');
      }

    this.getResponsables();

  }

  public regresar(){
    this.location.back();
  }

  public formatearFecha(date: Date): string {
      if (!date) return "";
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
  }

  public registrar(){
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    this.evento.fecha = this.formatearFecha(this.evento.fecha);
    this.evento.hora_inicio = this.evento.hora_inicio.length === 5 ? this.evento.hora_inicio + ':00' : this.evento.hora_inicio;
    this.evento.hora_fin = this.evento.hora_fin.length === 5 ? this.evento.hora_fin + ':00' : this.evento.hora_fin;

    this.eventosService.registrarEvento(this.evento).subscribe(
      (response) => {
        alert("Evento registrado exitosamente");
        console.log("Evento registrado: ", response);
        if(this.token && this.token !== ""){
          this.router.navigate(["eventos-academicos"]);
        }else{
          this.router.navigate(["/"]);
        }
      },
      (error) => {
        alert("Error al registrar evento");
        console.error("Error al registrar evento: ", error);
        this.evento.hora_inicio = this.evento.hora_inicio ? this.evento.hora_inicio.slice(0, 5) : '';
        this.evento.hora_fin = this.evento.hora_fin ? this.evento.hora_fin.slice(0, 5) : '';
      }
    );
  } 

  public actualizar(){
    // Validación de los datos
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    const dialogRef = this.dialog.open(EditarUserModalComponent, {
      width: '328px',
      height: '288px',
      disableClose: true 
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result === true) {

        this.evento.fecha = this.formatearFecha(this.evento.fecha);
        this.evento.hora_inicio = this.evento.hora_inicio.length === 5 ? this.evento.hora_inicio + ':00' : this.evento.hora_inicio;
        this.evento.hora_fin = this.evento.hora_fin.length === 5 ? this.evento.hora_fin + ':00' : this.evento.hora_fin;


        this.eventosService.actualizarEvento(this.evento).subscribe(
          (response) => {
            alert("Evento actualizado exitosamente");
            console.log("Evento actualizado: ", response);
            this.router.navigate(["eventos-academicos"]);
          },
          (error) => {
            alert("Error al actualizar evento");
            console.error("Error al actualizar evento: ", error);
            this.evento.hora_inicio = this.evento.hora_inicio ? this.evento.hora_inicio.slice(0, 5) : '';
            this.evento.hora_fin = this.evento.hora_fin ? this.evento.hora_fin.slice(0, 5) : '';
          }
        );

      }else {
          console.log("El usuario canceló la edición");
          alert("Edición cancelada");
        }
    });
  }

  public seleccionarPublico(valor: string, isChecked: boolean) {
    if (isChecked) {
      this.evento.publico_objetivo = valor;
    } else {
      if (this.evento.publico_objetivo === valor) {
        this.evento.publico_objetivo = null;
      }
    }
    this.validarProgramaEducativo();
  }

  public validarProgramaEducativo() {
    if (this.evento.publico_objetivo !== 'alumnos') {
      this.evento.programa_educativo = null;
    }

  }

  public getResponsables() {

    this.responsables = [];

    this.administradoresService.obtenerListaAdmins().subscribe(data => {
      console.log("Administradores: ", data);
      this.responsables = this.responsables.concat(data);
    });

    this.maestrosService.obtenerListaMaestros().subscribe(data => {
      console.log("Maestros: ", data);
      this.responsables = this.responsables.concat(data);
    });

  }

  public soloNumeros(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (!(charCode >= 48 && charCode <= 57)) {
      event.preventDefault();
    }
  }

  public soloAlfanumericos(event: KeyboardEvent) {
    const k = event.key;
    const reg = /^[a-zA-Z0-9 áéíóúüñÁÉÍÓÚÜÑ]*$/;
    
    if (!reg.test(k)) {
      event.preventDefault();
    }
  }

  // //Función para detectar el cambio de fecha
  // public changeFecha(event :any){
  //   console.log(event);
  //   console.log(event.value.toISOString());

  //   this.evento.fecha = event.value.toISOString().split("T")[0];
  //   console.log("Fecha: ", this.evento.fecha);
  // }

  // public soloLetras(event: KeyboardEvent) {
  //   const charCode = event.key.charCodeAt(0);
  //   // Permitir solo letras (mayúsculas y minúsculas) y espacio
  //   if (
  //     !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
  //     !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
  //     charCode !== 32                         // Espacio
  //   ) {
  //     event.preventDefault();
  //   }
  // }
}
