import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";

// We need to tell angular that a CLASS needs to be injectable to be able to inject a dependency like AngularFireAuth
@Injectable({
  providedIn: 'root'
})
export class EmailTaken implements AsyncValidator {
  constructor(private auth: AngularFireAuth) {

  }

  validate = (control: AbstractControl): Promise<ValidationErrors | null> => {
    // Since the method need to return a promise await is not useful, so we are using then 
    return this.auth.fetchSignInMethodsForEmail(control.value)
      .then(response => response.length ? { emailTaken: true } : null)
  }
}
