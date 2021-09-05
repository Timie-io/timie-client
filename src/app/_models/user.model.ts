export interface User {
  email: string;
  name: string;
  isAdmin: boolean;
  jwtToken?: string;
}
