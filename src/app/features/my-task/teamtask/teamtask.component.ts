

import { Component } from '@angular/core';
import { AdminService } from '../../../admin/servies/admin.service';
import { HelpdeskService } from '../../helpdesk/service/helpdesk.service';
import { TaskService } from '../service/task.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-teamtask',
  standalone: false,
  templateUrl: './teamtask.component.html',
  styleUrl: './teamtask.component.css'
})
export class TeamtaskComponent {
  allTasks: any[] = [];

  selectedEmployee: string = '';
  selectedStatus: string = '';
  selectedPriority: string = '';
  fromDate: string = '';
  toDate: string = '';
  searchText: string = '';
  showModal = false;
  isEditMode = false;
  editIndex: number | null = null;
  employees: any[] = [];   // dynamic data
  showMentionDropdown = false;
  userId!: number;
  companyId!: number;
  regionId!: number;
  priorities: any[] = [];
  taskStatuses: any[] = [];
  showEmojiPicker = false;
  selectedFiles: File[] = [];
  existingFiles: any[] = [];
  projects: any[] = [];
  deletedFileIds: number[] = [];
  // Pagination
pageSize = 5;
currentPage = 1;
pageSizeOptions = [5, 10, 20, 50, 100];
  removeExistingFile(index: number) {

    const file = this.existingFiles[index];

    // save deleted file id
    this.deletedFileIds.push(file.taskFileId);

    // remove from UI
    this.existingFiles.splice(index, 1);
  }
  // toggle dropdown
  toggleMention() {
    this.showMentionDropdown = !this.showMentionDropdown;
  }
  toggleEmoji() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }
  // ADD THESE METHODS INSIDE TeamtaskComponent

  getTotalTasks(): number {
    return this.allTasks.length;
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

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // ✅ allowed formats
      const allowed = [
        'pdf', 'doc', 'docx',
        'xls', 'xlsx',
        'jpg', 'jpeg', 'png',
        'txt', 'zip'
      ];

      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!allowed.includes(ext)) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid File',
          text: `${file.name} is not supported`
        });

        continue;
      }

      // ✅ size limit (5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'File Too Large',
          text: `${file.name} exceeds 5MB`
        });

        continue;
      }

      // ✅ avoid duplicate
      const exists = this.selectedFiles.some(f => f.name === file.name);
      if (!exists) {
        this.selectedFiles.push(file);
      }
    }

    // reset input
    event.target.value = '';
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }
  addEmoji(event: any) {
    const emoji = event.emoji.native;

    this.newTask.comment =
      (this.newTask.comment || '') + emoji;

    this.showEmojiPicker = false;
  }
  // select employee
  selectMention(emp: any) {
    const mentionText = `@${emp.employeeName} `;

    this.newTask.comment =
      (this.newTask.comment || '') + mentionText;

    this.showMentionDropdown = false;
  }
  constructor(private adminService: AdminService, private helpdeskService: HelpdeskService, private service: AdminService
    , private taskService: TaskService
  ) { }

  ngOnInit() {
    this.loadPermissions();
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
    this.loadEmployees();
    this.loadPriorities();
    this.loadTaskStatuses();
    this.loadProjects();
    this.loadTasks();
  }
  loadProjects(): void {
    this.service.getProjectNames(this.companyId, this.regionId)
      .subscribe(res => {
        if (res.success && res.data) {
          this.projects = res.data;
        }
      });
  }
  loadTaskStatuses() {
    this.adminService
      .getTaskStatusesByCompanyRegion(this.companyId, this.regionId)
      .subscribe({
        next: (res: any) => {
          this.taskStatuses = res.data || res;
        },
        error: (err) => console.error(err)
      });
  }
  loadPriorities() {
    this.helpdeskService
      .getPriorities(this.companyId, this.regionId)
      .subscribe(res => {
        this.priorities = res;
      });
  }

  loadEmployees() {

  if (!this.userId) return;

  this.adminService.getManagerEmployees(this.userId)
    .subscribe({
      next: (res: any[]) => {

        this.employees = res.map((u: any) => ({
          userId: u.userId,
          employeeName: u.fullName,
          employeeCode: u.employeeCode
        }));

        // ✅ Add logged in manager also
        const managerName = sessionStorage.getItem('Name');
        const managerCode = sessionStorage.getItem('EmployeeCode');

        this.employees.unshift({
          userId: this.userId,
          employeeName: managerName,
          employeeCode: managerCode
        });

      }
    });
}
  getStatusName(id: number) {
    const s = this.taskStatuses.find(x => x.taskStatusId == id);
    return s ? s.taskStatusName : '';
  }

  tasks: any[] = [];




  newTask: any = this.getEmptyTask();

  openModal() {
    this.showModal = true;
    this.isEditMode = false;
  }
  getPriorityName(id: number) {
    const p = this.priorities.find(x => x.priorityId == id);
    return p ? p.priorityName : '';
  }

  closeModal() {
    this.showModal = false;
    this.newTask = this.getEmptyTask();
    this.isEditMode = false;
    this.editIndex = null;
    this.selectedFiles = [];
    this.existingFiles = [];
  }
  getProjectName(projectId: number) {
    const project = this.projects.find(x => x.projectMasterId == projectId);
    return project ? project.projectName : '';
  }


  saveTask() {

    const formData = new FormData();

    formData.append("TaskName", this.newTask.name);
    formData.append("ProjectId", this.newTask.projectId || '');
    formData.append("AssignedTo", this.newTask.assigned);
    formData.append("PriorityId", this.newTask.priorityId);
    formData.append("StatusId", this.newTask.statusId);
    formData.append("StartDate", this.newTask.startDate || '');
    formData.append("DueDate", this.newTask.dueDate || '');
    formData.append("Comment", this.newTask.comment || '');
    formData.append("UserId", this.userId.toString());
    formData.append("CompanyId", this.companyId.toString());
    formData.append("RegionId", this.regionId.toString());

    this.selectedFiles.forEach(file => {
      formData.append("Files", file);
    });

    if (this.isEditMode) {

      formData.append("TaskId", this.newTask.taskId);
      formData.append("TaskName", this.newTask.name);
      formData.append("ProjectId", this.newTask.projectId || '');
      formData.append("AssignedTo", this.newTask.assigned);
      formData.append("PriorityId", this.newTask.priorityId);
      formData.append("StatusId", this.newTask.statusId);
      formData.append("StartDate", this.newTask.startDate || '');
      formData.append("DueDate", this.newTask.dueDate || '');
      formData.append("Comment", this.newTask.comment || '');
      formData.append("UserId", this.userId.toString());
      formData.append("CompanyId", this.companyId.toString());
      formData.append("RegionId", this.regionId.toString());
     

      // deleted files
      formData.append(
        "DeletedFileIds",
        JSON.stringify(this.deletedFileIds)
      );

      this.taskService.updateTask(formData).subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Task updated successfully.',
            timer: 2000,
            showConfirmButton: false
          });

          this.loadTasks();
          this.closeModal();
        },

        error: () => {

          Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: 'Task update failed.'
          });

        }

      });

    } else {

      this.taskService.createTask(formData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Created!',
            text: 'Task created successfully.',
            timer: 2000,
            showConfirmButton: false
          });

          this.loadTasks();
          this.closeModal();
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Failed!',
            text: 'Task creation failed.'
          });
        }
      });
    }
  }

  loadTasks() {
    this.taskService.getTasks(this.userId).subscribe((res: any) => {
      this.allTasks = res.data || res;   // backup full list
      this.tasks = [...this.allTasks];
    });
  }
  // applyFilters() {
  //   this.tasks = this.allTasks.filter(task => {

  //     // Employee Filter
  //     const matchEmployee =
  //       !this.selectedEmployee ||
  //       task.assignedTo === this.selectedEmployee;

  //     // Status Filter
  //     const matchStatus =
  //       !this.selectedStatus ||
  //       task.statusId == this.selectedStatus;

  //     // Priority Filter
  //     const matchPriority =
  //       !this.selectedPriority ||
  //       task.priorityId == this.selectedPriority;

  //     // Search Filter
  //     const search = this.searchText.toLowerCase();
  //     const matchSearch =
  //       !search ||
  //       task.taskName?.toLowerCase().includes(search) ||
  //       task.assignedTo?.toLowerCase().includes(search) ||
  //       this.getProjectName(task.projectId)?.toLowerCase().includes(search);

  //     // Date Filter
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
  //       matchEmployee &&
  //       matchStatus &&
  //       matchPriority &&
  //       matchSearch &&
  //       matchDate
  //     );
  //   });
  // }
  // resetFilters() {
  //   this.selectedEmployee = '';
  //   this.selectedStatus = '';
  //   this.selectedPriority = '';
  //   this.fromDate = '';
  //   this.toDate = '';
  //   this.searchText = '';

  //   this.tasks = [...this.allTasks];
  // }


  deleteTask(task: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {

      if (result.isConfirmed) {

        this.taskService.deleteTask(task.taskId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Task deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });

            this.loadTasks();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Failed!',
              text: 'Task deletion failed.'
            });
          }
        });

      }

    });
  }


  editTask(task: any) {
    this.newTask = {
      ...task,
      name: task.taskName,
      assigned: task.assignedTo
    };

    // ✅ existing uploaded files
    this.existingFiles = task.taskFilesList || [];

    // ✅ newly selected files
    this.selectedFiles = [];

    this.isEditMode = true;
    this.showModal = true;
  }

  // deleteTask(index: number) {
  //   if (confirm('Are you sure you want to delete this task?')) {
  //     this.tasks.splice(index, 1);
  //   }
  // }


  getEmptyTask() {
    return {
      name: '',
      projectId: '',
      assigned: '',
      priorityId: '',

      statusId: '',
      dueDate: '',
      comment: ''
    };
  }
  getFileUrl(path: string): string {

    if (!path) return '';

    return `${this.taskService.getFileBaseUrl()}/${path}`;

  }
  getStatusCardClass(status: string): string {

  switch (status.toLowerCase()) {

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

  switch (status.toLowerCase()) {

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

  switch (status.toLowerCase()) {

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
getFilteredTasks(): any[] {

  let data = this.allTasks.filter(task => {

    const matchEmployee =
      !this.selectedEmployee ||
      task.assignedTo === this.selectedEmployee;

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
      task.assignedTo?.toLowerCase().includes(search) ||
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
      matchEmployee &&
      matchStatus &&
      matchPriority &&
      matchSearch &&
      matchDate
    );
  });

  const startIndex = (this.currentPage - 1) * this.pageSize;

  return data.slice(startIndex, startIndex + this.pageSize);
}
get totalPages(): number {

  const totalRecords = this.allTasks.filter(task => {

    const matchEmployee =
      !this.selectedEmployee ||
      task.assignedTo === this.selectedEmployee;

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
      task.assignedTo?.toLowerCase().includes(search) ||
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
      matchEmployee &&
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
applyFilters() {
  this.currentPage = 1;
}
resetFilters() {

  this.selectedEmployee = '';
  this.selectedStatus = '';
  this.selectedPriority = '';
  this.fromDate = '';
  this.toDate = '';
  this.searchText = '';

  this.currentPage = 1;
}
canAdd = false;
canEdit = false;
canDelete = false;
loadPermissions() {

  const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

  const menu = menus.find(
    (m: any) =>
      m.menuName?.trim().toLowerCase() === 'team task'
  );

  this.canAdd = menu?.canAdd ?? false;
  this.canEdit = menu?.canEdit ?? false;
  this.canDelete = menu?.canDelete ?? false;
}
}
