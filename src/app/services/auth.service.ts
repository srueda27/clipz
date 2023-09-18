import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { delay, filter, map, mergeMap, Observable, of, switchMap } from 'rxjs';

import IUser from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userCollections: AngularFirestoreCollection<IUser>
  public isAuthenticated$: Observable<boolean>
  public isAuthenticatedWithDelay$: Observable<boolean>
  private redirect = false

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userCollections = this.db.collection('users')

    /* auth.user.subscribe(user => {
      this.redirect = !!user
    }) */

    this.isAuthenticated$ = auth.user.pipe(
      map(user => {
        if (user) {
          return true
        } else {
          return false
        }
      })
    )

    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
      delay(1000)
    )

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => this.route),
      map((route) => {
        while(route.firstChild) {
          route = route.firstChild
        }

        return route
      }),
      mergeMap((route) => route.data)
    ).subscribe(data => {
      // console.log('data: ', data['authOnly'])
      this.redirect = data['authOnly'] ?? false
    })
  }

  public async createUser(userData: IUser) {
    if (!userData.password) {
      throw new Error('Password not provided')
    }

    const userCredentials = await this.auth.createUserWithEmailAndPassword(userData.email, userData.password);

    if (!userCredentials.user) {
      throw new Error("User can't be found")
    }

    await this.userCollections.doc(userCredentials.user.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber,
    });

    await userCredentials.user.updateProfile({
      displayName: userData.name
    })
  }

  public async logout($event?: Event) {
    if ($event) {
      $event.preventDefault();
    }

    await this.auth.signOut();

    if (this.redirect) {
      await this.router.navigateByUrl('/');
    }
  }
}
