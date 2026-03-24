export const commonConstants = {
 get employeeCode() {
    return sessionStorage.getItem('EmployeeCode') || '';
  },
  get employeeName() {
    return sessionStorage.getItem('Name') || '';
  }
};