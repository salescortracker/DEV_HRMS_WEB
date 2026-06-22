import { Component, EventEmitter, Input, Output } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { AdminService } from '../../servies/admin.service';

@Component({
  selector: 'app-common-upload',
  standalone: false,
  templateUrl: './common-upload.component.html',
  styleUrl: './common-upload.component.css'
})
export class CommonUploadComponent {
  @Input() model: { name: string; structure: any } | null = null;
  @Input() visible = false;
  @Input() screenName = 'Master Data';
  selectedFile: File | null = null;
  fileData: any[] = [];
  @Output() uploadCompleted = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  constructor(private adminService: AdminService) {}

  closeDialog() {
    this.selectedFile = null;
    this.fileData = [];
    this.visible = false;
    this.close.emit();
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      this.selectedFile = file;
      this.readExcel(file);
    } else {
      alert('Invalid file or file too large (max 5 MB).');
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      this.selectedFile = file;
      this.readExcel(file);
    }
  }

  readExcel(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      this.fileData = XLSX.utils.sheet_to_json(sheet, {
  raw: false,
  dateNF: 'dd-mm-yyyy'
});
      console.log('Excel Data:', this.fileData);
    };
    reader.readAsArrayBuffer(file);
  }

  removeFile() {
    this.selectedFile = null;
    this.fileData = [];
  }

  upload() {
    if (this.fileData.length === 0) {
      alert('No data found in the Excel file.');
      return;
    }

    if (this.screenName === 'Company') {
      this.validateCompanyUpload();
      return;
    }

    // Call backend API to insert data
  // this.adminService.bulkInsertData('Company', this.fileData)
  this.adminService.bulkInsertData(this.screenName, this.fileData)
  .subscribe({
  next: (res: any) => {
    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Upload Complete',
        text: res.message,
        confirmButtonColor: '#007bff'
      })
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Upload Completed with Warnings',
        text: res.message || 'Some records could not be processed.',
        confirmButtonColor: '#f39c12'
      });
    }

      

      this.selectedFile = null;
      this.fileData = [];
      this.visible = false;
      this.uploadCompleted.emit();
      this.close.emit();
  },
error: (err) => {
  console.error('Error while uploading:', err);

  if (err?.error?.failedRows?.length > 0) {

    Swal.fire({
      icon: 'error',
      title: 'Validation Errors',
      html: err.error.failedRows.join('<br>'),
      confirmButtonColor: '#dc3545'
    });

  } else {

    const message =
      err?.error?.message ||
      err?.message ||
      'Upload failed. Please contact IT Administrator.';

    Swal.fire({
      icon: 'error',
      title: 'Upload Failed',
      text: message,
      confirmButtonColor: '#dc3545'
    });

  }
}
});


  }

  private validateCompanyUpload(): void {
    // const uploadedRows = this.fileData.map((row: any) => ({
    //   ...row,
    //   companyCode: String(row.companyCode ?? row.CompanyCode ?? '').trim(),
    //   companyName: String(row.companyName ?? row.CompanyName ?? '').trim()
    // }));
    const userId = Number(sessionStorage.getItem('UserId') || 0);

    const uploadedRows = this.fileData.map((row: any) => ({
  ...row,
  companyCode: String(row.companyCode ?? row.CompanyCode ?? '').trim(),
  email: String(row.email ?? row.Email ?? '').trim(),
    userId: userId,
    CompanyContact: row.CompanyContact  ?? '',
  CompanyEmail: row.CompanyEmail  ?? '',

}));

    const duplicateInFile = uploadedRows.find((row, index, rows) =>
      row.companyCode && rows.findIndex(other => other.companyCode.toLowerCase() === row.companyCode.toLowerCase()) !== index
    );

    if (duplicateInFile) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Company Code in File',
        text: `Company Code ${duplicateInFile.companyCode} appears more than once in the uploaded file.`
      });
      return;
    }
const duplicateCode = uploadedRows.find((row, index, rows) =>
  row.companyCode &&
  rows.findIndex(x =>
    x.companyCode.toLowerCase() === row.companyCode.toLowerCase()
  ) !== index
);

