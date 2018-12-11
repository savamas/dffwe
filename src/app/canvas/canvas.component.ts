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
  @Input() public width = 300;
  @Input() public height = 300;
  @Input() radius;
  @Input() submitted;
  @Input() hits;
  @Input() form: NgForm;
  @Input() isClicked;
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

    const rect = this.canvas.nativeElement.getBoundingClientRect();
    this.ctx.fillStyle = 'red';
    this.ctx.beginPath();
    this.ctx.arc(event.clientX - rect.left, event.clientY - rect.top, 1, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.fillStyle = '#000';

    const x = (event.clientX - rect.left - 150) / 20;
    const y = (150 - event.clientY + rect.top) / 20;

    this.x = x;
    this.y = y;
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
    ctx.moveTo(150 + 0.5, 0);
    ctx.lineTo(150 + 0.5, 300);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 150 - 0.5);
    ctx.lineTo(300, 150 - 0.5);
    ctx.stroke();
  }

  private drawArrows(ctx) {
    ctx.beginPath();
    ctx.moveTo(150 + 0.5, 0);
    ctx.lineTo(147 + 0.5, 7);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(150 + 0.5, 0);
    ctx.lineTo(153 + 0.5, 7);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(300, 150 - 0.5);
    ctx.lineTo(293, 150 - 3.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(300, 150 - 0.5);
    ctx.lineTo(293, 150 + 2.5);
    ctx.stroke();
  }

  private drawTips(ctx) {
    for (let i = 10; i <= 290; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i + 0.5, 150 - 3);
      ctx.lineTo(i + 0.5, 150 + 2);
      ctx.stroke();
    }
    for (let i = 10; i <= 290; i += 20) {
      ctx.beginPath();
      ctx.moveTo(148, i - 0.5);
      ctx.lineTo(153, i - 0.5);
      ctx.stroke();
    }
  }

  private drawXValues(ctx) {
    ctx.font = '9px Arial';
    let x = -14;
    for (let i = -7; i < 0; ++i) {
      ctx.fillText(i, x += 20, 150 - 3);
    }
    x += 22;
    for (let i = 1; i <= 7; ++i) {
      ctx.fillText(i, x += 20, 150 - 3);
    }
  }

  private drawYValues(ctx) {
    ctx.font = '9px Arial';
    let y = -8;
    for (let i = 7; i >= -7; --i) {
      if (i !== 0) {
        ctx.fillText(i, 154, y += 20);
      } else { y += 20; }
    }
  }

  public clearChart() {
    this.ctx.clearRect(0, 0, 300, 300);
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0 , 300, 300);
    this.ctx.fillStyle = '#000';
    this.ctx.strokeRect(0, 0, 300, 300);
    this.drawAxis(this.ctx);
    this.drawArrows(this.ctx);
    this.drawTips(this.ctx);
    this.drawXValues(this.ctx);
    this.drawYValues(this.ctx);
  }

  private drawArea(R, ctx, canv) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0 , 300, 300);
    ctx.clearRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = '#3399FF';
    ctx.save();
    ctx.translate(canv.width / 2, canv.height / 2);
    ctx.beginPath();
    ctx.arc(150 + 0.5, 150 - 0.5, R * 20, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillRect(0 , 0 , 150, 300);
    ctx.fillRect(150 + 0.5, 150 - 0.5, 150 + 0.5, 149 + 0.5);
    ctx.fillStyle = '#000';
    ctx.strokeRect(0, 0, 300, 300);
    ctx.fillStyle = '#3399FF';
    ctx.fillRect(150 - R * 20, 150 - 1, R * 20, R * 20);
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.lineTo(150, 150 - R * 20);
    ctx.lineTo(150 - (R / 2) * 20, 150);
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
      this.ctx.arc(history[i].x * 20 + 150 + 0.5, 150 - history[i].y * 20 - 0.5, 1, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.fillStyle = '#000';
  }

}
