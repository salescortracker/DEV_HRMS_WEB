import { Component } from '@angular/core';
import { AdminService } from '../../../../admin/servies/admin.service';
import { environment } from '../../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-myforms',
  standalone: false,
  templateUrl: './employee-myforms.component.html',
  styleUrl: './employee-myforms.component.css'
})
export class EmployeeMyformsComponent {
  forms: any[] = [];
  employeeCode: string = '';
  documentTypes: any[] = [];
  employeeFilesMap: { [key: number]: File[] } = {};
  companyId: number = 0;
  regionId: number = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50];
  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.employeeCode = sessionStorage.getItem("EmployeeCode") || '';
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
    this.loadDocumentTypes();
    this.loadMyForms();
  }

  loadDocumentTypes() {
    this.adminService.getAttachments(this.companyId, this.regionId)
      .subscribe({
        next: (res: any[]) => {

          const formsOnly = res.filter(x =>
            x.attachmentCategory?.toLowerCase() === 'forms'
          );

          this.documentTypes = formsOnly.map(x => ({
            id: x.attachmentTypeId,
            name: x.attachmentTypeName
          }));

          console.log('Document Types:', this.documentTypes);

        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  getDocumentTypeName(id: number | string): string {

    console.log('Searching Type ID:', id);

    const doc = this.documentTypes.find(
      d => Number(d.id) === Number(id)
    );

    return doc ? doc.name : '';
  }


  loadMyForms() {
    this.adminService.getMyForms(this.employeeCode, this.companyId, this.regionId).subscribe({
      next: (res: any[]) => {
        console.log('Forms API Response:', res);
        this.forms = res.map(x => {
          const allPaths: string[] = x.filePaths || x.FilePaths || [];
          const latestPath = allPaths.length ? [allPaths[allPaths.length - 1]] : [];

          return {
            id: x.id,
            documentType: Number(x.documentTypeId), // IMPORTANT
            name: x.documentName,
            issuedDate: x.issueDate,
            remarks: x.remarks,
            // filePaths: latestPath
            filePaths: x.filePaths || x.FilePaths || []   
          };
        });
      },
      error: (err) => console.error(err)
    });
  }

  uploadFiles(formId: number, fileInput: HTMLInputElement) {

    const files = this.employeeFilesMap[formId];

    if (!files || files.length === 0) {

      Swal.fire({
        icon: 'warning',
        title: 'No Files Selected',
        text: 'Please select files before upload'
      });

      return;
    }

    const formData = new FormData();

    formData.append("Id", formId.toString());
    formData.append("EmployeeCode", this.employeeCode);

    files.forEach(file => {
      formData.append("DocumentFiles", file);
    });

    this.adminService.uploadEmployeeFiles(formData).subscribe({

      next: () => {

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Files uploaded successfully'
        });

        // clear files array
        this.employeeFilesMap[formId] = [];

        // clear chosen file from UI
        fileInput.value = '';

        // reload data if needed
        this.loadMyForms();
      },

      error: (err) => {

        console.error(err);

        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: 'Something went wrong'
        });

      }
    });
  }
  viewDocument(path: string) {
    if (!path || path.trim() === '') {
      Swal.fire('Error', 'File path not found', 'error');
      return;
    }
    
    // Use fileBaseUrl and ensure proper path formatting
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const url = `${environment.fileBaseUrl}${cleanPath}`;
    window.open(url, '_blank');
  }
  onFileSelect(event: any, formId: number) {
    const files = event.target.files;

    if (!this.employeeFilesMap[formId]) {
      this.employeeFilesMap[formId] = [];
    }

    for (let i = 0; i < files.length; i++) {
      this.employeeFilesMap[formId].push(files[i]);
    }
  }
  sortBy(column: string) {

    if (this.sortColumn === column) {

      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';

    } else {

      this.sortColumn = column;
      this.sortDirection = 'asc';

    }

  }
  private getSortedForms() {

    let data = [...this.forms];

    if (this.sortColumn) {

      data.sort((a, b) => {

        let valA = (a[this.sortColumn] || '').toString().toLowerCase();
        let valB = (b[this.sortColumn] || '').toString().toLowerCase();

        if (valA < valB)
          return this.sortDirection === 'asc' ? -1 : 1;

        if (valA > valB)
          return this.sortDirection === 'asc' ? 1 : -1;

        return 0;

      });

    }

    return data;

  }
  pagedForms() {

    const data = this.getSortedForms();

    const start =
      (this.currentPage - 1) * this.pageSize;

    return data.slice(start, start + this.pageSize);

  }
  get totalPages(): number {

    return Math.ceil(
      this.getSortedForms().length / this.pageSize
    ) || 1;

  }
  changePage(page: number) {

    if (page >= 1 && page <= this.totalPages) {

      this.currentPage = page;

    }

  }
  changePageSize(size: number) {

    this.pageSize = size;

    this.currentPage = 1;

  }
}
