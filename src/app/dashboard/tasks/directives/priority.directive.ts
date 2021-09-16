import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[taskPriority]',
})
export class TaskPriorityDirective {
  @Input() priority?: number;

  @HostBinding('class')
  get changeClass() {
    const p = this.priority || 0;
    if (p > 5) {
      return 'text-danger';
    }
    if (p > 2) {
      return 'text-warning';
    }
    return 'text-success';
  }
}
