import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LayoutComponent } from './features/layout/layout/layout.component';
import { ProfileComponent } from './features/employee-profile/profile/profile.component';
import { DigitalBusinessCardComponent } from './features/employee-profile/digital-business-card/digital-business-card.component';
import { EmployeeDetailsComponent } from './features/employee-profile/employee-details/employee-details.component';
import { EmployeeEmergencyContactComponent } from './features/employee-profile/employee-emergency-contact/employee-emergency-contact.component';
import { EmployeeReferencesComponent } from './features/employee-profile/employee-references/employee-references.component';
import { FinanceDashboardComponent } from './features/auth/finance-dashboard/finance-dashboard.component';
import { ManagerDashboardComponent } from './features/auth/manager-dashboard/manager-dashboard.component';
import { EmployeeDashboardComponent } from './features/auth/employee-dashboard/employee-dashboard.component';
import { NavbarHrLayoutComponent } from './hr/layout/navbar-hr-layout/navbar-hr-layout.component';
import { NavbarManagerLayoutComponent } from './manager/layout/navbar-manager-layout/navbar-manager-layout.component';
import { NavbarEmployeeLayoutComponent } from './employee/layout/navbar-employee-layout/navbar-employee-layout.component';
import { EmployeeSkillsComponent } from './features/employee-profile/employee-skills/employee-skills.component';
import { EmployeeFamilyDetailsComponent } from './features/employee-profile/employee-details/employee-family-details/employee-family-details.component';
import { EmployeeDocumentsComponent } from './features/employee-profile/employee-documents/employee-documents.component';
import { EmployeeFinanceComponent } from './features/employee-profile/employee-finance/employee-finance.component';
import { EmployeeResignationComponent } from './features/employee-profile/employee-resignation/employee-resignation.component';
import { EmployeeImmigrationComponent } from './features/employee-profile/employee-immigration/employee-immigration.component';
import { ClockinClockoutComponent } from './features/attendance/clockin-clockout/clockin-clockout.component';
import { ShiftAllocationComponent } from './features/attendance/shift-allocation/shift-allocation.component';
import { DailyWorkingHoursComponent } from './features/attendance/daily-working-hours/daily-working-hours.component';
import { LateArrivalsComponent } from './features/attendance/late-arrivals/late-arrivals.component';
import { EarlyDeparturesComponent } from './features/attendance/early-departures/early-departures.component';
import { WfoRemoteRequestComponent } from './features/attendance/wfo-remote-request/wfo-remote-request.component';
import { MissedPunchRequestComponent } from './features/attendance/missed-punch-request/missed-punch-request.component';
import { EarlyLogoutRequestComponent } from './features/attendance/early-logout-request/early-logout-request.component';
import { LeaveManagementComponent } from './features/leave/leave-management/leave-management.component';
import { ExpenseManagementComponent } from './features/expenses/expense-management/expense-management.component';
import { AssetManagementComponent } from './features/asset/asset-management/asset-management.component';
import { TimesheetManagementComponent } from './features/timesheet/timesheet-management/timesheet-management.component';
import { KpiPerformanceComponent } from './features/performance/kpi-performance/kpi-performance.component';
import { HelpDeskManagementComponent } from './features/helpdesk/help-desk-management/help-desk-management.component';
import { ComanyNewsComponent } from './features/company-news/comany-news/comany-news.component';
import { EmployeePolicyComponent } from './features/company-policies/employee-policy/employee-policy.component';
import { MyTeamHierarchyComponent } from './features/my-team/my-team-hierarchy/my-team-hierarchy.component';
import { MyCalendarComponent } from './features/my-calendar/my-calendar/my-calendar.component';
import { MyEventsComponent } from './features/events/my-events/my-events.component';
import { CompensationComponent } from './features/compensation/compensation/compensation.component';
import { RecruitmentProcessComponent } from './features/recruitment/recruitment-process/recruitment-process.component';
import { WelcomedemoComponent } from './admin/pages/welcomedemo/welcomedemo.component';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { ForgotPasswordComponent } from './features/login/forgot-password/forgot-password.component';
import { VerifyOtpComponent } from './features/login/verify-otp/verify-otp.component';
import { ResetPasswordComponent } from './features/login/reset-password/reset-password.component';
import { EarningDeductionsComponent } from './pages/payroll/earning-deductions/earning-deductions.component';
import { TaxSettingsComponent } from './admin/pages/payroll/tax-settings/tax-settings.component';
import { PayGroupsComponent } from './pages/payroll/pay-groups/pay-groups.component';
import { PayslipTemplateComponent } from './admin/pages/payroll/payslip-template/payslip-template.component';
import { SuperAdminLayoutComponent } from './superAdmin/super-admin-layout/super-admin-layout.component';
import { AttendanceListComponent } from './features/attendance/attendance-list/attendance-list.component';
import { SuperAdminDemousersComponent } from './superAdmin/super-admin-demousers/super-admin-demousers.component';
import { SubscriptionPlansComponent } from './superAdmin/subscription-plans/subscription-plans.component';
import { TimesheetReportComponent } from './timesheet-report/timesheet-report.component';
import { EmployeePayslipComponent } from './features/compensation/payroll/employee-payslip/employee-payslip.component';
import { HrPayslipComponent } from './features/compensation/payroll/hr-payslip/hr-payslip.component';
import { MyTaskComponent } from './features/my-task/my-task/my-task.component';
import { EmployeePersonalDetailsComponent } from './features/employee-profile/employee-details/employee-personal-details/employee-personal-details.component';
import { BirthdayMasterComponent } from './admin/pages/birthday/birthday-master/birthday-master.component';
import { JobApplicationComponent } from './features/recruitment/job-application/job-application.component';
import { EmployeeW4DetailsComponent } from './features/employee-profile/employee-finance/employee-w4-details/employee-w4-details.component';
import { EmployeeDdDetailsComponent } from './features/employee-profile/employee-finance/employee-dd-details/employee-dd-details.component';
import { EmployeeBankDetailsComponent } from './features/employee-profile/employee-finance/employee-bank-details/employee-bank-details.component';
import { EmployeeCertificationsComponent } from './features/employee-profile/employee-skills/employee-certifications/employee-certifications.component';
import { EmployeeEducationComponent } from './features/employee-profile/employee-skills/employee-education/employee-education.component';
import { EmployeeJobhistoryComponent } from './features/employee-profile/employee-skills/employee-jobhistory/employee-jobhistory.component';
import { EmployeeMyformsComponent } from './features/employee-profile/employee-documents/employee-myforms/employee-myforms.component';
import { EmployeeMyLettersFormsComponent } from './features/employee-profile/employee-documents/employee-my-letters-forms/employee-my-letters-forms.component';
import { EmployeeDocumentComponent } from './features/employee-profile/employee-documents/employee-document/employee-document.component';
import { EmployeeFormsComponent } from './features/employee-profile/employee-documents/employee-forms/employee-forms.component';
import { EmployeeLettersComponent } from './features/employee-profile/employee-documents/employee-letters/employee-letters.component';
import { EmployeeResignationManagerApprovalComponent } from './features/employee-profile/employee-resignation/employee-resignation-manager-approval/employee-resignation-manager-approval.component';
import { EmployeeResignationDetailsComponent } from './features/employee-profile/employee-resignation/employee-resignation-details/employee-resignation-details.component';
import { LeaveReportComponent } from './features/leave/leave-report/leave-report.component';
import { LeaveCalendarComponent } from './features/leave/leave-calendar/leave-calendar.component';
import { LeaveApprovalsComponent } from './features/leave/leave-approvals/leave-approvals.component';
import { ApplyLeaveComponent } from './features/leave/apply-leave/apply-leave.component';
import { ApproveExpensesComponent } from './features/expenses/approve-expenses/approve-expenses.component';
import { AllExpensesComponent } from './features/expenses/all-expenses/all-expenses.component';
import { CreateExpensesComponent } from './features/expenses/create-expenses/create-expenses.component';
import { AssetReportComponent } from './features/asset/asset-report/asset-report.component';
import { MyAssetComponent } from './features/asset/my-asset/my-asset.component';
import { AssignAssetScreenComponent } from './features/asset/assign-asset-screen/assign-asset-screen.component';
import { AssetApprovalComponent } from './features/asset/asset-approval/asset-approval.component';
import { AssetRequestComponent } from './features/asset/asset-request/asset-request.component';
import { AddAssetsComponent } from './features/asset/add-assets/add-assets.component';
import { TimesheetApprovalComponent } from './features/timesheet/timesheet-approval/timesheet-approval.component';
import { TimesheetApplicationComponent } from './features/timesheet/timesheet-application/timesheet-application.component';
import { TicketReportsComponent } from './features/helpdesk/ticket-reports/ticket-reports.component';
import { ApproveTicketsComponent } from './features/helpdesk/approve-tickets/approve-tickets.component';
import { MyTicketsComponent } from './features/helpdesk/my-tickets/my-tickets.component';
import { RaiseTicketComponent } from './features/helpdesk/raise-ticket/raise-ticket.component';
import { TaskreportComponent } from './features/my-task/taskreport/taskreport.component';
import { TeamtaskComponent } from './features/my-task/teamtask/teamtask.component';
import { MytaskComponent } from './features/my-task/mytask/mytask.component';
import { OnboardingComponent } from './features/recruitment/onboarding/onboarding.component';
import { DocumentsVerificationComponent } from './features/recruitment/documents-verification/documents-verification.component';
import { OfferComponent } from './features/recruitment/offer/offer.component';
import { AppointmentComponent } from './features/recruitment/appointment/appointment.component';
import { InterviewComponent } from './features/recruitment/interview/interview.component';
import { ScreeningComponent } from './features/recruitment/screening/screening.component';
import { ResumeUploadComponent } from './features/recruitment/resume-upload/resume-upload.component';
import { ApplicationResumesComponent } from './features/recruitment/application-resumes/application-resumes.component';
const routes: Routes = [
  { path: '', component: LoginComponent },
   { path: 'forgot-password', component: ForgotPasswordComponent },
{ path: 'verify-otp', component: VerifyOtpComponent },
{ path: 'reset-password', component: ResetPasswordComponent },
  { path: 'dashboard', component: LayoutComponent },
  {path:'Welcomedemo',component:WelcomedemoComponent},
    {path:'job-application',component:JobApplicationComponent},
  {path : 'change-password', component : ChangePasswordComponent},
  // { path: 'hr-dashboard', component: NavbarHrLayoutComponent },
  // // { path: 'manager-dashboard', component: NavbarManagerLayoutComponent },
  // { path: 'employee-dashboard', component: NavbarEmployeeLayoutComponent },
  // { path: 'finance-dashboard', component: FinanceDashboardComponent },
  { path: 'profile', component: ProfileComponent },
  {
  path: 'employee',
  children: [
    { path: 'personal', component: EmployeePersonalDetailsComponent },
    { path: 'family', component: EmployeeFamilyDetailsComponent },
    { path: 'emergency', component: EmployeeEmergencyContactComponent },
    { path: 'reference', component: EmployeeReferencesComponent }
  ]
},
  { path: 'digitalbusiness', component: DigitalBusinessCardComponent },
  // { path: 'details', component: EmployeeDetailsComponent },
{
  path: 'details',
  component: EmployeeDetailsComponent,
  children: [
    {
      path: '',
      redirectTo: 'personal',
      pathMatch: 'full'
    },
    {
      path: 'personal',
      component: EmployeePersonalDetailsComponent
    },
    {
      path: 'family',
      component: EmployeeFamilyDetailsComponent
    },
    {
      path: 'emergency',
      component: EmployeeEmergencyContactComponent
    },
    {
      path: 'reference',
      component: EmployeeReferencesComponent
    }
  ]
},
  { path: 'emergency', component: EmployeeEmergencyContactComponent },
{ path: 'references', component: EmployeeReferencesComponent },
// { path: 'skills', component: EmployeeSkillsComponent },
{
  path: 'skills',
  component: EmployeeSkillsComponent,
  children: [
    {
      path: '',
      redirectTo: 'job-history',
      pathMatch: 'full'
    },
    {
      path: 'job-history',
      component: EmployeeJobhistoryComponent
    },
    {
      path: 'education',
      component: EmployeeEducationComponent
    },
    {
      path: 'certification',
      component: EmployeeCertificationsComponent
    }
  ]
},
// { path: 'documents', component: EmployeeDocumentsComponent },
{
  path: 'documents',
  component: EmployeeDocumentsComponent,
  children: [
    {
      path: '',
      redirectTo: 'letters',
      pathMatch: 'full'
    },
    {
      path: 'letters',
      component: EmployeeLettersComponent
    },
    {
      path: 'forms',
      component: EmployeeFormsComponent
    },
    {
      path: 'my-documents',
      component: EmployeeDocumentComponent
    },
    {
      path: 'my-letters',
      component: EmployeeMyLettersFormsComponent
    },
    {
      path: 'my-forms',
      component: EmployeeMyformsComponent
    }
  ]
},
// { path: 'finance', component: EmployeeFinanceComponent },
// { path: 'resignation', component: EmployeeResignationComponent },
{
  path: 'resignation',
  component: EmployeeResignationComponent,
  children: [
    {
      path: '',
      redirectTo: 'details',
      pathMatch: 'full'
    },
    {
      path: 'details',
      component: EmployeeResignationDetailsComponent
    },
    {
      path: 'manager-approval',
      component: EmployeeResignationManagerApprovalComponent
    }
  ]
},
{ path: 'immigration', component: EmployeeImmigrationComponent },
{ path: 'clockin-out', component: ClockinClockoutComponent },
{ path: 'shift-allocation', component: ShiftAllocationComponent },
{ path: 'daily-working-hours', component: DailyWorkingHoursComponent },
{ path: 'late-arrivals', component: LateArrivalsComponent },  
{ path: 'early-departures', component: EarlyDeparturesComponent },
{ path: 'wfh-remote-request', component: WfoRemoteRequestComponent },
{ path: 'missed-punch-request', component: MissedPunchRequestComponent },
{ path: 'early-logout-request', component: EarlyLogoutRequestComponent },
// { path: 'leave-management', component: LeaveManagementComponent },
{
  path: 'leave-management',
  component: LeaveManagementComponent,
  children: [
    {
      path: '',
      redirectTo: 'apply-leave',
      pathMatch: 'full'
    },
    {
      path: 'apply-leave',
      component: ApplyLeaveComponent
    },
    {
      path: 'leave-approvals',
      component: LeaveApprovalsComponent
    },
    {
      path: 'leave-calendar',
      component: LeaveCalendarComponent
    },
    {
      path: 'leave-report',
      component: LeaveReportComponent
    }
  ]
},
// { path: 'expenses', component: ExpenseManagementComponent },
{
  path: 'expenses',
  component: ExpenseManagementComponent,
  children: [
    {
      path: '',
      redirectTo: 'create-expense',
      pathMatch: 'full'
    },
    {
      path: 'create-expense',
      component: CreateExpensesComponent
    },
    {
      path: 'all-expenses',
      component: AllExpensesComponent
    },
    {
      path: 'approve-expenses',
      component: ApproveExpensesComponent
    }
  ]
},
// { path: 'asset', component: AssetManagementComponent },
{
  path: 'asset',
  component: AssetManagementComponent,
  children: [
    {
      path: '',
      redirectTo: 'add-asset',
      pathMatch: 'full'
    },
    {
      path: 'add-asset',
      component: AddAssetsComponent
    },
    {
      path: 'asset-request',
      component: AssetRequestComponent
    },
    {
      path: 'asset-approval',
      component: AssetApprovalComponent
    },
    {
      path: 'assign-asset',
      component: AssignAssetScreenComponent
    },
    {
      path: 'my-assets',
      component: MyAssetComponent
    },
    {
      path: 'asset-reports',
      component: AssetReportComponent
    }
  ]
},
// { path: 'timesheet', component: TimesheetManagementComponent },
{
  path: 'timesheet',
  component: TimesheetManagementComponent,
  children: [
    {
      path: '',
      redirectTo: 'submit-timesheet',
      pathMatch: 'full'
    },
    {
      path: 'submit-timesheet',
      component: TimesheetApplicationComponent
    },
    {
      path: 'approve-timesheet',
      component: TimesheetApprovalComponent
    },
    {
      path: 'timesheet-report',
      component: TimesheetReportComponent
    }
  ]
},
{ path: 'kpi-performance', component: KpiPerformanceComponent },
// { path: 'help-desk', component: HelpDeskManagementComponent },
{
  path: 'help-desk',
  component: HelpDeskManagementComponent,
  children: [
    {
      path: '',
      redirectTo: 'raise-ticket',
      pathMatch: 'full'
    },
    {
      path: 'raise-ticket',
      component: RaiseTicketComponent
    },
    {
      path: 'my-tickets',
      component: MyTicketsComponent
    },
    {
      path: 'ticket-approval',
      component: ApproveTicketsComponent
    },
    {
      path: 'ticket-reports',
      component: TicketReportsComponent
    }
  ]
},
{ path: 'company-news', component: ComanyNewsComponent },
{ path: 'company-policies', component: EmployeePolicyComponent },
{ path: 'my-team', component: MyTeamHierarchyComponent },
{ path: 'my-event', component: MyEventsComponent },
// { path: 'my-task', component: MyTaskComponent },
{
  path: 'my-task',
  component: MyTaskComponent,
  children: [
    {
      path: '',
      redirectTo: 'my-tasks',
      pathMatch: 'full'
    },
    {
      path: 'my-tasks',
      component: MytaskComponent
    },
    {
      path: 'team-task',
      component: TeamtaskComponent
    },
    {
      path: 'task-report',
      component: TaskreportComponent
    }
  ]
},
{
  path: 'finance',
  component: EmployeeFinanceComponent,
  children: [
    {
      path: '',
      redirectTo: 'bank-details',
      pathMatch: 'full'
    },
    {
      path: 'bank-details',
      component: EmployeeBankDetailsComponent
    },
    {
      path: 'dd',
      component: EmployeeDdDetailsComponent
    },
    {
      path: 'w4',
      component: EmployeeW4DetailsComponent
    }
  ]
},
{
  path: 'compensation',
  component: CompensationComponent,
  children: [
    { path: '', redirectTo: 'employee-payslip', pathMatch: 'full' },

    { path: 'employee-payslip', component: EmployeePayslipComponent },
    { path: 'hr-payslip', component: HrPayslipComponent }
  ]
},
 { path: 'superadmin-template', component: SuperAdminLayoutComponent},
// { path: 'recruitment', component: RecruitmentProcessComponent },
{
  path: 'recruitment',
  component: RecruitmentProcessComponent,
  children: [
    {
      path: '',
      redirectTo: 'application-resumes',
      pathMatch: 'full'
    },
    {
      path: 'application-resumes',
      component: ApplicationResumesComponent
    },
    {
      path: 'resume-upload',
      component: ResumeUploadComponent
    },
    {
      path: 'screening',
      component: ScreeningComponent
    },
    {
      path: 'interview',
      component: InterviewComponent
    },
    {
      path: 'appointment',
      component: AppointmentComponent
    },
    {
      path: 'offer',
      component: OfferComponent
    },
    {
      path: 'documents-verification',
      component: DocumentsVerificationComponent
    },
    {
      path: 'onboarding',
      component: OnboardingComponent
    }
  ]
},
{path:'superadmin-dashboard',component:SuperAdminLayoutComponent},
{ path: 'attendance-list', component: AttendanceListComponent },
{ path: 'my-calendar', component: MyCalendarComponent },
{ path: 'financedashboard', component: FinanceDashboardComponent },
{ path: 'managerdashboard', component: ManagerDashboardComponent },
{ path: 'empdashboard', component: EmployeeDashboardComponent },
{ path: 'demo-users', component: SuperAdminDemousersComponent },
{ path: 'subscription-plans', component: SubscriptionPlansComponent },
  
  {path: 'timesheet-Report', component:TimesheetReportComponent},
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
