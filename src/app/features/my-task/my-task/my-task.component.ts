import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-task',
  standalone: false,
  templateUrl: './my-task.component.html',
  styleUrl: './my-task.component.css'
})
export class MyTaskComponent implements OnInit {

  canViewMyTask = false;
  canViewTeamTask = false;
  canViewTaskReport = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadTabPermissions();

    // Default navigation
    // if (this.canViewMyTask) {
    //   this.router.navigate(['/my-task/my-tasks']);
    // }
    // else if (this.canViewTeamTask) {
    //   this.router.navigate(['/my-task/team-task']);
    // }
    // else if (this.canViewTaskReport) {
    //   this.router.navigate(['/my-task/task-report']);
    // }
  }

  loadTabPermissions(): void {

    const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

    const mytask = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'my task'
    );

    const teamtask = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'team task'
    );

    const taskreport = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'task report'
    );

    this.canViewMyTask = mytask?.canView ?? false;
    this.canViewTeamTask = teamtask?.canView ?? false;
    this.canViewTaskReport = taskreport?.canView ?? false;
  }
}
