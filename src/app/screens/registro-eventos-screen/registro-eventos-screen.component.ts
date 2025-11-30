import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventosService } from 'src/app/services/eventos.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-registro-eventos-screen',
  templateUrl: './registro-eventos-screen.component.html',
  styleUrls: ['./registro-eventos-screen.component.scss']
})
export class RegistroEventosScreenComponent {

  public editar:boolean = false;
  public idEvento:number = 0;

  public evento : any = {};

  constructor(
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private eventosService: EventosService
  ) { }

  ngOnInit(): void {
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log("ID Evento: ", this.idEvento);
      this.obtenerEventoByID();
    }
  }

  public obtenerEventoByID() {
    //Lógica para obtener el usuario según su ID y rol
    console.log("Obteniendo evento " + " con ID: ", this.idEvento);
    
    this.eventosService.obtenerEventoPorID(this.idEvento).subscribe(
      (response) => {
        this.evento = response;
        console.log("Evento original obtenido: ", this.evento);
      }, (error) => {
        console.log("Error: ", error);
        alert("No se pudo obtener el evento seleccionado");
      }
    );
  }

  public goBack() {
    this.location.back();
  }

}
