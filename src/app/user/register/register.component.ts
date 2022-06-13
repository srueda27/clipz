import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(private auth: AuthService) {

  }

  inSubmission = false;

  name = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ])
  email = new FormControl('', [
    Validators.required,
    Validators.pattern(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)
  ])
  age = new FormControl(0, [
    Validators.required,
    Validators.min(18),
    Validators.max(120)
  ])
  password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
  ])
  confirmPassword = new FormControl('', [
    Validators.required,

  ])
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(13),
    Validators.maxLength(13)
  ])

  showAlert = false;
  alertMessage = 'Please wait! Your account is being created';
  alertColor = 'blue';

  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirmPassword: this.confirmPassword,
    phoneNumber: this.phoneNumber
  });

  async register() {
    this.showAlert = true;
    this.alertMessage = 'Please wait! Your account is being created';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      const email = this.email.value!
      const name = this.name.value!
      const age = this.age.value!
      const password = this.password.value!
      const phoneNumber = this.phoneNumber.value!

      await this.auth.createUser({ email, name, age, password, phoneNumber })
    } catch (error) {
      console.error(error);

      this.alertMessage = 'An unexpected error ocurred. Please try again later';
      this.alertColor = 'red';
      this.inSubmission = false;
      return
    }

    this.alertMessage = 'Success! Your account has been created';
    this.alertColor = 'green';
  }

}
