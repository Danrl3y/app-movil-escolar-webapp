import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';
import { FacadeService } from './facade.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const regexDescripcion = /^[a-zA-Z0-9 áéíóúüñÁÉÍÓÚÜÑ\s.,;:_\-()¿?¡!]+$/;
const regexNombreLugar = /^[a-zA-Z0-9 áéíóúüñÁÉÍÓÚÜÑ]+$/;

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  constructor(private http: HttpClient, 
    private validatorService: ValidatorService, 
    private errorService: ErrorsService,
    private facadeService: FacadeService) { }

  public esquemaEvento() {
    return {
      'nombre': '',
      'tipo': '',
      'fecha': '',
      'hora_inicio': '',
      'hora_fin': '',
      'lugar': '',
      'publico_objetivo': '',
      'programa_educativo': '',
      'responsable': '',
      'descripcion': '',
      'cupo_max': ''
    }
  }

  public validarEvento(data: any, editar: boolean) {
    console.log("Validando evento... ", data);
    let error: any = {};

    //Validaciones
    if (!this.validatorService.required(data["nombre"])) {
      error["nombre"] = this.errorService.required;
    } else if (!regexNombreLugar.test(data["nombre"])) {
      error["nombre"] = "Solo se permiten letras, números y espacios.";
    }

    if (!this.validatorService.required(data["tipo"])) {
      error["tipo"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["fecha"])) {
      error["fecha"] = this.errorService.required;
    } else {
      const fechaIngresada = new Date(data["fecha"]);
      const hoy = new Date();
      fechaIngresada.setHours(0, 0, 0, 0);
      hoy.setHours(0, 0, 0, 0);

      if (fechaIngresada < hoy) {
        error["fecha"] = "La fecha no puede ser anterior al día de hoy.";
      }
    }

    if (!this.validatorService.required(data["hora_inicio"])) {
      error["hora_inicio"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["hora_fin"])) {
      error["hora_fin"] = this.errorService.required;
    }

    if (data["hora_inicio"] && data["hora_fin"]) {
      const inicioMinutos = this.convertirHoraAMinutos(data["hora_inicio"]);
      const finMinutos = this.convertirHoraAMinutos(data["hora_fin"]);

      if (inicioMinutos >= finMinutos) {
        error["horas_logica"] = "La hora de finalización debe ser posterior a la hora de inicio.";
      }
    }

    if (!this.validatorService.required(data["lugar"])) {
      error["lugar"] = this.errorService.required;
    } else if (!regexNombreLugar.test(data["lugar"])) {
      error["lugar"] = "Caracteres inválidos (Solo letras y números).";
    }

    if (!this.validatorService.required(data["publico_objetivo"])) {
      error["publico_objetivo"] = this.errorService.required;
    }

    if (data["publico_objetivo"] === "alumnos" && !this.validatorService.required(data["programa_educativo"])) {
      error["programa_educativo"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["responsable"])) {
      error["responsable"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["descripcion"])) {
      error["descripcion"] = this.errorService.required;
    } else {
      if (data["descripcion"].length > 300) {
          error["descripcion"] = "La descripción no puede exceder los 300 caracteres.";
        }
      
      if (!regexDescripcion.test(data["descripcion"])) {
        error["descripcion"] = "Solo se permiten letras, números y signos de puntuación básicos.";
      }
    }

    if (!this.validatorService.required(data["cupo_max"])) {
      error["cupo_max"] = this.errorService.required;
    } else {
      const cupo = parseInt(data["cupo_max"]);
      
      if (isNaN(cupo)) {
        error["cupo_max"] = "Solo se permiten números enteros";
      } 
      else if (cupo <= 0) {
        error["cupo_max"] = "El cupo debe ser mayor a 0";
      }
      else if (cupo > 999) {
        error["cupo_max"] = "El cupo no puede exceder los 999 participantes";
      }
    }

    return error;
  }

  public getTiposEventos(): Observable<any> {

    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/eventos/opciones/`, { headers });
  
  }

  public registrarEvento(data: any): Observable<any> {
  
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/eventos/`, data, { headers });
  
  }

  public obtenerListaEventos(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");

    }
    return this.http.get<any>(`${environment.url_api}/lista-eventos/`, { headers });
  }

  public obtenerEventoPorID(idEvento: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/eventos/?id=${idEvento}`, { headers });
  }

  public actualizarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    console.log("Actualizando evento con data: ", data);
    return this.http.put<any>(`${environment.url_api}/eventos/`, data, { headers });
  }

  public eliminarEvento(idEvento: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.delete<any>(`${environment.url_api}/eventos/?id=${idEvento}`, { headers });
  }

  private convertirHoraAMinutos(hora: string): number {
    if (!hora) return 0;
    const partes = hora.split(':');
    const horas = parseInt(partes[0], 10);
    const minutos = parseInt(partes[1], 10);
    return (horas * 60) + minutos;
  }
  
}
