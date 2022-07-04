import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  activeClip: IClip | null = null

  showAlert = false;
  alertMessage = 'Please wait! Your file is being uploaded.';
  alertColor = 'blue';
  inSubmission = false;

  constructor(
    private modal: ModalService
  ) { }

  clipID = new FormControl('', {
    nonNullable: true
  })

  title = new FormControl('', {
    validators: [
      Validators.required,
      Validators.minLength(3)
    ],
    nonNullable: true
  })

  editForm = new FormGroup({
    title: this.title,
    id: this.clipID
  })

  ngOnInit(): void {
    this.modal.register('editClip')
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip')
  }

  ngOnChanges(): void {
    if (!this.activeClip) {
      return
    }

    this.clipID.setValue(this.activeClip.docID || '')
    this.title.setValue(this.activeClip.title)
  }

  submit() {
    
  }
}
