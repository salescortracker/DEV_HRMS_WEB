

import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { TaskService } from '../service/task.service';
import { AdminService } from '../../../admin/servies/admin.service';
import { HelpdeskService } from '../../helpdesk/service/helpdesk.service';


@Component({
  selector: 'app-mytask',
  standalone: false,
  templateUrl: './mytask.component.html',
  styleUrl: './mytask.component.css'
})
export class MytaskComponent {
 tasks: any[] = [];
  taskStatuses: any[] = [];
  priorities: any[] = [];
  projects: any[] = [];

  userId!: number;
  companyId!: number;
  regionId!: number;

  showModal = false;
  selectedTask: any;
  allTasks: any[] = [];

  selectedStatus: string = '';
  selectedPriority: string = '';
  fromDate: string = '';
  toDate: string = '';
  searchText: string = '';
  
// Pagination
pageSize = 5;
currentPage = 1;
pageSizeOptions = [5, 10, 20, 50, 100];
  constructor(
    private taskService: TaskService,
    private adminService: AdminService,
    private helpdeskService: HelpdeskService
  ) { }

  ngOnInit() {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    this.loadTasks();
    this.loadStatuses();
    this.loadPriorities();
    this.loadProjects();
  }

  // ✅ LOAD TASKS
  loadTasks() {
    this.taskService.getMyTasks(this.userId)
      .subscribe((res: any) => {
        this.allTasks = res.data || res;
        this.tasks = [...this.allTasks];
      });
  }

  // ✅ MASTER DATA
  loadStatuses() {
    this.adminService.getTaskStatusesByCompanyRegion(this.companyId, this.regionId)
      .subscribe((res: any) => {
        this.taskStatuses = res.data || res;
      });
  }

  loadPriorities() {
    this.helpdeskService.getPriorities(this.companyId, this.regionId)
      .subscribe((res: any) => {
        this.priorities = res;
      });
  }

  loadProjects() {
    this.adminService.getProjectNames(this.companyId, this.regionId)
      .subscribe((res: any) => {
        this.projects = res.data || res;
      });
  }

  // ✅ HELPER METHODS
  getPriorityName(id: number) {
    return this.priorities.find(x => x.priorityId == id)?.priorityName;
  }

  getProjectName(id: number) {
    return this.projects.find(x => x.projectMasterId == id)?.projectName;
  }

