import { Injectable } from '@angular/core';

export interface SortInput {
  columnName: string;
  sortType?: 'ASC' | 'DESC';
}

export type SortColumns = { [name: string]: SortInput };

export type SortConfig = { [view: string]: SortColumns };

@Injectable({
  providedIn: 'root',
})
export class SortService {
  sortConfig: SortConfig = {};

  toogleColumn(view: string, name: string) {
    if (!(view in this.sortConfig)) {
      this.sortConfig[view] = {};
    }
    const input = this.sortConfig[view][name];
    if (input) {
      if (input.sortType === 'ASC') {
        input.sortType = 'DESC';
      } else {
        delete this.sortConfig[view][name];
      }
    } else {
      this.sortConfig[view][name] = {
        columnName: name,
        sortType: 'ASC',
      };
    }
  }

  getSortOptions(view: string): SortInput[] {
    const output: SortInput[] = [];
    for (let column in this.sortConfig[view]) {
      output.push(this.sortConfig[view][column]);
    }
    return output;
  }
}
