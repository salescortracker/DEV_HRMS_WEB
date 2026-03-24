import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: false,
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.css'
})
export class SuperAdminDashboardComponent {
  totalCompanies = 12;
  totalUsers = 350;
  activePlans = 5;
  revenue = 120000;
 
  recentCompanies = [
    {name:'ABC Pvt Ltd', plan:'Super Plan', users:45},
    {name:'XYZ Solutions', plan:'Starter Plan', users:20},
    {name:'TechNova', plan:'Business Plan', users:60}
  ];
 
  expiringCompanies = [
    {name:'ABC Pvt Ltd', expiry:'20 Mar 2026'},
    {name:'XYZ Solutions', expiry:'25 Mar 2026'}
  ];
getDaysLeft(expiryDate: any) {
 
  const today = new Date();
  const expiry = new Date(expiryDate);
 
  const diff =
    (expiry.getTime() - today.getTime()) /
    (1000 * 3600 * 24);
 
  return Math.ceil(diff);
 
}
isExpiringSoon(expiryDate: any) {
 
  const today = new Date();
  const expiry = new Date(expiryDate);
 
  const diff =
    (expiry.getTime() - today.getTime()) /
    (1000 * 3600 * 24);
 
  return diff <= 7;
 
}
  ngAfterViewInit(){
 
    this.loadCompanyChart();
    this.loadUserChart();
 
  }
 
  loadCompanyChart(){
 
    new Chart("companyChart",{
 
      type:'line',
 
      data:{
        labels:['Jan','Feb','Mar','Apr','May','Jun'],
 
        datasets:[{
          label:'Companies',
          data:[2,4,6,8,10,12],
          borderColor:'#667eea',
          backgroundColor:'rgba(102,126,234,0.2)',
          fill:true
        }]
      }
 
    });
 
  }
 
  loadUserChart(){
 
    new Chart("userChart",{
 
      type:'doughnut',
 
      data:{
        labels:['Admins','HR','Employees'],
 
        datasets:[{
          data:[20,80,250],
          backgroundColor:[
            '#667eea',
            '#43cea2',
            '#f7971e'
          ]
        }]
      }
 
    });
 
  }
}
