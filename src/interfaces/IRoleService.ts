import { Role } from "../entities/Role";

export interface IRoleService {
  existingRole(name: string): Promise<boolean>;
  createRole(name: string, permissions: string[]): Promise<Role>;
  updateRole(id: number, permissions: string[]): Promise<Role>;
  deleteRole(id: number): Promise<void>;
}
