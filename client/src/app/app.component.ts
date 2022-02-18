import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'client';
  innerWidth: number = window.innerWidth;
  innerHeight: number = window.innerHeight;

  @HostListener('window:resize')
  onResize = () => {
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;
  };
}