if (duplicateCode) {
  Swal.fire({
    icon: 'error',
    title: 'Duplicate Company Code',
    text: `Company Code ${duplicateCode.companyCode} appears more than once in the uploaded file.`
  });
  return;
}
    // const userId = Number(sessionStorage.getItem('UserId') || 0);
    this.adminService.getCompanies(null, userId).subscribe({
      next: (res: any) => {
        // const existingCompanies = (res?.data ?? res ?? []).map((c: any) => ({
        //   companyCode: String(c.companyCode ?? c.CompanyCode ?? '').trim(),
        //   companyName: String(c.companyName ?? c.CompanyName ?? '').trim()
        // }));
const existingCompanies = (res?.data ?? res ?? []).map((c: any) => ({
  companyCode: String(c.companyCode ?? c.CompanyCode ?? '').trim(),
   email: String(c.companyEmail ?? c.CompanyEmail ?? '').trim()
}));
        // const duplicateExisting = uploadedRows.find(row =>
        //   row.companyCode && existingCompanies.some((existing: { companyCode: string }) =>
        //     existing.companyCode.toLowerCase() === row.companyCode.toLowerCase()
        //   )
        // );

        // if (duplicateExisting) {
        //   Swal.fire({
        //     icon: 'error',
        //     title: 'Duplicate Company Code',
        //     text: `Company Code ${duplicateExisting.companyCode} already exists. Please use a unique code.`
        //   });
        //   return;
        // }

        const duplicateExistingCode = uploadedRows.find(row =>
  existingCompanies.some((existing: any) =>
    existing.companyCode.toLowerCase() === row.companyCode.toLowerCase()
  )
);

if (duplicateExistingCode) {
  Swal.fire({
    icon: 'error',
    title: 'Duplicate Company Code',
    text: `Company Code ${duplicateExistingCode.companyCode} already exists.`
  });
  return;
}
const duplicateEmail = uploadedRows.find((row, index, rows) =>
  row.email &&
  rows.findIndex(x =>
    x.email.toLowerCase() === row.email.toLowerCase()
  ) !== index
);

if (duplicateEmail) {
  Swal.fire({
    icon: 'error',
    title: 'Duplicate Email',
    text: `Email ${duplicateEmail.email} appears more than once in the uploaded file.`
  });
  return;
}
        this.adminService.bulkInsertData('Company', uploadedRows).subscribe({
          next: (bulkRes: any) => {
            if (bulkRes.success) {
              
              Swal.fire({
                icon: 'success',
                title: 'Upload Complete',
                text: bulkRes.message,
                confirmButtonColor: '#007bff'

                
              });
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'Upload Completed with Warnings',
                text: bulkRes.message || 'Some records could not be processed.',
                confirmButtonColor: '#f39c12'
              });
            }

            this.selectedFile = null;
            this.fileData = [];
            this.visible = false;
            this.uploadCompleted.emit();
            this.close.emit();
          },
          error: (err) => {
            console.error('Error while uploading:', err);
            const message =
              err?.error?.message ||
              err?.message ||
              'Upload failed. Please contact IT Administrator.';

            Swal.fire({
              icon: 'error',
              title: 'Upload Failed',
              text: message,
              confirmButtonColor: '#dc3545'
            });
          }
        });
      },
      error: (err) => {
        console.error('Failed to load existing companies for validation:', err);
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: 'Could not validate existing company codes. Please try again.'
        });
      }
    });
  }

  /** Download sample Excel template */
downloadTemplate() {
  console.log('Model:', this.model);
  
  if (!this.model) {
    Swal.fire('Error', 'Model data missing or invalid!', 'error');
    return;
  }

  try {
    // Extract structure from model object or use directly if array
    let templateData: any[] = [];
    
    if (Array.isArray(this.model)) {
      templateData = this.model;
    } else if (this.model.structure && typeof this.model.structure === 'object') {
      // Model is an object with structure property - extract it
      templateData = [this.model.structure];
    } else if (typeof this.model === 'object') {
      // Use model directly as single row
      templateData = [this.model];
    }

    if (templateData.length === 0) {
      Swal.fire('Error', 'Model data missing or invalid!', 'error');
      return;
    }

    // Convert model data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Create workbook and append sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    // File name based on screenName or fallback
    const fileName = this.screenName
      ? `${this.screenName}_Template.xlsx`
      : 'Template.xlsx';

    // Download Excel
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Error generating Excel template:', error);
    Swal.fire('Error', 'Failed to generate template file.', 'error');
  }
}

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) return;

    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      this.fileData = XLSX.utils.sheet_to_json(ws, { raw: true });
    };
    reader.readAsBinaryString(file);
  }
}
