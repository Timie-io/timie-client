import { Assignment } from './assignment.model';
import { Project } from './project.model';
import { User } from './user.model';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: number;
  creationDate?: string;
  lastModified?: string;
  project?: Project;
  active?: boolean;
  creator?: User;
  followers?: User[];
  assignments?: Assignment[];
}
