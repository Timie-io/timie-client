import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { filter, first } from 'rxjs/operators';
import { AuthService } from './auth.service';
import {
  StartEntryGQL,
  StopEntryGQL,
} from './graphql/entries-mutation.graphql';
import { EntriesOnlyGQL } from './graphql/entries-query.graphql';

@Injectable({
  providedIn: 'root',
})
export class EntriesService {
  private oldTitle: string;

  private favIcon: HTMLLinkElement | null = document.querySelector('#appIcon');

  constructor(
    private readonly titleService: Title,
    private readonly authService: AuthService,
    private readonly entriesGQL: EntriesOnlyGQL,
    private readonly startEntryGQL: StartEntryGQL,
    private readonly stopEntryGQL: StopEntryGQL
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

  startEntry$(id: string) {
    this.setRunning();
    return this.startEntryGQL.mutate({ id: id });
  }

  stopEntry$(id: string) {
    this.setStopped();
    return this.stopEntryGQL.mutate({ id: id });
  }

  async isRunning() {
    // returns true when the current user has any running entry
    const user = await this.authService.user$
      .pipe(
        filter((user) => user !== null),
        first()
      )
      .toPromise();
    const { data } = await this.entriesGQL
      .watch({ userID: user?.id })
      .valueChanges.pipe(first())
      .toPromise();
    const entry = data.entries.result.find((entry) => !entry.finishTime);
    return entry ? true : false;
  }
}
