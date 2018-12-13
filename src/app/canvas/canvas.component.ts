import {
  Component, Input, ElementRef, AfterViewInit, ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import {switchMap, takeUntil, pairwise, first} from 'rxjs/operators';
import {UserService} from '../services/user.service';
import {AlertService} from '../services/alert.service';
import {NgForm} from '@angular/forms';
import {Hit} from '../models/hit';

@Component({
  selector: 'app-canvas',
  template: '<canvas #canvas (click)="getData($event)"></canvas>',
  styles: ['canvas { border: 1px solid #000; }']
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvas') public canvas: ElementRef;
  @Input() public width = 500;
  @Input() public height = 500;
  @Input() radius;
  @Input() submitted;
  @Input() hits;
  @Input() form: NgForm;
  @Input() isClicked;
  @Input() isRadiusSet;
  public x: number;
  public y: number;

  private ctx: CanvasRenderingContext2D;

  constructor(private userService: UserService,
              private alertService: AlertService) {}

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.ctx = canvasEl.getContext('2d');

    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.ctx.strokeStyle = '#000';

    this.updateChart(1, null);
  }

  public getData(event) {
    this.isClicked = true;
    if (this.isRadiusSet === true) {
      const rect = this.canvas.nativeElement.getBoundingClientRect();
      this.ctx.fillStyle = 'red';
      this.ctx.beginPath();
      this.ctx.arc(event.clientX - rect.left, event.clientY - rect.top, 1, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.fillStyle = '#000';

      const x = (event.clientX - rect.left - 250) / 20;
      const y = (250 - event.clientY + rect.top) / 20;

      this.x = x;
      this.y = y;
    } else {
      this.isClicked = false;
    }
    this.form.ngSubmit.emit();
  }

  public updateChart(radius, history: Hit[]) {
    this.drawArea(radius, this.ctx, this.canvas);
    this.drawAxis(this.ctx);
    this.drawArrows(this.ctx);
    this.drawTips(this.ctx);
    this.drawXValues(this.ctx);
    this.drawYValues(this.ctx);
    if (history !== null) {
      this.drawPreviousHits(history);
    }
  }
  private drawAxis(ctx) {
    ctx.beginPath();
    ctx.moveTo(250 + 0.5, 0);
    ctx.lineTo(250 + 0.5, 500);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 250 - 0.5);
    ctx.lineTo(500, 250 - 0.5);
    ctx.stroke();
  }

  private drawArrows(ctx) {
    ctx.beginPath();
    ctx.moveTo(250 + 0.5, 0);
    ctx.lineTo(247 + 0.5, 7);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(250 + 0.5, 0);
    ctx.lineTo(253 + 0.5, 7);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(500, 250 - 0.5);
    ctx.lineTo(493, 250 - 3.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(500, 250 - 0.5);
    ctx.lineTo(493, 250 + 2.5);
    ctx.stroke();
  }

  private drawTips(ctx) {
    for (let i = 10; i <= 490; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i + 0.5, 250 - 3);
      ctx.lineTo(i + 0.5, 250 + 2);
      ctx.stroke();
    }
    for (let i = 10; i <= 490; i += 20) {
      ctx.beginPath();
      ctx.moveTo(248, i - 0.5);
      ctx.lineTo(253, i - 0.5);
      ctx.stroke();
    }
  }

  private drawXValues(ctx) {
    ctx.font = '9px Arial';
    let x = -14;
    for (let i = -12; i < 0; ++i) {
      ctx.fillText(i, x += 20, 250 - 3);
    }
    x += 22;
    for (let i = 1; i <= 12; ++i) {
      ctx.fillText(i, x += 20, 250 - 3);
    }
  }

  private drawYValues(ctx) {
    ctx.font = '9px Arial';
    let y = -8;
    for (let i = 12; i >= -12; --i) {
      if (i !== 0) {
        ctx.fillText(i, 254, y += 20);
      } else { y += 20; }
    }
  }

  public clearChart() {
    this.ctx.clearRect(0, 0, 500, 500);
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0 , 500, 500);
    this.ctx.fillStyle = '#000';
    this.ctx.strokeRect(0, 0, 500, 500);
    this.drawAxis(this.ctx);
    this.drawArrows(this.ctx);
    this.drawTips(this.ctx);
    this.drawXValues(this.ctx);
    this.drawYValues(this.ctx);
  }

  private drawArea(R, ctx, canv) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0 , 500, 500);
    ctx.clearRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = '#3399FF';
    ctx.save();
    ctx.translate(canv.width / 2, canv.height / 2);
    ctx.beginPath();
    ctx.arc(250 + 0.5, 250 - 0.5, R * 20, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillRect(0 , 0 , 250, 500);
    ctx.fillRect(250 + 0.5, 250 - 0.5, 250 + 0.5, 249 + 0.5);
    ctx.fillStyle = '#000';
    ctx.strokeRect(0, 0, 500, 500);
    ctx.fillStyle = '#3399FF';
    ctx.fillRect(250 - R * 20, 250 - 1, R * 20, R * 20);
    ctx.beginPath();
    ctx.moveTo(250, 250);
    ctx.lineTo(250, 250 - R * 20);
    ctx.lineTo(250 - (R / 2) * 20, 250);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#000';
  }

  public drawPreviousHits(history: Hit[]) {
    for (let i = 0; i < history.length; ++i) {
      if (history[i].isInArea === 'Yes') {
        this.ctx.fillStyle = '#11FF00';
      } else {
        this.ctx.fillStyle = 'red';
      }
      this.ctx.beginPath();
      this.ctx.arc(history[i].x * 20 + 250 + 0.5, 250 - history[i].y * 20 - 0.5, 1, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.fillStyle = '#000';
  }

}
