import { User } from './user.model';

export interface Comment {
  id: string;
  creationDate: string;
  user: User;
  task: Task;
  body: string;
}
