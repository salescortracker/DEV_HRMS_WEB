import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../admin/servies/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expense-management',
  standalone: false,
  templateUrl: './expense-management.component.html',
  styleUrl: './expense-management.component.css'
})
export class ExpenseManagementComponent implements OnInit {

  canCreateExpense: boolean = false;
  canViewAllExpense: boolean = false;
  canApproveExpense: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadTabPermissions();

    // if (this.canCreateExpense) {
    //   this.router.navigate(['/expenses/create-expense']);
    // }
    // else if (this.canViewAllExpense) {
    //   this.router.navigate(['/expenses/all-expenses']);
    // }
    // else if (this.canApproveExpense) {
    //   this.router.navigate(['/expenses/approve-expenses']);
    // }
  }

  loadTabPermissions(): void {

    const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

    const createMenu = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'create expense'
    );

    const allMenu = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'all expense'
    );

    const approveMenu = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'approve expense'
    );

    this.canCreateExpense = createMenu?.canAdd ?? false;
    this.canViewAllExpense = allMenu?.canView ?? false;
    this.canApproveExpense = approveMenu?.canEdit ?? false;

    console.log('Create Expense:', this.canCreateExpense);
    console.log('All Expenses:', this.canViewAllExpense);
    console.log('Approve Expense:', this.canApproveExpense);
  }
}