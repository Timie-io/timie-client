import { Entry } from './entry.model';
import { Status } from './status.model';
import { Task } from './task.model';
import { User } from './user.model';

export interface Assignment {
  id: string;
  creator: User;
  creationDate: string;
  user: User;
  task: Task;
  deadline?: string;
  note: string;
  status: Status;
  totalTime: number;
  entries: Entry[];
}
