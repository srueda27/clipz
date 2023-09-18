import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import { BehaviorSubject, combineLatest, lastValueFrom, map, of, switchMap } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage'

import IClip from '../models/clip.model';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ClipService implements Resolve<IClip | null>{
  public clipsCollection: AngularFirestoreCollection<IClip>
  pageClips: IClip[] = []
  pendingReq = false

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = this.db.collection('clips')
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data)
  }

  getUserClips(sort$: BehaviorSubject<string>) {
    /*
    // The switchMap operator is used to handle asynchronous operations, such as HTTP requests or Observables that emit values over time.
    this.currentLanguage$.pipe(
      switchMap(idioma => {
        if (idioma && idioma != this.currentLanguage) {
          return this.loadTranslations(idioma).pipe(
            tap(traducciones => {
              this.translations = traducciones;
              this.currentLanguage = idioma
            })
          )
        } else {
          return of(this.translations)
        }
      })
    ).subscribe() */

    return combineLatest([
      this.auth.user,
      sort$
    ]).pipe(
      switchMap(values => {
        const [user, sort] = values

        if (!user) {
          return of([])
        }

        const query = this.clipsCollection.ref.where('uid', '==', user!.uid).orderBy(
          'timestamp',
          sort == '1' ? 'desc' : 'asc'
        )

        return query.get()
      }),
      map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)
    )
  }

  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
      title
    })
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`)
    const screenshotRef = this.storage.ref(`screenshots/${clip.screenshotFileName}`)

    await clipRef.delete()
    await screenshotRef.delete()

    await this.clipsCollection.doc(clip.docID).delete()
  }

  async getClips() {
    if (this.pendingReq) {
      return
    }
    this.pendingReq = true

    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(3)

    const { length } = this.pageClips

    if (length) {
      const lastDocID = this.pageClips[length - 1].docID
      const lastDoc = await lastValueFrom(this.clipsCollection.doc(lastDocID).get())

      query = query.startAfter(lastDoc)
    }

    const snapshot = await query.get()

    snapshot.forEach(doc => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data()
      })
    })

    this.pendingReq = false
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollection.doc(route.params['id']).get().pipe(
      map(snapshot => {
        const data = snapshot.data()

        if (!data) {
          this.router.navigate(['page_not_found'])
          return null
        }

        return data
      })
    )
  }
}
