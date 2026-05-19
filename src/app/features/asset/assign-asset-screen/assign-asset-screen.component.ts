import { Component } from '@angular/core';
import { AssetService } from '../asset.service';
import { AdminService } from '../../../admin/servies/admin.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-assign-asset-screen',
  standalone: false,
  templateUrl: './assign-asset-screen.component.html',
  styleUrl: './assign-asset-screen.component.css'
})
export class AssignAssetScreenComponent {
  companyId!: number;
  regionId!: number;

  requests: any[] = [];
  assetTypes: any[] = [];

 availableAssets: any[] = [];
companyLogoBase64: string = '';
companyAddress: string = '';
companyName: string = '';

  form: any = {
    requestId: '',
    employeeName: '',
    assetType: '',
    assetId: '',
    assetCode: '',
    assignDate: '',
    returnDate: '',
    remarks: ''
  };

  assignedList: any[] = [];

  constructor(
    private assetService: AssetService,
    private adminService: AdminService
  ) {}
userId!: number;
  ngOnInit(): void {
    this.companyName =
    sessionStorage.getItem("CompanyName") || 'Company';

  this.loadCompanyDetails();
    this.companyId = Number(sessionStorage.getItem('CompanyId'));
    this.regionId = Number(sessionStorage.getItem('RegionId'));
    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    this.userId = Number(sessionStorage.getItem('UserId'));

    this.loadApprovedRequests();
    this.loadAssetTypes();
    this.loadAvailableAssets(); // 🔥 ADD THIS
    this.loadAssignments();
this.form.get('assetCategory')?.valueChanges.subscribe(() => {
  this.loadAssetTypes();   // ✅ reuse same method
});

  }
  loadAssignments() {
  this.assetService
    .getAssignments$(this.companyId, this.regionId)
    .subscribe(res => {
      this.assignedList = res;
    });
}
loadCompanyDetails() {

  const companyId =
    Number(sessionStorage.getItem('CompanyId'));

  this.adminService.getCompanyById(companyId)
    .subscribe({

      next: async (company: any) => {

        this.companyName =
          company?.companyName || 'Company';

        this.companyAddress =
          company?.companyAddress || 'Hyderabad';

        const logo = company?.companyLogo;

        if (logo && logo.trim() !== '') {

          if (logo.startsWith('data:')) {

            this.companyLogoBase64 = logo;

          } else {

            const logoPath =
              logo.replace(/\\/g, '/');

            const fullUrl =
              `${environment.baseurl}/${logoPath}`;

            this.companyLogoBase64 =
              await this.getBase64ImageFromURL(fullUrl);
          }

        } else {

          this.setDefaultLogo();
        }
      },

      error: () => {

        this.setDefaultLogo();
      }
    });
}
setDefaultLogo() {

  const defaultLogo =
    '/assets/images/cor-logo.png';

  this.getBase64ImageFromURL(defaultLogo)
    .then(base64 =>
      this.companyLogoBase64 = base64
    )
    .catch(() =>
      this.companyLogoBase64 = ''
    );
}
getBase64ImageFromURL(url: string): Promise<string> {

  return new Promise((resolve, reject) => {

    const img = new Image();

    img.crossOrigin = 'anonymous';

    img.src = url;

    img.onload = () => {

      const canvas =
        document.createElement('canvas');

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx =
        canvas.getContext('2d');

      ctx?.drawImage(img, 0, 0);

      resolve(
        canvas.toDataURL('image/png')
      );
    };

    img.onerror = err => reject(err);
  });
}
  loadAvailableAssets() {
  this.assetService
    .getAvailableAssets$(this.companyId, this.regionId,this.userId) // ✅ pass userId
    .subscribe(res => {
      this.availableAssets = res;
    });
}
downloadPDF() {

  if (!this.assignedList.length) {

    alert('No records found');
    return;
  }

  const doc =
    new jsPDF('l', 'mm', 'a4');

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  // ================= HEADER =================

  doc.setFontSize(14);

  doc.setFont(
    'helvetica',
    'bold'
  );

  doc.text(
    this.companyName,
    14,
    12
  );

  doc.setFontSize(10);

  doc.setFont(
    'helvetica',
    'normal'
  );

  doc.text(
    `Generated: ${new Date().toLocaleDateString()}`,
    pageWidth - 14,
    12,
    { align: 'right' }
  );

  // ================= LOGO =================

  if (this.companyLogoBase64) {

    doc.addImage(
      this.companyLogoBase64,
      'PNG',
      (pageWidth / 2) - 20,
      5,
      40,
      20
    );
  }

  // ================= LINE =================

  doc.setDrawColor(200);

  doc.line(
    14,
    30,
    pageWidth - 14,
    30
  );

  // ================= TITLE =================

  doc.setFontSize(18);

  doc.setFont(
    'helvetica',
    'bold'
  );

  doc.text(
    'ASSIGNED ASSETS REPORT',
    pageWidth / 2,
    42,
    { align: 'center' }
  );

  // ================= WATERMARK =================

  if (this.companyLogoBase64) {

    doc.saveGraphicsState();

    (doc as any).setGState(
      new (doc as any).GState({
        opacity: 0.08
      })
    );

    doc.addImage(
      this.companyLogoBase64,
      'PNG',
      pageWidth / 2 - 60,
      pageHeight / 2 - 40,
      120,
      80
    );

    doc.restoreGraphicsState();
  }

  // ================= TABLE DATA =================

  const tableData =
    this.assignedList.map((item: any) => [

      item.requestId || '-',
      item.employeeName || '-',
      item.assetType || '-',
      item.assetName || '-',
      item.assetCode || '-',

      item.assignDate
        ? new Date(item.assignDate)
            .toLocaleDateString()
        : '-',

      item.returnDate
        ? new Date(item.returnDate)
            .toLocaleDateString()
        : '-',

      item.remarks || '-'
    ]);

  autoTable(doc, {

    startY: 55,

    head: [[
      'Request ID',
      'Employee',
      'Asset Type',
      'Asset',
      'Asset Code',
      'Assign Date',
      'Return Date',
      'Remarks'
    ]],

    body: tableData,

    theme: 'grid',

    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: 'center',
      valign: 'middle'
    },

    headStyles: {
      fillColor: [200, 0, 0],
      textColor: 255,
      fontStyle: 'bold'
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },

    didDrawPage: () => {

      doc.setFontSize(9);

      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  });

  doc.save(
    'Assigned_Assets_Report.pdf'
  );
}
downloadExcel(): void {

  const exportData = this.assignedList.map((item: any) => ({
    'Request ID': item.requestId,
    'Employee': item.employeeName,
    'Asset Type': item.assetType,
    'Asset': item.assetName,
    'Code': item.assetCode,
    'Assign Date': item.assignDate,
    'Return Date': item.returnDate,
    'Remarks': item.remarks
  }));

  const worksheet: XLSX.WorkSheet =
    XLSX.utils.json_to_sheet(exportData);

  const workbook: XLSX.WorkBook = {
    Sheets: { 'Assigned Assets': worksheet },
    SheetNames: ['Assigned Assets']
  };

  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  this.saveExcelFile(excelBuffer, 'Assigned_Assets_Report');
}
saveExcelFile(buffer: any, fileName: string): void {

  const data: Blob = new Blob(
    [buffer],
    {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    }
  );

  FileSaver.saveAs(
    data,
    `${fileName}.xlsx`
  );
}

