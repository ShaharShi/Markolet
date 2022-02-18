import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  animations: [
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
export class LoginFormComponent {

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  })
  formError: string = '';
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  handleSubmit = async () => {
    if(this.form.invalid) return;
    const email = this.form.controls['email'].value;
    const password = this.form.controls['password'].value;

    const results = await this.authService.login(email, password)
    if (results.user?.isAdmin) this.router.navigate(['admin-panel'])
    if (results.error) return this.formError = results.error;
  }
  handleChange = () => {
    this.formError = '';
  }
}
