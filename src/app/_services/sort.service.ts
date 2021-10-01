import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface SortInput {
  columnName: string;
  sortType?: 'ASC' | 'DESC';
}

export type SortColumns = { [name: string]: SortInput };

export type SortConfig = { [view: string]: SortColumns };

export type SortUpdate = [string, string, 'ASC' | 'DESC' | null];

@Injectable({
  providedIn: 'root',
})
export class SortService {
  sortConfig: SortConfig = {};

  private sortUpdateSub: Subject<SortUpdate>;
  sortUpdate$: Observable<SortUpdate>;

  constructor() {
    this.sortUpdateSub = new Subject<SortUpdate>();
    this.sortUpdate$ = this.sortUpdateSub.asObservable();
  }

  toogleColumn(view: string, name: string) {
    if (!(view in this.sortConfig)) {
      this.sortConfig[view] = {};
    }
    let sortUpdate: SortUpdate;
    const input = this.sortConfig[view][name];
    if (input) {
      if (input.sortType === 'ASC') {
        input.sortType = 'DESC';
        sortUpdate = [view, name, 'DESC'];
      } else {
        delete this.sortConfig[view][name];
        sortUpdate = [view, name, null];
      }
    } else {
      this.sortConfig[view][name] = {
        columnName: name,
        sortType: 'ASC',
      };
      sortUpdate = [view, name, 'ASC'];
    }
    this.sortUpdateSub.next(sortUpdate);
  }

  getSortOptions(view: string): SortInput[] {
    const output: SortInput[] = [];
    for (let column in this.sortConfig[view]) {
      output.push(this.sortConfig[view][column]);
    }
    return output;
  }

  getSortedColumns(view: string): SortColumns {
    return this.sortConfig[view] || {};
  }

  getColumnSort(view: string, name: string): 'ASC' | 'DESC' | null {
    if (!(view in this.sortConfig)) {
      return null;
    }
    const input = this.sortConfig[view][name];
    if (!input) {
      return null;
    }
    return input.sortType || null;
  }
}
