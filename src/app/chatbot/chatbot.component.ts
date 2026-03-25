// import { Component } from '@angular/core';
// import { ChatService } from '../services/chat.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-chatbot',
//    standalone: true,
//      imports: [CommonModule, FormsModule],
//   templateUrl: './chatbot.component.html',
//   styleUrls: ['./chatbot.component.css']  // ✅ correct
// })
// export class ChatbotComponent {

//   userMessage = '';
//   messages: any[] = [];

//   constructor(private chatService: ChatService) {}

//   sendMessage() {
//     if (!this.userMessage.trim()) return;

//     // push user message
//     this.messages.push({ sender: 'user', text: this.userMessage });

//     this.chatService.sendMessage(this.userMessage).subscribe(res => {
//       this.messages.push({
//         sender: 'bot',
//         text: res.response
//       });
//     });

//     this.userMessage = '';
//   }
// }


// import { Component, ElementRef, ViewChild } from '@angular/core';
// import { ChatService } from '../services/chat.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';


// @Component({
//   selector: 'app-chatbot',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './chatbot.component.html',
//   styleUrls: ['./chatbot.component.css']
// })
// export class ChatbotComponent {

//   userMessage = '';
//   messages: any[] = [];

//   isOpen = false;       // ✅ floating toggle
//   isLoading = false;    // ✅ loading indicator

//   @ViewChild('chatBody') chatBody!: ElementRef;

//   constructor(private chatService: ChatService,
//                private router: Router ,
//   ) {}

//   // ✅ Toggle chatbot
//   toggleChat() {
//     this.isOpen = !this.isOpen;
//   }

//   // ✅ Send message
//   sendMessage() {
//     if (!this.userMessage.trim()) return;

//     const messageText = this.userMessage;

//     // push user message
//     this.messages.push({
//       sender: 'user',
//       text: messageText
//     });

//     this.userMessage = '';
//     this.isLoading = true;

//     this.chatService.sendMessage(messageText).subscribe({
//       next: (res) => {
//         this.messages.push({
//           sender: 'bot',
//           text: res.response || 'No response'
//         });
//         this.isLoading = false;
//         this.scrollToBottom();
//       },
//       error: (err) => {
//         console.error(err);
//         this.messages.push({
//           sender: 'bot',
//           text: '⚠️ Server error. Try again.'
//         });
//         this.isLoading = false;
//         this.scrollToBottom();
//       }
//     });

//     this.scrollToBottom();
//   }

//   // ✅ Auto scroll
//   scrollToBottom() {
//     setTimeout(() => {
//       try {
//         if (this.chatBody) {
//           this.chatBody.nativeElement.scrollTop =
//             this.chatBody.nativeElement.scrollHeight;
//         }
//       } catch (err) {}
//     }, 100);
//   }
// }


