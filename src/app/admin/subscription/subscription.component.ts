import { Component, OnInit } from '@angular/core';
import { AdminService } from '../servies/admin.service';
import Swal from 'sweetalert2';

declare var Razorpay: any;

@Component({
  selector: 'app-subscription',
  standalone: false,
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent implements OnInit{

   plans: any[] = [];
  subscription: any;
  userId!: number;
  subscriptionStatusTitle = '';
subscriptionStatusMessage = '';
  router: any;
  invoice: any = null;

  planModules: any = {};
  

  constructor(private adminService: AdminService) {}
  ngOnInit(): void {
this.userId = Number(sessionStorage.getItem('UserId'));

    this.loadPlans();
    this.loadSubscription();
    this.loadInvoice();
    
  }

  loadInvoice() {
  this.adminService.getInvoiceByUser(this.userId).subscribe({
    next: (res: any) => {
      this.invoice = res;
    },
    error: (err) => {
      console.log('Invoice load error', err);
    }
  });
}
downloadInvoice() {
  Swal.fire(
    'Coming Soon',
    'PDF download will be available soon.',
    'info'
  );
}
  viewPlans() {
  document.getElementById('plansSection')?.scrollIntoView({
    behavior: 'smooth'
  });
}
renewPlan() {
  this.router.navigate(['/payment']);
}

  loadPlans() {
  this.adminService.getPlans().subscribe({
    next:(res:any)=>{

      this.plans = res;

      this.plans.forEach(plan => {

        this.adminService.getPlanModules(plan.planId)
        .subscribe((modules:any)=>{

          this.planModules[plan.planId] =
              modules.map((x:any)=>x.moduleName);

        });

      });

    },
    error:(err)=>{
      console.log(err);
    }
  });
}

  loadSubscription() {
  this.adminService.getUserSubscription(this.userId).subscribe({
    next: (res: any) => {
      this.subscription = res;
    },
    error: (err: any) => {
      console.log('Subscription error', err);
    }
  });
}
subscribe(planId: number) {

  const selectedPlan = this.plans.find(p => p.planId === planId);

  if (!selectedPlan) return;

  this.adminService.createOrder({
    planId: selectedPlan.planId,
    userId: this.userId
  }).subscribe({
    next: (res: any) => {
      this.openPayment(selectedPlan, res);
    },
    error: (err) => {
      console.log(err);
      Swal.fire('Error', 'Order creation failed', 'error');
    }
  });
}
openPayment(plan: any, orderData: any) {

  const options: any = {
    key: orderData.key,          // ✔ FROM BACKEND
    amount: orderData.amount,
    currency: "INR",
    order_id: orderData.orderId, // 🔥 IMPORTANT FIX

    name: "HRMS Subscription",
    description: plan.planName + " Plan",

    handler: (response: any) => {
      this.activateSubscription(plan.planId, response);
    },

    prefill: {
      name: "User Name",
      email: "user@gmail.com",
      contact: "9999999999"
    },

    theme: {
      color: "#dc2626"
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}
activateSubscription(planId: number, paymentResponse: any) {

  const payload = {
    userId: this.userId,
    planId: planId,
    paymentId: paymentResponse.razorpay_payment_id,
    orderId: paymentResponse.razorpay_order_id,
    signature: paymentResponse.razorpay_signature
  };

  this.adminService.activateSubscription(payload).subscribe({
    next: (res: any) => {

      Swal.fire('Success', 'Subscription Activated Successfully', 'success');

      this.loadSubscription(); // refresh UI
      this.loadInvoice();
    },
    error: (err) => {
      console.log(err);
      Swal.fire('Error', 'Payment done but activation failed', 'error');
    }
  });
}
getModules(planId:number):string[]{

 return this.planModules[planId] || [];

}
}
