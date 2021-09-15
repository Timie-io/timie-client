import { Team } from './team.model';
import { User } from './user.model';

export interface Project {
  id: string;
  name: string;
  description: string;
  creationDate?: string;
  owner?: User;
  team?: Team;
  active?: boolean;
}
