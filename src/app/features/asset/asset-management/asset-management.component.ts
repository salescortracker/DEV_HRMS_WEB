import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asset-management',
  standalone: false,
  templateUrl: './asset-management.component.html',
  styleUrl: './asset-management.component.css'
})
export class AssetManagementComponent implements OnInit {

  canViewAddAsset = false;
  canViewAssetRequests = false;
  canViewAssetApproval = false;
  canViewAssignAssetScreen = false;
  canViewMyAssets = false;
  canViewAssetReports = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadTabPermissions();

    // if (this.canViewAddAsset) {
    //   this.router.navigate(['/asset/add-asset']);
    // }
    // else if (this.canViewAssetRequests) {
    //   this.router.navigate(['/asset/asset-request']);
    // }
    // else if (this.canViewAssetApproval) {
    //   this.router.navigate(['/asset/asset-approval']);
    // }
    // else if (this.canViewAssignAssetScreen) {
    //   this.router.navigate(['/asset/assign-asset']);
    // }
    // else if (this.canViewMyAssets) {
    //   this.router.navigate(['/asset/my-assets']);
    // }
    // else if (this.canViewAssetReports) {
    //   this.router.navigate(['/asset/asset-reports']);
    // }
  }

  loadTabPermissions(): void {

    const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

    const addasset = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'add asset'
    );

    const assignasset = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'assign asset'
    );

    const assetrequests = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'asset request'
    );

    const assetapproval = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'asset approval'
    );

    const myassets = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'my asset'
    );

    const assetreports = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'asset reports'
    );

    this.canViewAddAsset = addasset?.canView ?? false;
    this.canViewAssetRequests = assetrequests?.canView ?? false;
    this.canViewAssetApproval = assetapproval?.canView ?? false;
    this.canViewAssignAssetScreen = assignasset?.canView ?? false;
    this.canViewMyAssets = myassets?.canView ?? false;
    this.canViewAssetReports = assetreports?.canView ?? false;
  }
}