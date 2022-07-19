import { Component, OnDestroy } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, forkJoin, switchMap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
  nextStep = false
  isDragover = false
  file: File | null = null
  showAlert = false;
  alertMessage = 'Please wait! Your file is being uploaded.';
  alertColor = 'blue';
  inSubmission = false;
  percentage = 0
  user: firebase.User | null = null
  task?: AngularFireUploadTask
  screenshots: string[] = []
  selectedScreenshot = ''
  screenshotTask?: AngularFireUploadTask

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    this.auth.user.subscribe(user => this.user = user)
    this.ffmpegService.init()
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

  async storeFile(event: Event) {
    if (this.ffmpegService.isRunning) {
      return
    }

    this.isDragover = false

    this.file = (event as DragEvent).dataTransfer ?
      (event as DragEvent).dataTransfer?.files.item(0) ?? null :
      (event.target as HTMLInputElement).files?.item(0) ?? null

    if (!this.file || (this.file.type != 'video/mp4' && this.file.type != 'image/jpeg')) {
      return
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file)

    this.selectedScreenshot = this.screenshots[0]

    this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    )

    this.nextStep = true
  }

  async uploadFile() {
    this.uploadForm.disable()

    const clipFileName = uuid();
    const extention = this.file?.type.split('/')[1];
    const clipPath = `clips/${clipFileName}.${extention}`

    const screenshotBlob = await this.ffmpegService.blobFromURL(this.selectedScreenshot)
    const screenshotPath = `screenshots/${clipFileName}.png`

    this.showAlert = true;
    this.alertMessage = 'Please wait! Your file is being uploaded';
    this.alertColor = 'blue';
    this.inSubmission = true;

    this.task = this.storage.upload(clipPath, this.file)
    const clipRef = this.storage.ref(clipPath)

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob)
    const screenshotRef = this.storage.ref(screenshotPath)

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges()
    ]).subscribe(progress => {
      const [clipProgress, screenshotProgress] = progress

      if (!clipProgress || !screenshotProgress) {
        return
      }

      const total = clipProgress + screenshotProgress

      this.percentage = total as number / 200
    })

    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges()
    ]).pipe(
      switchMap(() => forkJoin([
        clipRef.getDownloadURL(),
        screenshotRef.getDownloadURL()
      ]))
    ).subscribe({
      next: async (urls) => {
        const [clipURL, screenshotURL] = urls

        const clip = {
          uid: this.user?.uid!,
          displayName: this.user?.displayName!,
          title: this.title.value,
          fileName: `${clipFileName}.${extention}`,
          url: clipURL,
          screenshotURL,
          screenshotFileName: `${clipFileName}.png`,
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
