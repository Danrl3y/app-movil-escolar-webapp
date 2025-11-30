import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-editar-user-modal',
  templateUrl: './editar-user-modal.component.html',
  styleUrls: ['./editar-user-modal.component.scss']
})
export class EditarUserModalComponent {

  constructor(
    public dialogRef: MatDialogRef<EditarUserModalComponent>,
  ) {}

  public cerrar_modal(){
    this.dialogRef.close(false);
  }

  public confirmar(){
    this.dialogRef.close(true);
  }

}
