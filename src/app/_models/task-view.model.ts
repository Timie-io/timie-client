export interface TaskView {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  active: boolean;
  created: string;
  creatorId: string;
  creatorName: string;
  modified: string;
  priority: number;
}
