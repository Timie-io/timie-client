import { Component, OnInit } from '@angular/core';
import { EntriesService } from './_services/entries.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public constructor(private readonly entriesService: EntriesService) {}

  async ngOnInit() {
    if (await this.entriesService.isRunning()) {
      this.entriesService.setRunning();
    }
  }
}
