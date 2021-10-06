import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private oldTitle: string;

  private favIcon: HTMLLinkElement | null = document.querySelector('#appIcon');

  constructor(private readonly titleService: Title) {
    this.oldTitle = this.titleService.getTitle();
  }

  setRunning() {
    this.titleService.setTitle('Timie - Running');
    if (this.favIcon) {
      this.favIcon.href = '/assets/running.ico';
    }
  }

  setStopped() {
    this.titleService.setTitle(this.oldTitle);
    if (this.favIcon) {
      this.favIcon.href = 'favicon.ico';
    }
  }
}
