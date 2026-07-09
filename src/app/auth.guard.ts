import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);

  const userStr = sessionStorage.getItem('currentUser');

  if (!userStr || userStr === 'undefined') {
    router.navigate(['/login']);
    return false;
  }

  const user = JSON.parse(userStr);

  // 🔥 IF SUBSCRIPTION EXPIRED → FULL SCREEN SUBSCRIPTION PAGE
  if (user.subscriptionStatus === 'EXPIRED') {
    router.navigateByUrl('/admin/subscription');
    return false;
  }

  return true;
};