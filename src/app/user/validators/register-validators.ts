import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class RegisterValidators {
  /*
  static methods let us use the method without creating a new instance of the method
  But do not allow us to use properties/methods of the class

  test = 5
  static match() {
    console.log(this.test)
  }

  would throw an error
 */
  static match(controlName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName)
      const matchingControl = group.get(matchingControlName)

      if (!control || !matchingControl) {
        console.error('Form controls can not be found in the form group')
        return { controlNotFound: false }
      }

      const error = control.value === matchingControl.value ? null : { noMatch: true }

      if (error) {
        matchingControl.setErrors({ ...matchingControl.errors, ...error });
      } else if (matchingControl.hasError('noMatch')) {
        matchingControl.setErrors(error)
      }

      return error
    }
  }
}
