import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal/modal.component';

@NgModule({
  declarations: [
    ModalComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ModalComponent
  ]
  /* providers array, is an array of services
  providers: [ModalService]

  This way would be inyectable ONLY inside the shared module
   */
})
export class SharedModule { }
