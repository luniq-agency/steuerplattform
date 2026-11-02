export type Subtask = {
  assignee: string | number;
  created_at: string;
  created_by: string | number;
  description: string;
  due_date: Date;
  id: number;
  last_update: Date;
  name: string;
  status: string;
  task: string | number;
};

export type Task = {
  assignee: string | number;
  created_at: string;
  created_by: string | number;
  description: string;
  due_date: Date | null;
  id: number;
  last_update: Date;
  name: string;
  status: string;
  subtask_completed: number;
  subtask_count: number;
  user: string | number;
};

export type TaskUpdate = {
  body: string;
  created_at: string;
  created_by: string | number;
  task: string | number;
};
