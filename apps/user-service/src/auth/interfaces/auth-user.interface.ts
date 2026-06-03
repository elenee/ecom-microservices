import { Roles } from "@app/auth/enums/role.enum";

export interface AuthUser {
  id: string;
  email: string;
  role: Roles;
}