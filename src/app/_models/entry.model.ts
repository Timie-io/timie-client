import { Assignment } from './assignment.model';

export interface Entry {
  id: string;
  startTime: string;
  finishTime: string;
  assignment: Assignment;
}
