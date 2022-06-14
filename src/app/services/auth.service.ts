import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';

import IUser from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userCollections: AngularFirestoreCollection<IUser>
  public isAuthenticated$: Observable<boolean> 

  constructor(private auth: AngularFireAuth, private db: AngularFirestore) {
    this.userCollections = db.collection('users')
    this.isAuthenticated$ = auth.user.pipe(
      map(user => !!user)
    )
  }

  public async createUser(userData: IUser) {
    if (!userData.password) {
      throw new Error('Password not provided')
    }

    const userCredentials = await this.auth.createUserWithEmailAndPassword(userData.email, userData.password);

    if(!userCredentials.user) {
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
}