import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {

  userMessage = '';
  messages: any[] = [];

  isOpen = false;
  isLoading = false;

  @ViewChild('chatBody') chatBody!: ElementRef;

  constructor(
    private chatService: ChatService,
    private router: Router
  ) {}

  // ✅ Toggle chatbot
  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  // // ✅ Send message
  // sendMessage() {
  //   if (!this.userMessage.trim()) return;

  //   const messageText = this.userMessage.toLowerCase();

  //   // push user message
  //   this.messages.push({
  //     sender: 'user',
  //     text: messageText
  //   });

  //   this.userMessage = '';

  //   // 🔥 STEP 1: HANDLE NAVIGATION FIRST
  //   if (this.handleNavigation(messageText)) {
  //     this.scrollToBottom();
  //     return;
  //   }

  //   // 🔥 STEP 2: CALL BACKEND
  //   this.isLoading = true;

  //   this.chatService.sendMessage(messageText).subscribe({
  //     next: (res) => {
  //       this.messages.push({
  //         sender: 'bot',
  //         text: res.response || res.answer || 'No response'
  //       });
  //       this.isLoading = false;
  //       this.scrollToBottom();
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       this.messages.push({
  //         sender: 'bot',
  //         text: '⚠️ Server error. Try again.'
  //       });
  //       this.isLoading = false;
  //       this.scrollToBottom();
  //     }
  //   });

  //   this.scrollToBottom();
  // }

  sendMessage() {
  if (!this.userMessage.trim()) return;

  const messageText = this.userMessage.toLowerCase();

  // ✅ Push user message
  this.messages.push({
    sender: 'user',
    text: messageText
  });

  this.userMessage = '';

  // 🔥 STEP 1: ROLE-BASED NAVIGATION
  const role = sessionStorage.getItem('roleName');

  if (role === 'Admin') {
    if (this.handleAdminNavigation(messageText)) {
      this.scrollToBottom();
      return;
    }
  } else {
    if (this.handleUserNavigation(messageText)) {
      this.scrollToBottom();
      return;
    }
  }

  // 🔥 STEP 2: BACKEND CALL (if no navigation matched)
  this.isLoading = true;

  this.chatService.sendMessage(messageText).subscribe({
    next: (res) => {
      this.messages.push({
        sender: 'bot',
        text: res.response || res.answer || 'No response'
      });
      this.isLoading = false;
      this.scrollToBottom();
    },
    error: (err) => {
      console.error(err);
      this.messages.push({
        sender: 'bot',
        text: '⚠️ Server error. Please try again.'
      });
      this.isLoading = false;
      this.scrollToBottom();
    }
  });

  this.scrollToBottom();
}



  // 🔥 NAVIGATION LOGIC

// handleUserNavigation(message: string): boolean {

//   const routes = [

//     { keywords: ['dashboard', 'home'], path: '/dashboard', msg: 'Opening dashboard...' },

//     { keywords: ['profile'], path: '/profile', msg: 'Opening profile...' },
//     { keywords: ['details'], path: '/details', msg: 'Opening details...' },
//     { keywords: ['documents'], path: '/documents', msg: 'Opening documents...' },

//     { keywords: ['attendance'], path: '/attendance-list', msg: 'Opening attendance...' },
//     { keywords: ['clock'], path: '/clockin-out', msg: 'Opening clock-in...' },

//     { keywords: ['leave'], path: '/leave-management', msg: 'Opening leave...' },
//     { keywords: ['expenses'], path: '/expenses', msg: 'Opening expenses...' },

//     { keywords: ['timesheet'], path: '/timesheet', msg: 'Opening timesheet...' },
//     { keywords: ['kpi'], path: '/kpi-performance', msg: 'Opening KPI...' },

//     { keywords: ['help'], path: '/help-desk', msg: 'Opening help desk...' },

//     { keywords: ['news'], path: '/company-news', msg: 'Opening company news...' },
//     { keywords: ['policy'], path: '/company-policies', msg: 'Opening policies...' },

//     { keywords: ['team'], path: '/my-team', msg: 'Opening team...' },
//     { keywords: ['event'], path: '/my-event', msg: 'Opening events...' },

//     { keywords: ['calendar'], path: '/my-calendar', msg: 'Opening calendar...' },

//     { keywords: ['salary', 'payroll'], path: '/compensation', msg: 'Opening compensation...' }

//   ];

//   for (let route of routes) {
//     if (route.keywords.some((k: string) => message.includes(k))) {
//       this.router.navigate([route.path]);
//       this.addBotMessage(route.msg);
//       return true;
//     }
//   }

//   return false;
// }

handleAdminNavigation(message: string): boolean {
// user management
  const routes = [
    { keywords: ['menu master', 'menu'], path: '/admin/menumaster', msg: 'Opening menu master...' },
    {keywords:['roles & permissions','roles'],path:'/admin/roles-permission',msg:'Opening roles-permissions'},
    { keywords: ['dashboard'], path: '/admin/dashboard', msg: 'Opening admin dashboard...' },
 { keywords: ['user management','user'], path: '/admin/users', msg: 'Opening user management...' },
  { keywords: ['marital status','marital'], path: '/admin/marital-status', msg: 'Opening marital status...' },
    { keywords: ['relationship Master','relationship'], path: '/admin/relationship', msg: 'Opening relationship status...' },
     { keywords: [' certification type management','certification management',' certification'], path: '/admin/certification-type', msg: 'Opening certification status...' },
    { keywords: ['project status management','project status','project'], path: '/admin/project-status', msg: 'Opening project status...' },
    { keywords: ['helpdesk category','helpdesk'], path: '/admin/helpdesk-category', msg: 'Opening helpdesk-category status...' },
    { keywords: ['expense category','expense'], path: '/admin/expense-category', msg: 'Opening expense-category status...' },
    { keywords: ['leave type'], path: '/admin/leave-type', msg: 'Opening leave-type status...' },
    { keywords: ['leave status','leave-status'], path: '/admin/leave-status', msg: 'Opening leave-status status...' },
    { keywords: ['attendance status','attendance'], path: '/admin/attendance-status', msg: 'Opening attendance-status status...' },
    { keywords: ['priority'], path: '/admin/priority', msg: 'Opening priority status...' },
    { keywords: ['holiday list','holiday-list'], path: '/admin/holiday-list', msg: 'Opening holiday-list status...' },
    { keywords: ['week off','week-off'], path: '/admin/week-off', msg: 'Opening week-off status...' },
    { keywords: ['shifts','shift'], path: '/admin/shifts', msg: 'Opening shifts status...' },
    { keywords: ['resignationmaster'], path: '/admin/resignationmaster', msg: 'Opening resignationmaster status...' },
    { keywords: ['recruitment notice period','notice period'], path: '/admin/recruitment-notice-period', msg: 'Opening recruitment-notice-period status...' },
    { keywords: ['screening result','screening'], path: '/admin/screening-result', msg: 'Opening screening-result status...' },
    { keywords: ['interview level','interview-level'], path: '/admin/interview-level', msg: 'Opening interview-level status...' },
    // company-news-category
        { keywords: ['company-news-category','company news category','company news'], path: '/admin/company-news-category', msg: 'Opening company-news-category status...' },
    { keywords: ['employment-type','employment type'], path: '/admin/employment-type', msg: 'Opening employment-type status...' },
    { keywords: ['interview level','interview-level'], path: '/admin/interview-level', msg: 'Opening interview-level status...' },


    // EMPLOYEE
    { keywords: ['employee'], path: '/admin/employee', msg: 'Opening employee module...' },
    { keywords: ['department'], path: '/admin/department', msg: 'Opening department...' },
    { keywords: ['designation'], path: '/admin/designation', msg: 'Opening designation...' },
    { keywords: ['location'], path: '/admin/location', msg: 'Opening location...' },

    // SETTINGS
    { keywords: ['payroll setting'], path: '/admin/payroll-setting', msg: 'Opening payroll settings...' },
    { keywords: ['attendance setting'], path: '/admin/shift-setting', msg: 'Opening attendance settings...' },
    { keywords: ['notification'], path: '/admin/notification-setting', msg: 'Opening notifications...' },
    { keywords: ['smtp'], path: '/admin/smtp-settings', msg: 'Opening SMTP settings...' },
    { keywords: ['sms'], path: '/admin/sms-template', msg: 'Opening SMS templates...' },
    { keywords: ['push'], path: '/admin/push-notification', msg: 'Opening push notifications...' },

    // PAYROLL
    { keywords: ['earning'], path: '/admin/earning-deductions', msg: 'Opening earnings...' },
    { keywords: ['tax'], path: '/admin/tax-settings', msg: 'Opening tax settings...' },
    { keywords: ['payslip'], path: '/admin/payslip-template', msg: 'Opening payslip...' },

    // CONFIG
    { keywords: ['my team hierarchy config'], path: '/admin/hierarchy-config', msg: 'Opening general configuration...' },
    { keywords: ['attendance config'], path: '/admin/attendance-configuration', msg: 'Opening attendance config...' },

    // COMPANY
    { keywords: ['company'], path: '/admin/company', msg: 'Opening company...' },
    { keywords: ['region'], path: '/admin/region', msg: 'Opening region...' },

    // CONTENT
    { keywords: ['news'], path: '/admin/company-news', msg: 'Opening company news...' },
    { keywords: ['policy'], path: '/admin/policy-category', msg: 'Opening policies...' },

    // SYSTEM
    { keywords: ['audit'], path: '/admin/audit-log', msg: 'Opening audit logs...' },
    { keywords: ['system log'], path: '/admin/system-log', msg: 'Opening system logs...' },

    // MASTER
    { keywords: ['gender'], path: '/admin/gender', msg: 'Opening gender master...' },
    { keywords: ['blood'], path: '/admin/blood-group', msg: 'Opening blood group...' }

  ];

  for (let route of routes) {
    if (route.keywords.some((k: string) => message.includes(k))) {
      this.router.navigate([route.path]);
      this.addBotMessage(route.msg);
      return true;
    }
  }

  return false;
}


handleUserNavigation(message: string): boolean {

  

  const routes: any[] = [

    // PROFILE
    { keywords: ['profile'], path: '/profile', msg: 'Opening your profile...' },
    { keywords: ['details'], path: '/details', msg: 'Opening employee details...' },
    { keywords: ['emergency'], path: '/emergency', msg: 'Opening emergency contacts...' },
    { keywords: ['references'], path: '/references', msg: 'Opening references...' },
    { keywords: ['skills'], path: '/skills', msg: 'Opening skills...' },
    { keywords: ['documents'], path: '/documents', msg: 'Opening documents...' },
    { keywords: ['finance'], path: '/finance', msg: 'Opening finance details...' },

    // ATTENDANCE
    { keywords: ['attendance'], path: '/attendance-list', msg: 'Opening attendance...' },
    { keywords: ['clock'], path: '/clockin-out', msg: 'Opening clock-in page...' },
    { keywords: ['shift'], path: '/shift-allocation', msg: 'Opening shift allocation...' },
    { keywords: ['working hours'], path: '/daily-working-hours', msg: 'Opening working hours...' },
    { keywords: ['late'], path: '/late-arrivals', msg: 'Opening late arrivals...' },
    { keywords: ['early'], path: '/early-departures', msg: 'Opening early departures...' },
    { keywords: ['wfh', 'remote'], path: '/wfh-remote-request', msg: 'Opening WFH requests...' },
    { keywords: ['missed punch'], path: '/missed-punch-request', msg: 'Opening missed punch...' },

    // LEAVE & EXPENSES
    { keywords: ['leave'], path: '/leave-management', msg: 'Opening leave management...' },
    { keywords: ['expenses'], path: '/expenses', msg: 'Opening expenses...' },

    // PAYROLL
    { keywords: ['salary', 'payroll'], path: '/compensation', msg: 'Opening compensation...' },
    { keywords: ['earning'], path: '/compensation/earning-deductions', msg: 'Opening earnings...' },
    { keywords: ['tax'], path: '/compensation/tax-settings', msg: 'Opening tax settings...' },
    { keywords: ['payslip'], path: '/compensation/payslip-template', msg: 'Opening payslip...' },

    // WORK
    { keywords: ['timesheet'], path: '/timesheet', msg: 'Opening timesheet...' },
    { keywords: ['asset'], path: '/asset', msg: 'Opening asset management...' },
    { keywords: ['kpi'], path: '/kpi-performance', msg: 'Opening KPI performance...' },

    // ORG
    { keywords: ['help'], path: '/help-desk', msg: 'Opening help desk...' },
    { keywords: ['news'], path: '/company-news', msg: 'Opening company news...' },
    { keywords: ['policy'], path: '/company-policies', msg: 'Opening policies...' },
    { keywords: ['team'], path: '/my-team', msg: 'Opening team view...' },
    { keywords: ['event'], path: '/my-event', msg: 'Opening events...' },

    // DASHBOARD
    { keywords: ['dashboard', 'home'], path: '/dashboard', msg: 'Going to dashboard...' },
    { keywords: ['calendar'], path: '/my-calendar', msg: 'Opening calendar...' }

  ];

  for (let route of routes) {
    if (route.keywords.some((k: string) => message.includes(k))) {
      this.router.navigate([route.path]);
      this.addBotMessage(route.msg);
      return true;
    }
  }

  return false;
}
  

  // ✅ Add bot message helper
  addBotMessage(text: string) {
    this.messages.push({
      sender: 'bot',
      text: text
    });
  }

  // ✅ Auto scroll
  scrollToBottom() {
    setTimeout(() => {
      try {
        if (this.chatBody) {
          this.chatBody.nativeElement.scrollTop =
            this.chatBody.nativeElement.scrollHeight;
        }
      } catch (err) {}
    }, 100);
  }
}