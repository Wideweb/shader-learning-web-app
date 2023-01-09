export interface TaskProgressDto {
    id: number;
    moduleId: number;
    name: string;
    order: number;
    accepted: boolean;
    rejected: boolean;
    score: number;
    match: number;
}