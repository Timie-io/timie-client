import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  StartEntryGQL,
  StopEntryGQL,
} from './graphql/entries-mutation.graphql';

@Injectable({
  providedIn: 'root',
})
export class EntriesService {
  private oldTitle: string;

  private favIcon: HTMLLinkElement | null = document.querySelector('#appIcon');

  constructor(
    private readonly titleService: Title,
    private readonly startEntryGQL: StartEntryGQL,
    private readonly stopEntryGQL: StopEntryGQL
  ) {
    this.oldTitle = this.titleService.getTitle();
  }

  startEntry$(id: string) {
    this.titleService.setTitle('Timie - Running');
    if (this.favIcon) {
      this.favIcon.href = '/assets/running.ico';
    }
    return this.startEntryGQL.mutate({ id: id });
  }

  stopEntry$(id: string) {
    this.titleService.setTitle(this.oldTitle);
    if (this.favIcon) {
      this.favIcon.href = 'favicon.ico';
    }
    return this.stopEntryGQL.mutate({ id: id });
  }
}
