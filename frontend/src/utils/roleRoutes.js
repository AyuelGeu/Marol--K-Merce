const dashboardPaths = {
  admin: '/admin/dashboard',
  vendor: '/vendor/dashboard',
  customer: '/customer/dashboard'
};

export function getDashboardPath(role) {
  return dashboardPaths[role] || null;
}
