import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}

// This way the class is inyectable on a GLOBAL level
@Injectable({
  providedIn: 'root'
})
/*
another way to make a class inyectable
 @Injectable()

 and inside the shared module including the class inside providers array
 */
export class ModalService {
  private modals: IModal[] = [];

  constructor() { }

  register(id: string) {
    this.modals.push({
      id,
      visible: false
    });
  }

  unregister(id: string) {
    this.modals = this.modals.filter(modal => modal.id != id);
  }

  isModalOpen(id: string): boolean {
    // Boolean(this.modals.find(modal => modal.id == id)?.visible)
    return !!this.modals.find(modal => modal.id == id)?.visible;
  }

  toggleModal(id: string) {
    const modal = this.modals.find(modal => modal.id == id);

    if (modal) {
      modal.visible = !modal.visible;
    }
  }
}
