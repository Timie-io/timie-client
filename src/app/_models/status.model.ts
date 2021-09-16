import { Assignment } from './assignment.model';

export interface Status {
  code: string;
  label: string;
  order: number;
  assignments: Assignment[];
}
