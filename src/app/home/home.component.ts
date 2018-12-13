import {Component, ViewChild, AfterViewInit, OnInit} from '@angular/core';
import {User} from '../models/user';
import {FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import {coerceNumberProperty} from '@angular/cdk/coercion';
import {CanvasComponent} from '../canvas/canvas.component';
import {first} from 'rxjs/operators';
import {UserService} from '../services/user.service';
import {AlertService} from '../services/alert.service';
import {Hit} from '../models/hit';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./hits.css']
})
export class HomeComponent implements AfterViewInit, OnInit {
  currentUser: User;
  submitted = false;
  radius = 1;
  isClicked = false;
  hits: Hit[] = [];
  isRadiuseSet = true;

  @ViewChild(CanvasComponent) canv;

  form: FormGroup;
  validX = [
    { id: -4, name: '-4'},
    { id: -3, name: '-3'},
    { id: -2, name: '-2'},
    { id: -1, name: '-1'},
    { id: 0, name: '0'},
    { id: 1, name: '1'},
    { id: 2, name: '2'},
    { id: 3, name: '3'},
    { id: 4, name: '4'}
  ];
  validR = [
    { id: 1, name: '1'},
    { id: 2, name: '2'},
    { id: 3, name: '3'},
    { id: 4, name: '4'}
  ];
  private tempRadius: number;
  private tempX: number;
  private tempY: number;
  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private alertService: AlertService,
              private router: Router) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const controls = this.validX.map(c => new FormControl(false));
    const controls1 = this.validR.map(c => new FormControl(false));
    controls[0].setValue(true);
    controls1[0].setValue(true);
    this.form = this.formBuilder.group({
      validX: new FormArray(controls, this.minSelectedCheckboxes(1)),
      validY: ['0', Validators.required],
      validR: new FormArray(controls1, this.minSelectedCheckboxes(1))
    });
  }

  ngOnInit() {
    this.loadAllHits();
  }

  private RadiusChange() {
    const selectedRadiuses = this.form.value.validR
      .map((v, i) => v ? this.validR[i].id : null)
      .filter(v => v !== null);
    if (selectedRadiuses.length === 1) {
      this.radius = selectedRadiuses[0];
      this.canv.updateChart(this.radius, this.hits);
      this.isRadiuseSet = true;
    } else {
      this.canv.clearChart();
      this.isRadiuseSet = false;
    }
  }

  ngAfterViewInit() {
    this.canv.updateChart(1, null);
  }

  submit() {
    this.submitted = true;

    if (this.form.invalid) {
      if (this.isRadiuseSet === false) {
        this.alertService.error('Radius is not set!');
      }
      return;
    }

    const selectedX = this.form.value.validX
      .map((v, i) => v ? this.validX[i].id : null)
      .filter(v => v !== null);

    const selectedR = this.form.value.validR
      .map((v, i) => v ? this.validR[i].id : null)
      .filter(v => v !== null);

    this.tempX = selectedX[0];
    this.tempY = this.form.value.validY;
    this.tempRadius = selectedR[0];

    if (this.canv.isClicked === true) {
      this.tempX = this.canv.x;
      this.tempY = this.canv.y;
      this.isClicked = false;
      this.canv.isClicked = false;
    }
      this.userService.checkHit(this.tempX, this.tempY, selectedR[0])
        .pipe(first())
        .subscribe(
          data => {
            if (data['error'] === undefined) {
              if (data['isInArea'] === 'No') {
                this.alertService.error('You missed :(');
              } else {
                this.alertService.success('Right shot, man', false);
              }
            } else {
              this.alertService.error(data['error']);
            }
            this.loadAllHits();
            this.submitted = false;
          },
          error => {
            this.alertService.error('Unauthorized because of long inactive', true);
            this.router.navigate(['/login']);
          }
        );
  }

  private loadAllHits() {
    this.userService.getAll().pipe(first()).subscribe(hits => {
      this.hits = hits;
      if (this.hits !== null) {
        this.canv.updateChart(this.radius, this.hits);

      }
    });
  }

  private minSelectedCheckboxes(min = 1) {
    const validator: ValidatorFn = (formArray: FormArray) => {
      const totalSelected = formArray.controls
      // get a list of checkbox values (boolean)
        .map(control => control.value)
        // total up the number of checked checkboxes
        .reduce((prev, next) => next ? prev + next : prev, 0);

      // if the total is not greater than the minimum, return the error message
      return totalSelected === min ? null : { required: true };
    };

    return validator;
  }
}
