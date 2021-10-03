import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { filter, first } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { EntriesOnlyGQL } from './graphql/entries-query.graphql';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private oldTitle: string;

  private favIcon: HTMLLinkElement | null = document.querySelector('#appIcon');

  constructor(
    private readonly titleService: Title,
    private readonly authService: AuthService,
    private readonly entriesOnlyGQL: EntriesOnlyGQL
  ) {
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

  async updateAppStatus() {
    if (await this.isRunning()) {
      this.setRunning();
    } else {
      this.setStopped();
    }
  }

  async isRunning() {
    // returns true when the current user has any running entry
    const user = await this.authService.user$
      .pipe(
        filter((user) => user !== null),
        first()
      )
      .toPromise();
    const { data } = await this.entriesOnlyGQL
      .watch({ userID: user?.id })
      .valueChanges.pipe(first())
      .toPromise();
    const entry = data.entries.result.find((entry) => !entry.finishTime);
    return entry ? true : false;
  }
}
