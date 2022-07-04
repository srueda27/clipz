import { Component, OnDestroy } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { last, switchMap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
  isDragover = false
  file: File | null = null
  showAlert = false;
  alertMessage = 'Please wait! Your file is being uploaded.';
  alertColor = 'blue';
  inSubmission = false;
  percentage = 0
  user: firebase.User | null = null
  task?: AngularFireUploadTask

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router
  ) {
    auth.user.subscribe(user => this.user = user)
  }

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

  ngOnDestroy(): void {
    this.task?.cancel()
  }

  storeFile(event: Event) {
    this.isDragover = false

    this.file = (event as DragEvent).dataTransfer ?
      (event as DragEvent).dataTransfer?.files.item(0) ?? null :
      (event.target as HTMLInputElement).files?.item(0) ?? null

    if (!this.file || (this.file.type != 'video/mp4' && this.file.type != 'image/jpeg')) {
      return
    }

    this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    )
  }

  uploadFile() {
    this.uploadForm.disable()

    const clipFileName = uuid();
    const extention = this.file?.type.split('/')[1];
    const clipPath = `clips/${clipFileName}.${extention}`

    this.showAlert = true;
    this.alertMessage = 'Please wait! Your file is being uploaded';
    this.alertColor = 'blue';
    this.inSubmission = true;

    this.task = this.storage.upload(clipPath, this.file)
    const clipRef = this.storage.ref(clipPath)

    this.task.percentageChanges().subscribe(progress => {
      this.percentage = progress as number / 100
    })

    this.task.snapshotChanges().pipe(
      last(),
      switchMap(() => clipRef.getDownloadURL())
    ).subscribe({
      next: async (url) => {
        const clip = {
          uid: this.user?.uid!,
          displayName: this.user?.displayName!,
          title: this.title.value,
          fileName: `${clipFileName}.${extention}`,
          url,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }

        const clipDocumentReference = await this.clipsService.createClip(clip)

        this.alertColor = 'green'
        this.alertMessage = 'Success! Your file has been uploaded.'

        setTimeout(() => {
          this.router.navigate([
            'clip',
            clipDocumentReference.id
          ])
        }, 1000);
      },
      error: (error) => {
        this.uploadForm.enable()

        this.alertColor = 'red'
        this.alertMessage = 'Upload failed! Please try again later'
        this.inSubmission = true
        console.error(error)
      }
    })
  }

}
