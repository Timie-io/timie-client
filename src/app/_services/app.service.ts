import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { EntriesService } from './entries.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private oldTitle: string;

  private favIcon: HTMLLinkElement | null = document.querySelector('#appIcon');

  constructor(
    private readonly titleService: Title,
    private readonly entriesService: EntriesService
  ) {
    this.oldTitle = this.titleService.getTitle();
    this.entriesService.entriesRunningQuery.valueChanges.subscribe(
      ({ data }) => {
        if (data.entries.result.length > 0) {
          this.setRunning();
        } else {
          this.setStopped();
        }
      }
    );
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
