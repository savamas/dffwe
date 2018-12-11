import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthentificationService} from '../services/authentification.service';
import {AlertService} from '../services/alert.service';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authentificationService: AuthentificationService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.authentificationService.logout();

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;

    }

    this.loading = true;
    this.authentificationService.login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        data => {
          if (data['error'] === undefined) {
            this.router.navigate([this.returnUrl]);
          } else {
            this.alertService.error(data['error']);
            this.loading = false;
          }
        }
      );
  }
}
