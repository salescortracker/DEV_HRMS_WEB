import { Component, OnInit } from '@angular/core';
import { AdminService, Company, GeoLocation, LateLoginPolicy, Region } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-geo-location',
  standalone: false,
  templateUrl: './geo-location.component.html',
  styleUrl: './geo-location.component.css'
})
export class GeoLocationComponent {
  locations: GeoLocation[] = [];
  location: GeoLocation = this.getEmpty();

  companies: Company[] = [];
  regions: Region[] = [];
  filteredRegions: Region[] = [];

  isEditMode = false;
  userId = Number(sessionStorage.getItem('UserId') || 0);

  constructor(
    private service: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadRegions();
    this.loadLocations();
  }

  getEmpty(): GeoLocation {
    return {
      geoLocationId: 0,
      companyId: 0,
      regionId: 0,
      userId: this.userId,
      locationName: '',
      address: '',
      latitude: 0,
      longitude: 0,
      radius: 0,
      isActive: true
    };
  }

  loadCompanies() {
    this.service.getCompanies(null, this.userId).subscribe(res => {
      this.companies = res.filter((c: any) => c.isActive);
    });
  }

  loadRegions() {
    this.service.getRegions(null, this.userId).subscribe(res => {
      this.regions = res.filter((r: any) => r.isActive);
    });
  }

  onCompanyChange() {
    this.filteredRegions = this.regions.filter(r =>
      Number(r.companyID) === Number(this.location.companyId)
    );
    this.location.regionId = 0;
  }

loadLocations() {
  this.spinner.show();

  this.service.getGeoLocations(this.userId).subscribe({
    next: (res: any) => {
      this.locations = res || [];
      this.spinner.hide();
    },
    error: () => this.spinner.hide()
  });
}
onSubmit() {

  // Trim text fields
  this.location.locationName = this.location.locationName?.trim();
  this.location.address = this.location.address?.trim();

  // Company
  if (!this.location.companyId) {
    Swal.fire('Validation', 'Please select Company.', 'warning');
    return;
  }

  // Region
  if (!this.location.regionId) {
    Swal.fire('Validation', 'Please select Region.', 'warning');
    return;
  }

  // Location Name
  if (!this.location.locationName) {
    Swal.fire('Validation', 'Location Name is required.', 'warning');
    return;
  }

  // Address
  if (!this.location.address) {
    Swal.fire('Validation', 'Address is required.', 'warning');
    return;
  }

  // Latitude
  if (
  this.location.latitude === null ||
  this.location.latitude === undefined ||
  isNaN(this.location.latitude) ||
  this.location.latitude === 0
) {
  Swal.fire('Validation', 'Latitude is required.', 'warning');
  return;
}

  // Longitude
  if (
  this.location.longitude === null ||
  this.location.longitude === undefined ||
  isNaN(this.location.longitude) ||
  this.location.longitude === 0
) {
  Swal.fire('Validation', 'Longitude is required.', 'warning');
  return;
}

  // Radius
  if (
    this.location.radius === null ||
    this.location.radius === undefined ||
    this.location.radius <= 0
  ) {
    Swal.fire('Validation', 'Radius is required.', 'warning');
    return;
  }

  this.location.userId = this.userId;

  this.spinner.show();

  const req = this.isEditMode
    ? this.service.updateGeoLocation(this.location.geoLocationId, this.location)
    : this.service.createGeoLocation(this.location);

  req.subscribe({
    next: () => {

      Swal.fire(
        'Success',
        this.isEditMode
          ? 'Geo Location updated successfully.'
          : 'Geo Location added successfully.',
        'success'
      );

      this.loadLocations();
      this.resetForm();
      this.spinner.hide();
    },

    error: (err) => {

      this.spinner.hide();

      Swal.fire(
        'Error',
        err?.error?.message || 'Operation failed.',
        'error'
      );

    }
  });

}

  edit(g: GeoLocation) {
    this.location = { ...g };
    this.isEditMode = true;

    this.filteredRegions = this.regions.filter(r =>
      Number(r.companyID) === Number(g.companyId)
    );
  }

  delete(g: GeoLocation) {
    this.service.deleteGeoLocation(g.geoLocationId).subscribe(() => {
      this.loadLocations();
    });
  }

  resetForm() {
    this.location = this.getEmpty();
    this.filteredRegions = [];
    this.isEditMode = false;
  }

  getCompanyName(id: number) {
    return this.companies.find(c => c.companyId == id)?.companyName || 'N/A';
  }

  getRegionName(id: number) {
    return this.regions.find(r => r.regionID == id)?.regionName || 'N/A';
  }
}