  // ============================================================
  // 🔹 LOAD APPROVED REQUESTS
  // ============================================================
  loadApprovedRequests() {
    this.assetService
      .getApprovedRequests(this.companyId, this.regionId)
      .subscribe(res => {
        this.requests = res;
      });
  }

  // ============================================================
  // 🔹 LOAD ASSET TYPES (FOR NAME)
  // ============================================================
  // loadAssetTypes() {
  //   this.adminService
  //     .getAssetTypesByCompanyRegion(this.companyId, this.regionId )
  //     .subscribe((res: any) => {
  //       this.assetTypes = res.data || res;
  //     });
  // }

//   loadAssetTypes() {

//   const categoryId = this.form.get('assetCategory')?.value;

//   if (!categoryId) {
//     this.assetTypes = [];
//     return;
//   }

//   this.adminService.getAssetTypesByCompanyRegion(
//     this.companyId,
//     this.regionId,
//     categoryId   // ✅ ADD
//   ).subscribe((res: any) => {

//     this.assetTypes = res.data || res;

//   });
// }
loadAssetTypes() {
  this.adminService.getAssetTypesByCompanyRegion(
    this.companyId,
    this.regionId,
    0   // ✅ get all types
  ).subscribe((res: any) => {
    this.assetTypes = res.data || res;
  });
}
getAssetTypeName(id?: number): string {
  if (!id || this.assetTypes.length === 0) return '-'; // ✅ ADD
  return this.assetTypes.find(x => x.assetTypeId === id)?.assetTypeName ?? '-';
}

  // ============================================================
  // 🔹 ON REQUEST CHANGE
  // ============================================================
 onRequestChange() {
  const selected = this.requests.find(
    r => r.requestID == this.form.requestId
  );

  if (selected) {
    this.form.employeeName = selected.employeeName;

    // ✅ Safe mapping
    this.form.assetType = this.getAssetTypeName(selected.assetType);
  }
}

  // ============================================================
  // 🔹 ON ASSET CHANGE
  // ============================================================
 onAssetChange() {
  const selected = this.availableAssets.find(
    a => a.assetID == this.form.assetId
  );

  if (selected) {
    this.form.assetCode = selected.assetCode;
  }
}


  // ============================================================
  // 🔹 ASSIGN
  // ============================================================
assignAsset() {

  if (!this.form.requestId || !this.form.assetId) {
    alert('Fill required fields');
    return;
  }

  const payload = {
    companyId: this.companyId,
    regionId: this.regionId,
    requestId: this.form.requestId,
    assetId: this.form.assetId,
    employeeName: this.form.employeeName,
    assetType: this.form.assetType,
    assetName: this.availableAssets.find(a => a.assetID == this.form.assetId)?.assetName,
    assetCode: this.form.assetCode,
    assignDate: this.form.assignDate,
    returnDate: this.form.returnDate,
    remarks: this.form.remarks
  };

  this.assetService.assignAsset$(payload).subscribe(() => {

    alert('Saved Successfully ✅');

    // 🔥 Refresh everything
    this.loadAssignments();
    this.loadApprovedRequests(); // 🔥 removes used RequestID
    this.loadAvailableAssets();

    this.resetForm();
  });
}


  resetForm() {
    this.form = {};
  }
}
