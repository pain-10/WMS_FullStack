import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  if (!token || authService.isTokenExpired(token)) {
    if (token && authService.isTokenExpired(token)) {
      authService.logout();
    }
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check role-based access if needed
  const requiredRoles = route.data?.['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = authService.userRole;
    if (!requiredRoles.includes(userRole)) {
      const fallback = userRole === 'Employee' ? '/my-attendance' : '/dashboard';
      router.navigate([fallback]);
      return false;
    }
  }
  return true;
};
