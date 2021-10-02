import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[sortingAction]',
})
export class SortingDirective {
  @Input() sortedColumns: { [column: string]: 'ASC' | 'DESC' | null } = {};
  @Input() columnName: string = '';

  @HostBinding('class')
  get setClass() {
    if (this.sortedColumns[this.columnName] === 'ASC') {
      return 'fa-sort-up';
    }
    if (this.sortedColumns[this.columnName] === 'DESC') {
      return 'fa-sort-down';
    }
    return 'fa-sort';
  }
}
