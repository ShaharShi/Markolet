import { transition, trigger, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUser } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth/auth.service';
import { validateCity } from 'src/app/utils/validators';
import { APP_IMAGES } from 'src/app/utils/images';
import { ECities } from '../../models/enums'

@Component({
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.css'],
  animations: [
    trigger('firstFormVisibilityState', [
      transition(':enter', [
        style({ position: 'absolute', transform: 'scale(.7)', opacity: 0 }),
        animate('.5s ease-in', style({ position: 'absolute', transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
          style({ position: 'absolute', opacity: .1 }),
          animate('.5s ease-out', style({ position: 'absolute', opacity: 0 }))
      ])
    ]),
    trigger('secondFormVisibilityState', [
      transition(':enter', [
        style({ position: 'absolute', transform: 'scale(.7)', opacity: 0 }),
        animate('.5s ease-in', style({ position: 'absolute',  transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ position: 'absolute', opacity: .1 }),
        animate('.5s ease-out', style({ position: 'absolute', opacity: 0 }))
      ])
    ]),
    trigger('errorMessageState', [
      transition(':enter', [
        style({ transform: 'translateY(-20%)', opacity: 0 }),
        animate('.2s ease-in', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('.2s ease-out', style({ transform: 'translateY(-20%)', opacity: 0 }))
      ])
    ])
  ]
})
export class SignupPageComponent implements OnInit {

  cities = Object.values(ECities);
  firstStepCompleted: boolean = false;
  firstStepError: string = '';
  secondStepError: string = '';
  IMAGES = APP_IMAGES;
  // Explanation:
  // I have split the signup form to two separated forms, to validate the first step form before the user transferred to the second part of the signup form.
  // in case the first part is invalid, i prevent the user from transferring to the second part.
  // If it was one form that separeted to two different UI parts, i could not validate the first part because the second part is'nt yet fulfilled, and the form was invalid.
  // On the other hand, i could check every value from the first step before transferring the user to the second part, but it's more code and more work in my opinion..
  // Am i right ? or it is'nt the solution here ?

  firstStepForm = this.fb.group({
    personalID: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
  })
  secondStepForm = this.fb.group({
    city: ['', [Validators.required, validateCity()]],
    street: ['', [Validators.required]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
  })
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.fetchUserSession();
    if (user) this.router.navigate(['/'])
  }
  
  handleSubmit = async () => {
    if ((this.firstStepForm.invalid || this.firstStepForm.untouched || this.firstStepForm.pristine) 
          &&
        (this.secondStepForm.invalid || this.secondStepForm.untouched || this.secondStepForm.pristine)) return this.secondStepError = 'All fields are require to proceed';
    const user: Omit<IUser, '_id' | 'isAdmin'> = {
      personalID: Number(this.firstStepForm.controls['personalID'].value),
      email: this.firstStepForm.controls['email'].value,
      password: this.firstStepForm.controls['password'].value,
      address: {
        city: this.secondStepForm.controls['city'].value,
        street: this.secondStepForm.controls['street'].value,
      },
      firstName: this.secondStepForm.controls['firstName'].value,
      lastName: this.secondStepForm.controls['lastName'].value,
    }

    const results = await this.authService.signup(user);
    if(results) return this.secondStepError = results;
    this.router.navigate(['/'])
    return;
  }

  finishFirstStep = async () => {
    const password = this.firstStepForm.get('password')?.value;
    const confirmPassword = this.firstStepForm.get('confirmPassword')?.value;
    const email = this.firstStepForm.get('email')?.value;
    const personalID = this.firstStepForm.get('personalID')?.value;

    if (this.firstStepForm.invalid || this.firstStepForm.untouched || this.firstStepForm.pristine) return this.firstStepError = 'All fields are required to proceed';
    if (password !== confirmPassword) return this.firstStepError = 'Password fields must be identical !'

    // validateEmailAndPersonalID method returns null | string.
    // if null the validation was success and there is no user with the given email and/or personalID.
    // if string so the validation failed and we get the error string, to show the user the failure reason.
    const results = await this.authService.validateEmailAndPersonalID(email, personalID);

    if (results) return this.firstStepError = results;
    this.firstStepCompleted = true;
    return;
  }
}
