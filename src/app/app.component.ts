import { Component, OnInit } from '@angular/core';
import { AppService } from './_services/app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public constructor(private readonly appService: AppService) {}

  async ngOnInit() {}
}
