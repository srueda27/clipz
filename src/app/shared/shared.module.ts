import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal/modal.component';
import { TabsContainerComponent } from './tabs-container/tabs-container.component';
import { TabComponent } from './tab/tab.component';

@NgModule({
  declarations: [
    ModalComponent,
    TabsContainerComponent,
    TabComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ModalComponent,
    TabComponent,
    TabsContainerComponent
  ]
  /* providers array, is an array of services
  providers: [ModalService]

  This way would be inyectable ONLY inside the shared module
   */
})
export class SharedModule { }
