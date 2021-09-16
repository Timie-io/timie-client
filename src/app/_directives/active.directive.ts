import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[activeStyle]',
})
export class ActiveDirective {
  @Input() isActive?: boolean;

  @HostBinding('class')
  get setClass() {
    if (this.isActive) {
      return 'text-success';
    }
    return 'text-danger';
  }
}
