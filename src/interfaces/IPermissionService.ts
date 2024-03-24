import { Permission } from "../entities/Permission";

export interface IPermissionService {
  existingPermission(name: string): Promise<Boolean>;
  createPermission(name: string): Promise<Permission>;
  getAllPermissions(): Promise<Permission[]>;
  getPermissionById(id: number): Promise<Permission>;
  updatePermission(id: number, name: string): Promise<Permission>;
  deletePermission(id: number): Promise<void>;
}
