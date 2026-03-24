export interface HrmsModule {
  key: string;
  title: string;
  description: string;
  features: string[];
  route: string;
}

export const HRMS_MODULES: HrmsModule[] = [
  {
    key: 'leave',
    title: 'Leave Management',
    description: 'Manage and track your leave requests and balances.',
    features: [
      'Apply leave',
      'View leave balance',
      'Check leave status'
    ],
    route: '/employee/leave/apply'
  },
  {
    key: 'attendance',
    title: 'Attendance',
    description: 'View your daily attendance and working hours.',
    features: [
      'Daily attendance',
      'In & out time',
      'Monthly summary'
    ],
    route: '/employee/attendance'
  },
  {
    key: 'profile',
    title: 'Employee Profile',
    description: 'View and update your personal and professional details.',
    features: [
      'Personal details',
      'Emergency contacts',
      'Documents'
    ],
    route: '/employee/profile'
  },
  {
    key: 'helpdesk',
    title: 'Help Desk',
    description: 'Raise and track support tickets for HR or IT.',
    features: [
      'Create ticket',
      'Track ticket status',
      'View resolutions'
    ],
    route: '/employee/helpdesk'
  },
  {
    key: 'expenses',
    title: 'Expenses',
    description: 'Submit and track reimbursement claims.',
    features: [
      'Add expense',
      'Upload bills',
      'Approval status'
    ],
    route: '/employee/expenses'
  },
  {
    key: 'timesheet',
    title: 'Timesheet',
    description: 'Log and manage your work hours.',
    features: [
      'Daily timesheet',
      'Weekly summary',
      'Submit timesheet'
    ],
    route: '/employee/timesheet'
  },
  {
    key: 'recruitment',
    title: 'Recruitment',
    description: 'Manage job openings and candidates.',
    features: [
      'Job openings',
      'Candidate tracking',
      'Interview status'
    ],
    route: '/recruitment/jobs'
  },
  {
    key: 'companynews',
    title: 'Company News',
    description: 'Stay updated with company announcements.',
    features: [
      'Latest news',
      'Announcements',
      'Internal updates'
    ],
    route: '/company/news'
  },
  {
    key: 'policies',
    title: 'Company Policies',
    description: 'Access all company rules and policies.',
    features: [
      'HR policies',
      'Leave policy',
      'Code of conduct'
    ],
    route: '/company/policies'
  },
  {
    key: 'events',
    title: 'Company Events',
    description: 'View upcoming and past company events.',
    features: [
      'Upcoming events',
      'Event details',
      'Participation info'
    ],
    route: '/company/events'
  },
  {
    key: 'asset',
    title: 'Asset Management',
    description: 'Track company assets assigned to you.',
    features: [
      'Assigned assets',
      'Asset history',
      'Return requests'
    ],
    route: '/employee/assets'
  },
  {
    key: 'compensation',
    title: 'Compensation',
    description: 'View salary structure and benefits.',
    features: [
      'Salary details',
      'Allowances',
      'CTC breakup'
    ],
    route: '/employee/compensation'
  },
  {
    key: 'performance',
    title: 'Performance',
    description: 'Track goals and performance reviews.',
    features: [
      'Goals',
      'Appraisals',
      'Feedback'
    ],
    route: '/employee/performance'
  },
  {
    key: 'myteam',
    title: 'My Team',
    description: 'View team members and hierarchy.',
    features: [
      'Team list',
      'Reporting structure',
      'Team attendance'
    ],
    route: '/employee/my-team'
  },
  {
    key: 'calendar',
    title: 'My Calendar',
    description: 'View holidays, leaves, and events.',
    features: [
      'Holiday list',
      'Leave calendar',
      'Events'
    ],
    route: '/employee/calendar'
  }
];