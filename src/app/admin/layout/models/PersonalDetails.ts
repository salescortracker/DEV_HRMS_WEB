export interface PersonalDetails {
  personalDetailsId?: number;

  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  personalEmail: string;
  permanentAddress: string;
  presentAddress: string;
  panNumber: string;
  aadhaarNumber: string;
  passportNumber: string;
  placeOfBirth: string;
  uan: string;
  bloodGroup: string;
  citizenship: string;
  religion: string;
  drivingLicence: string;
  maritalStatus: string;
  marriageDate: string;
  workPhone: string;
  linkedInProfile: string;
  previousExperience: string;

  profilePicture?: File | null;

  companyId: number;
  regionId: number;
  isActive: boolean;
}