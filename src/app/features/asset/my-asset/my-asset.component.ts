import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { AssetDto, AssetService, AssetStatus } from '../asset.service';
@Component({
  selector: 'app-my-asset',
  standalone: false,
  templateUrl: './my-asset.component.html',
  styleUrl: './my-asset.component.css'
})
export class MyAssetComponent {
 assets: AssetDto[] = [];
  filteredAssets: AssetDto[] = [];
  statuses: AssetStatus[] = [];
  userId!: number;
  

  // ✅ FILTER MODEL
  filter = {
    assetName: '',
    location: '',
    assetStatusId: '',
    currencyCode: ''
  };

  constructor(private assetService: AssetService) {}

  ngOnInit(): void {
     const userId = sessionStorage.getItem("UserId");

  if (!userId) {
    console.error("UserId not found in session");
    return;
  }

  this.userId = Number(userId);

    this.loadUserFromSession();
    this.loadStatuses();
    this.loadMyAssets();
  }

  /* =======================
     LOAD USER
  ======================= */
  private loadUserFromSession(): void {
    const userJson = sessionStorage.getItem('currentUser');

    if (!userJson) {
      Swal.fire('Error', 'User not logged in', 'error');
      return;
    }

    const user = JSON.parse(userJson);
    this.userId = user.userId;

    if (!this.userId) {
      Swal.fire('Error', 'Invalid user session', 'error');
    }
  }

  /* =======================
     LOAD ASSETS
  ======================= */
 loadMyAssets(): void {

  this.assetService
    .getAssetsByUserId$(this.userId)
    .subscribe({
      next: (data) => {

        this.assets = data;
        this.filteredAssets = [...data];

      },
      error: (err) => {
        console.error("Error loading assets", err);
      }
    });

}

  /* =======================
     LOAD STATUSES
  ======================= */
  loadStatuses(): void {
    this.assetService.getAssetStatuses$().subscribe({
      next: (res) => this.statuses = res,
      error: () =>
        Swal.fire('Error', 'Failed to load statuses', 'error')
    });
  }

  /* =======================
     FILTER LOGIC
  ======================= */
  applyFilters(): void {
    this.filteredAssets = this.assets.filter(asset =>
      (!this.filter.assetName ||
        asset.assetName?.toLowerCase().includes(this.filter.assetName.toLowerCase())) &&

      (!this.filter.location ||
        asset.assetLocation?.toLowerCase().includes(this.filter.location.toLowerCase())) &&

      (!this.filter.assetStatusId ||
        asset.assetStatusID === +this.filter.assetStatusId) &&

      (!this.filter.currencyCode ||
        asset.currencyCode === this.filter.currencyCode)
    );
  }

  clearFilters(): void {
    this.filter = {
      assetName: '',
      location: '',
      assetStatusId: '',
      currencyCode: ''
    };
    this.filteredAssets = this.assets;
  }

  /* =======================
     HELPERS
  ======================= */
  getStatusName(assetStatusID: number): string {
    const status = this.statuses.find(
      s => s.assetStatusId === assetStatusID
    );
    return status ? status.assetStatusName : '';
  }
}
