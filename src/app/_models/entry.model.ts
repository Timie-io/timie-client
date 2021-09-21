import { Assignment } from './assignment.model';
import { User } from './user.model';

export interface Entry {
  id: string;
  startTime: string;
  finishTime: string;
  note: string;
  assignment: Assignment;
  user: User;
}
