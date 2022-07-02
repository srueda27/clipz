import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  isDragover = false
  file: File | null = null
  showAlert = false;
  alertMessage = 'Please wait! Your file is being uploaded.';
  alertColor = 'blue';
  inSubmission = false;

  constructor(
    private storage: AngularFireStorage
  ) { }

  title = new FormControl('', {
    validators: [
      Validators.required,
      Validators.minLength(3)
    ],
    nonNullable: true
  })

  uploadForm = new FormGroup({
    title: this.title
  })

  ngOnInit(): void {
  }

  storeFile(event: Event) {
    this.isDragover = false

    this.file = (event as DragEvent).dataTransfer?.files.item(0) ?? null

    if (!this.file || (this.file.type != 'video/mp4' && this.file.type != 'image/jpeg')) {
      return
    }

    this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    )
  }

  uploadFile() {
    const clipFileName = uuid();
    const extention = this.file?.type.split('/')[1];
    const clipPath = `clips/${clipFileName}.${extention}`

    this.showAlert = true;
    this.alertMessage = 'Please wait! Your file is being uploaded';
    this.alertColor = 'blue';
    this.inSubmission = true;

    this.storage.upload(clipPath, this.file)
  }

}
