import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { UserAchievementDto } from '../models/user-achievement.model';
import { MatDialog } from '@angular/material/dialog';
import { AchievementDialogComponent, AchievementDialogModel } from '../components/achievements-dialog/achievements-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class AchievementsService {

    constructor(private http: HttpClient, private dialog: MatDialog) {}

    public getCompleted(): Observable<UserAchievementDto[]> {
        return this.http.get<UserAchievementDto[]>(`${API}/achievements/completed`).pipe(shareReplay(1));
    }

    public getUnviewed(): Observable<UserAchievementDto[]> {
        return this.http.get<UserAchievementDto[]>(`${API}/achievements/unviewed`).pipe(shareReplay(1));
    }

    public view(achievementId: number): Observable<boolean> {
        return this.http.put<boolean>(`${API}/achievements/${achievementId}/view`, null).pipe(shareReplay(1));
    }

    public async checkForUpdates(): Promise<void> {
        const unviewed = await firstValueFrom(this.getUnviewed());
        for (let achievement of unviewed) {
            const dialog$ = this.dialog
                .open<AchievementDialogComponent, AchievementDialogModel, void>(AchievementDialogComponent, { 
                    disableClose: true,
                    data: {
                        id: achievement.achievementId,
                        name: achievement.name,
                        message: achievement.message,
                    }
                })
                .afterClosed();
            await firstValueFrom(dialog$);
            await firstValueFrom(this.view(achievement.achievementId));
        }
    } 
}
  