  // ✅ INLINE STATUS UPDATE
 updateStatus(task: any) {

  const formData = new FormData();

  formData.append('TaskId', task.taskId);
  formData.append('TaskName', task.taskName || '');
  formData.append('ProjectId', task.projectId || '');
  formData.append('AssignedTo', task.assignedTo || '');
  formData.append('PriorityId', task.priorityId || '');
  formData.append('StatusId', task.statusId || '');
  formData.append('StartDate', task.startDate || '');
  formData.append('DueDate', task.dueDate || '');
  formData.append('Comment', task.comment || '');

  // ✅ ADD THIS (important for consistency)
  formData.append('UserId', this.userId.toString());
  formData.append('CompanyId', this.companyId.toString());
  formData.append('RegionId', this.regionId.toString());

  this.taskService.updateTask(formData).subscribe({
    next: () => {

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Status updated successfully',
        timer: 1500,
        showConfirmButton: false
      });

      // ✅ IMPORTANT: refresh list so UI + manager both sync properly
      this.loadTasks();
    },

    error: () => {
      Swal.fire('Error', 'Update failed', 'error');
    }
  });
}

  // ✅ MODAL OPEN
  openModal(task: any) {
    this.selectedTask = { ...task };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // ✅ SAVE FROM MODAL
  saveTask() {

    this.selectedTask.userId = this.userId;

    this.taskService.updateTask(this.selectedTask).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Task updated successfully', 'success');
        this.loadTasks();
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Update failed', 'error');
      }
    });
  }
  getTotalTasks(): number {
    return this.tasks.length;
  }

  getTaskCountByStatus(statusName: string): number {
    return this.tasks.filter(task =>
      this.getStatusName(task.statusId).toLowerCase() === statusName.toLowerCase()
    ).length;
  }

  getOverdueTasks(): number {
    const today = new Date();

    return this.tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const status = this.getStatusName(task.statusId).toLowerCase();

      return dueDate < today && status !== 'completed';
    }).length;
  }

  getStatusName(id: number) {
    const s = this.taskStatuses.find(x => x.taskStatusId == id);
    return s ? s.taskStatusName : '';
  }
  // applyFilters() {
  //   this.tasks = this.allTasks.filter(task => {

  //     const matchStatus =
  //       !this.selectedStatus ||
  //       task.statusId == this.selectedStatus;

  //     const matchPriority =
  //       !this.selectedPriority ||
  //       task.priorityId == this.selectedPriority;

  //     const search = this.searchText.toLowerCase();

  //     const matchSearch =
  //       !search ||
  //       task.taskName?.toLowerCase().includes(search) ||
  //       this.getProjectName(task.projectId)?.toLowerCase().includes(search);

  //     let matchDate = true;

  //     if (this.fromDate) {
  //       matchDate =
  //         matchDate &&
  //         new Date(task.startDate) >= new Date(this.fromDate);
  //     }

  //     if (this.toDate) {
  //       matchDate =
  //         matchDate &&
  //         new Date(task.dueDate) <= new Date(this.toDate);
  //     }

  //     return (
  //       matchStatus &&
  //       matchPriority &&
  //       matchSearch &&
  //       matchDate
  //     );
  //   });
  // }
  applyFilters() {
  this.currentPage = 1;
}
  getFilteredTasks(): any[] {

  let data = this.allTasks.filter(task => {

    const matchStatus =
      !this.selectedStatus ||
      task.statusId == this.selectedStatus;

    const matchPriority =
      !this.selectedPriority ||
      task.priorityId == this.selectedPriority;

    const search = this.searchText.toLowerCase();

    const matchSearch =
      !search ||
      task.taskName?.toLowerCase().includes(search) ||
      this.getProjectName(task.projectId)?.toLowerCase().includes(search);

    let matchDate = true;

    if (this.fromDate) {
      matchDate =
        matchDate &&
        new Date(task.startDate) >= new Date(this.fromDate);
    }

    if (this.toDate) {
      matchDate =
        matchDate &&
        new Date(task.dueDate) <= new Date(this.toDate);
    }

    return (
      matchStatus &&
      matchPriority &&
      matchSearch &&
      matchDate
    );
  });

  const startIndex = (this.currentPage - 1) * this.pageSize;

  return data.slice(startIndex, startIndex + this.pageSize);
}
  // resetFilters() {
  //   this.selectedStatus = '';
  //   this.selectedPriority = '';
  //   this.fromDate = '';
  //   this.toDate = '';
  //   this.searchText = '';

  //   this.tasks = [...this.allTasks];
  // }
  resetFilters() {

  this.selectedStatus = '';
  this.selectedPriority = '';
  this.fromDate = '';
  this.toDate = '';
  this.searchText = '';

  this.currentPage = 1;
}
getFileUrl(path: string): string {
  return `${this.taskService.getFileBaseUrl()}/${path}`;
}
getStatusCardClass(status: string): string {

  switch (status?.toLowerCase()) {

    case 'pending':
      return 'bg-warning-subtle';

    case 'in progress':
      return 'bg-info-subtle';

    case 'completed':
      return 'bg-success-subtle';

    case 'overdue':
      return 'bg-danger-subtle';

    default:
      return 'bg-light';
  }
}

getStatusIconClass(status: string): string {

  switch (status?.toLowerCase()) {

    case 'pending':
      return 'bg-warning';

    case 'in progress':
      return 'bg-info';

    case 'completed':
      return 'bg-success';

    case 'overdue':
      return 'bg-danger';

    default:
      return 'bg-secondary';
  }
}

getStatusIcon(status: string): string {

  switch (status?.toLowerCase()) {

    case 'pending':
      return 'fa fa-clock';

    case 'in progress':
      return 'fa fa-spinner';

    case 'completed':
      return 'fa fa-check';

    case 'overdue':
      return 'fa fa-exclamation-circle';

    default:
      return 'fa fa-circle';
  }
}

get totalPages(): number {

  const totalRecords = this.allTasks.filter(task => {

    const matchStatus =
      !this.selectedStatus ||
      task.statusId == this.selectedStatus;

    const matchPriority =
      !this.selectedPriority ||
      task.priorityId == this.selectedPriority;

    const search = this.searchText.toLowerCase();

    const matchSearch =
      !search ||
      task.taskName?.toLowerCase().includes(search) ||
      this.getProjectName(task.projectId)?.toLowerCase().includes(search);

    let matchDate = true;

    if (this.fromDate) {
      matchDate =
        matchDate &&
        new Date(task.startDate) >= new Date(this.fromDate);
    }

    if (this.toDate) {
      matchDate =
        matchDate &&
        new Date(task.dueDate) <= new Date(this.toDate);
    }

    return (
      matchStatus &&
      matchPriority &&
      matchSearch &&
      matchDate
    );
  }).length;

  return Math.ceil(totalRecords / this.pageSize) || 1;
}
changePage(page: number): void {

  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }

}

changePageSize(size: number): void {

  this.pageSize = size;
  this.currentPage = 1;

}
canEdit = false;
loadPermissions() {
  const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

  const menu = menus.find(
    (m: any) =>
      m.menuName?.trim().toLowerCase() === 'my task'
  );

  this.canEdit = menu?.canEdit ?? false;
}
}
