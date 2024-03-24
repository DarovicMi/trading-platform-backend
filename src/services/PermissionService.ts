// src/services/PermissionService.ts

import { AppDataSource } from "../config/DatabaseConfig";
import { Permission } from "../entities/Permission";
import { Repository } from "typeorm";
import { IPermissionService } from "../interfaces/IPermissionService";
import { PermissionNotFoundError } from "../errors/permission/PermissionNotFoundError";
import { PermissionErrorMessage } from "../constants/permission/PermissionErrorMessage";
import { PermissionAlreadyExistsError } from "../errors/permission/PermissionAlreadyExistsError";

export class PermissionService implements IPermissionService {
  private permissionRepository: Repository<Permission>;

  constructor() {
    this.permissionRepository = AppDataSource.getRepository(Permission);
  }

  async existingPermission(name: string): Promise<Boolean> {
    const existingPermission = await this.permissionRepository.findOneBy({
      name,
    });
    return Boolean(existingPermission);
  }

  async createPermission(name: string): Promise<Permission> {
    const existingPermission = await this.existingPermission(name);
    if (existingPermission) {
      throw new PermissionAlreadyExistsError(
        PermissionErrorMessage.PERMISSION_ALREADY_EXISTS
      );
    }

    const newPermission = this.permissionRepository.create({ name });
    await this.permissionRepository.save(newPermission);
    return newPermission;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async getPermissionById(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOneBy({ id });
    if (!permission) {
      throw new PermissionNotFoundError(
        PermissionErrorMessage.PERMISSION_NOT_FOUND
      );
    }
    return permission;
  }

  async updatePermission(id: number, name: string): Promise<Permission> {
    const permission = await this.getPermissionById(id);
    permission.name = name;
    await this.permissionRepository.save(permission);
    return permission;
  }

  async deletePermission(id: number): Promise<void> {
    const permission = await this.getPermissionById(id);
    await this.permissionRepository.remove(permission);
  }
}
