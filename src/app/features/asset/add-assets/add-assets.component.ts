import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, shareReplay } from 'rxjs';
import { AssetDto, AssetStatus, AssetService, EmployeeDto } from '../asset.service';
import Swal from 'sweetalert2';
import { AdminService } from '../../../admin/servies/admin.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-add-assets',
  standalone: false,
  templateUrl: './add-assets.component.html',
  styleUrl: './add-assets.component.css'
})
export class AddAssetsComponent {
  assetForm!: FormGroup;
  assets: AssetDto[] = [];
  employees: EmployeeDto[] = [];
  assetStatuses: AssetStatus[] = [];
  assetTypes: any[] = [];

  currencies: any[] = [];
  allAssetTypes: any[] = []; 
  assetCategories: any[] = [];
  isEditMode = false;
companyLogoBase64: string = '';
companyAddress: string = '';
companyName: string = '';
  companyId!: number;
  regionId!: number;
  private userId!: number;
  loggedInUserName: string = '';
  // ================= SORTING =================
  sortColumn: keyof AssetDto | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // ================= PAGINATION =================
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50, 100];

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private service: AdminService
  ) { }

//   ngOnInit(): void {
//     this.companyName = sessionStorage.getItem("CompanyName") || 'My Company';
// this.loadCompanyDetails();
//     this.loadSessionData();
//     this.loadAllAssetTypesForDisplay();
//     this.initForm();
//     //this.loadAssetTypes();
//     this.loadCurrency();
//     this.loadAssetCategories();
//     this.assetForm.patchValue({
//       userID: this.userId
//     });
// this.assetForm.get('assetCategory')?.valueChanges.subscribe(() => {
//   this.loadAssetTypes();   // ✅ reuse same method
// });
//     this.loadEmployeesAndStatuses(); // load employees & statuses first
//   }
ngOnInit(): void {

  this.loadSessionData();

  this.companyName =
    sessionStorage.getItem("CompanyName") || 'My Company';

  this.loadCompanyDetails();

  this.initForm();

  this.loadCurrency();

  this.loadAssetCategories();

  // Load ALL asset types for table display
  this.loadAllAssetTypesForDisplay();

  this.assetForm.patchValue({
    userID: this.userId
  });

  this.assetForm.get('assetCategory')
    ?.valueChanges.subscribe(() => {

      this.loadAssetTypes();
    });

  this.loadEmployeesAndStatuses();
}
  loadCompanyDetails() {

  const companyId = Number(sessionStorage.getItem('CompanyId'));

  this.service.getCompanyById(companyId).subscribe({
    next: async (company: any) => {

      this.companyName = company?.companyName || 'Company';
      this.companyAddress = company?.companyAddress || 'Hyderabad';

      const logo = company?.companyLogo;

      if (logo && logo.trim() !== '') {

        if (logo.startsWith('data:')) {
          this.companyLogoBase64 = logo;
        } else {

          const logoPath = logo.replace(/\\/g, '/');
          const fullUrl = `${environment.baseurl}/${logoPath}`;

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

  const defaultLogo = '/assets/images/cor-logo.png';

  this.getBase64ImageFromURL(defaultLogo)
    .then(base64 => this.companyLogoBase64 = base64)
    .catch(() => this.companyLogoBase64 = '');
}

getBase64ImageFromURL(url: string): Promise<string> {

  return new Promise((resolve, reject) => {

    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {

      const canvas = document.createElement('canvas');

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');

      ctx?.drawImage(img, 0, 0);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = err => reject(err);
  });
}
//   loadAllAssetTypesForDisplay() {
//   this.service.getAssetTypesByCompanyRegion(
//     this.companyId,
//     this.regionId,
//     0   // get all types
//   ).subscribe((res: any) => {
//     this.assetTypes = res.data || res;
//   });
// }
loadAllAssetTypesForDisplay() {

  this.service.getAssetTypesByCompanyRegion(
    this.companyId,
    this.regionId,
    0
  ).subscribe((res: any) => {

    this.allAssetTypes = res.data || res;

    console.log('ALL TYPES', this.allAssetTypes);
  });
}
  loadCurrency() {
    this.service.getCurrenciesByCompanyRegion(
      this.companyId,
      this.regionId

    ).subscribe((res: any) => {
      this.currencies = res.data || res;
    });
  }
downloadPDF() {

  if (!this.assets.length) {

    Swal.fire(
      "No Data",
      "No asset records to export",
      "warning"
    );

    return;
  }

  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ================= HEADER =================

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");

  doc.text(this.companyName, 14, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

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

  doc.line(14, 30, pageWidth - 14, 30);

  // ================= TITLE =================

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");

  doc.text(
    "ASSET REPORT",
    pageWidth / 2,
    42,
    { align: 'center' }
  );

  // ================= WATERMARK =================

  if (this.companyLogoBase64) {

    doc.saveGraphicsState();

    (doc as any).setGState(
      new (doc as any).GState({ opacity: 0.08 })
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

  const tableData = this.assets.map(item => [

    item.assetName || '-',
    item.assetCode || '-',
    this.getAssetCategoryName(item.assetCategory) || '-',
    this.getAssetTypeName(item.assetType) || '-',
    item.assetLocation || '-',
    `${item.currencyCode || '-'}  ${item.assetCost || '-'}`,
    item.assetModel || '-',
    item.purchaseOrder || '-',
    this.getStatusName(item.assetStatusID) || '-'
  ]);

  autoTable(doc, {

    startY: 55,

    head: [[
      'Asset Name',
      'Asset Code',
      'Category',
      'Type',
      'Location',
      'Cost',
      'Model',
      'PO',
      'Status'
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

    didParseCell: (data) => {

      if (data.column.index === 8 &&
          data.cell.section === 'body') {

        const status =
          (data.cell.raw || '')
          .toString()
          .toLowerCase();

        if (status.includes('active')) {

          data.cell.styles.textColor = [0, 128, 0];
          data.cell.styles.fontStyle = 'bold';
        }

        else if (status.includes('inactive')) {

          data.cell.styles.textColor = [255, 0, 0];
          data.cell.styles.fontStyle = 'bold';
        }
      }
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

  doc.save('Asset_Report.pdf');
}
downloadExcel() {

  if (!this.assets.length) {

    Swal.fire(
      "No Data",
      "No asset records to export",
      "warning"
    );

    return;
  }

  const exportData = this.assets.map(item => ({

    AssetName: item.assetName,
    AssetCode: item.assetCode,
    Category: this.getAssetCategoryName(item.assetCategory),
    Type: this.getAssetTypeName(item.assetType),
    Location: item.assetLocation,
    Cost: `${item.currencyCode} ${item.assetCost}`,
    Model: item.assetModel,
    PurchaseOrder: item.purchaseOrder,
    WarrantyStart:
      item.warrantyStartDate
        ? new Date(item.warrantyStartDate).toLocaleDateString()
        : '',

    WarrantyEnd:
      item.warrantyEndDate
        ? new Date(item.warrantyEndDate).toLocaleDateString()
        : '',

    ReturnDate:
      item.assetReturnDate
        ? new Date(item.assetReturnDate).toLocaleDateString()
        : '',

    Status: this.getStatusName(item.assetStatusID)
  }));

  const worksheet: XLSX.WorkSheet =
    XLSX.utils.json_to_sheet(exportData);

  const workbook: XLSX.WorkBook = {

    Sheets: {
      'Asset Report': worksheet
    },

    SheetNames: ['Asset Report']
  };

  const excelBuffer: any = XLSX.write(workbook, {

    bookType: 'xlsx',
    type: 'array'
  });

  const data: Blob = new Blob(
    [excelBuffer],
    {
      type: 'application/octet-stream'
    }
  );

  FileSaver.saveAs(
    data,
    'Asset_Report.xlsx'
  );
}
// loadAssetTypes() {
//   const categoryId = this.assetForm.get('assetCategory')?.value;

//   if (!categoryId) {
//     this.assetTypes = [];   // ✅ clear dropdown
//     return;
//   }

//   this.service.getAssetTypesByCompanyRegion(
//     this.companyId,
//     this.regionId,
//     categoryId
//   ).subscribe((res: any) => {
//     this.assetTypes = res.data || res;
//   });
// }
loadAssetTypes() {

  const categoryId =
    this.assetForm.get('assetCategory')?.value;

  if (!categoryId) {

    this.assetTypes = [];
    return;
  }

  this.service.getAssetTypesByCompanyRegion(
    this.companyId,
    this.regionId,
    categoryId
  ).subscribe((res: any) => {

    this.assetTypes = res.data || res;
  });
}
  loadAssetCategories() {
    this.service.getAssetCategoriesByCompanyRegion(
      this.companyId,
      this.regionId
    ).subscribe((res: any) => {
      this.assetCategories = res.data || res;
    });
  }

  // ================= LOAD EMPLOYEES & STATUSES =================
  private loadEmployeesAndStatuses(): void {
    // Load employees
    this.assetService.getAllEmployees$().subscribe(empRes => {
      this.employees = empRes;

      // Load statuses after employees
      this.assetService.getAssetStatuses$(this.companyId, this.regionId).subscribe(statusRes => {
        this.assetStatuses = statusRes;

        // Finally load assets
        this.loadAssets();
      });
    });
  }

  // ================= SESSION =================
  // private loadSessionData(): void {
  //   this.companyId = Number(sessionStorage.getItem('CompanyId'));
  //   this.regionId = Number(sessionStorage.getItem('RegionId'));
  //   const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  //   this.userId = user.userId;
  // }
  private loadSessionData(): void {

    this.companyId = Number(sessionStorage.getItem('CompanyId'));
    this.regionId = Number(sessionStorage.getItem('RegionId'));

    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

    this.userId = user.userId;
    this.loggedInUserName = user.fullName;

  }

  // ================= FORM =================
  private initForm(): void {
    this.assetForm = this.fb.group(
      {
        assetID: [null],
        userID: [this.userId],
        employeeName: [this.loggedInUserName],
        assetName: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/^[a-zA-Z0-9\-\/\s]+$/)]],
        assetCode: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9]+$/)]],
        assetType: [null, Validators.required],
        assetCategory: [null],
        assetLocation: ['', [Validators.required, Validators.maxLength(100)]],
        assetCost: [0, [Validators.required, Validators.min(1)]],
        currencyCode: ['INR', Validators.required],
        assetDescription: ['', Validators.maxLength(500)],
        assetModel: ['', Validators.maxLength(100)],
        purchaseOrder: ['', Validators.maxLength(100)],
        warrantyStartDate: [null],
        warrantyEndDate: [null],
        assetReturnDate: [null],
        reportingTo: [null],
        assetStatusID: [null, Validators.required]
      },
      {
        validators: [this.warrantyDateValidator, this.returnDateValidator]
      }
    );
  }

  // ================= CUSTOM VALIDATORS =================
  private warrantyDateValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('warrantyStartDate')?.value;
    const end = group.get('warrantyEndDate')?.value;
    if (start && end && new Date(start) > new Date(end)) return { warrantyDateInvalid: true };
    return null;
  }

  private returnDateValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('warrantyStartDate')?.value;
    const returnDate = group.get('assetReturnDate')?.value;
    if (start && returnDate && new Date(returnDate) < new Date(start)) return { returnDateInvalid: true };
    return null;
  }

  // ================= LOAD ASSETS =================
  // private loadAssets(): void {
  //   this.assetService.getAllAssets$().subscribe(res => {
  //     // Map employee names and asset status names
  //     this.assets = res.map(a => ({
  //       ...a,
  //       employeeName: this.employees.find(e => e.userId === a.userID)?.fullName ?? '',
  //       assetStatusName: this.assetStatuses.find(s => s.assetStatusId === a.assetStatusID)?.assetStatusName ?? ''
  //     }));
  //     this.currentPage = 1;
  //   });
  // }
  private loadAssets(): void {

   // const loggedUserId = Number(sessionStorage.getItem('UserId'));
   const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
const loggedUserId = user.userId;

    this.assetService.getAllAssets$().subscribe(res => {

      const userAssets = res.filter(a => a.userID === loggedUserId);

      this.assets = userAssets.map((a: any) => ({

  ...a,

  assetType: a.assetType || a.assetTypeId,
  assetCategory: a.assetCategory || a.assetCategoryId,

  employeeName:
    this.employees.find(
      e => e.userId === a.userID
    )?.fullName ?? '',

  assetStatusName:
    this.assetStatuses.find(
      s => s.assetStatusId === a.assetStatusID
    )?.assetStatusName ?? ''

}));

      this.currentPage = 1;

    });

  }

  // ================= GET STATUS NAME (OPTIONAL) =================
  getStatusName(id: number): string {
    return this.assetStatuses.find(s => s.assetStatusId === id)?.assetStatusName ?? '-';
  }

  // ================= SUBMIT =================
  submit(): void {
    if (this.assetForm.invalid) {
      this.assetForm.markAllAsTouched();
      return;
    }

    const v = this.assetForm.value;
    const payload: AssetDto = {
      assetID: this.isEditMode ? v.assetID : undefined,
      companyID: this.companyId,
      regionID: this.regionId,
      userID: this.userId,
      employeeName: this.loggedInUserName,
      assetName: v.assetName,
      assetCode: v.assetCode,
      assetType: v.assetType,          // ✅ ADD THIS
      assetCategory: v.assetCategory,  // ✅ ADD THIS
      assetLocation: v.assetLocation,
      assetCost: v.assetCost,
      currencyCode: v.currencyCode,
      assetDescription: v.assetDescription,
      assetModel: v.assetModel,
      reportingTo: Number(sessionStorage.getItem("reportingManagerId")),
      purchaseOrder: v.purchaseOrder,
      assetStatusID: v.assetStatusID,
      warrantyStartDate: v.warrantyStartDate ? new Date(v.warrantyStartDate).toISOString() : undefined,
      warrantyEndDate: v.warrantyEndDate ? new Date(v.warrantyEndDate).toISOString() : undefined,
      assetReturnDate: v.assetReturnDate ? new Date(v.assetReturnDate).toISOString() : undefined
    };

    if (this.isEditMode) {
      this.assetService.updateAsset$(payload).subscribe(() => {
        Swal.fire('Updated', 'Asset updated successfully', 'success');
        this.afterSave();
      });
    } else {
      this.assetService.createAsset$(payload).subscribe(() => {
        Swal.fire('Created', 'Asset created successfully', 'success');
        this.afterSave();
      });
    }
  }

  private afterSave(): void {
    this.resetForm();
    this.loadAssets();
  }
// getAssetTypeName(id?: number): string {
//   if (!id || this.assetTypes.length === 0) return '-'; // ✅ ADD
//   return this.assetTypes.find(x => x.assetTypeId === id)?.assetTypeName ?? '-';
// }
getAssetTypeName(id?: number): string {

  if (!id) return '-';

  const type = this.allAssetTypes.find(
    x => Number(x.assetTypeId) === Number(id)
  );

  return type?.assetTypeName || '-';
}
// getAssetCategoryName(id?: number): string {
//   return this.assetCategories.find(x => x.assetCategoryId === id)?.assetCategoryName ?? '-';
// }
getAssetCategoryName(id?: number): string {

  if (!id) return '-';

  const category = this.assetCategories.find(
    x => Number(x.assetCategoryId) === Number(id)
  );

  return category?.assetCategoryName || '-';
}



  // ================= EDIT / DELETE =================
  edit(asset: AssetDto): void {
    this.isEditMode = true;
    this.assetForm.patchValue({
      ...asset,
      assetType: asset.assetType,          // ✅ ADD
      assetCategory: asset.assetCategory,  // ✅ ADD
      userID: this.employees.find(e => e.fullName === asset.employeeName)?.userId,
      warrantyStartDate: asset.warrantyStartDate?.split('T')[0] ?? null,
      warrantyEndDate: asset.warrantyEndDate?.split('T')[0] ?? null,
      assetReturnDate: asset.assetReturnDate?.split('T')[0] ?? null
    });
  }

  delete(assetId: number): void {
    Swal.fire({
      title: 'Are you sure you want to delete this asset record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then(result => {
      if (result.isConfirmed) {
        this.assetService.deleteAsset$(assetId).subscribe(() => {
          Swal.fire('Deleted', 'Asset deleted successfully', 'success');
          this.loadAssets();
        });
      }
    });
  }

  resetForm(): void {
    this.isEditMode = false;
    this.assetForm.reset({
      assetID: null,
      assetCost: 0,
      currencyCode: 'INR',
      assetStatusID: null
    });
  }

  // ================= TEMPLATE HELPERS =================
  get f() { return this.assetForm.controls; }

  sortBy(column: keyof AssetDto): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortedAssets(): AssetDto[] {
    let data = [...this.assets];
    if (this.sortColumn) {
      data.sort((a: any, b: any) => {
        const valA = a[this.sortColumn!] ?? '';
        const valB = b[this.sortColumn!] ?? '';
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }

  filteredAssets(): AssetDto[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.getSortedAssets().slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.assets.length / this.pageSize);
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }
}
