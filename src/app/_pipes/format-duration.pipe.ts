import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatDuration' })
export class FormatDurationPipe implements PipeTransform {
  private formatDuration(duration: number = 0): string {
    const asDays = duration / 1000 / 60 / 60 / 24;
    const days = Math.floor(asDays);
    const asHours = (asDays - days) * 24;
    const hours = Math.floor(asHours);
    const asMinutes = (asHours - hours) * 60;
    const minutes = Math.floor(asMinutes);
    const asSeconds = (asMinutes - minutes) * 60;
    const seconds = Math.floor(asSeconds);
    return `${days} ${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  transform(value: number): string {
    return this.formatDuration(value);
  }
}
