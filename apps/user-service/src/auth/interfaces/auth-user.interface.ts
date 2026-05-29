import { Roles } from '../enums/role.enum';

export interface AuthUser {
  id: string;
  email: string;
  role: Roles;
}