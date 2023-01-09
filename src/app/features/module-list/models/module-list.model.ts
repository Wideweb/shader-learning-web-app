export interface ModuleListDto {
  id: number;
  name: string;
  description: string;
  tasks: number;
  order: number;
  locked: boolean;
  acceptedTasks: number;
}
