import { AppDataSource } from "../config/DatabaseConfig";
import { Role } from "../entities/Role";
import { Permission } from "../entities/Permission";
import { In, Repository } from "typeorm";
import { RoleAuthorizationErrorMessage } from "../constants/role/RoleAuthorizationErrorMessage";
import { RoleAlreadyExistsError } from "../errors/role-authorization/RoleAlreadyExistsError";
import { RoleNotFoundError } from "../errors/role-authorization/RoleNotFoundError";
import { IRoleService } from "../interfaces/IRoleService";
import { PermissionNotFoundError } from "../errors/permission/PermissionNotFoundError";
import { PermissionErrorMessage } from "../constants/permission/PermissionErrorMessage";

export class RoleService implements IRoleService {
  private roleRepository: Repository<Role>;
  private permissionRepository: Repository<Permission>;

  constructor() {
    this.roleRepository = AppDataSource.getRepository(Role);
    this.permissionRepository = AppDataSource.getRepository(Permission);
  }

  async existingRole(name: string): Promise<boolean> {
    const existingRole = await this.roleRepository.findOneBy({ name });
    return Boolean(existingRole);
  }

  async createRole(name: string, permissions: string[] = []): Promise<Role> {
    const existingRole = await this.existingRole(name);
    if (existingRole) {
      throw new RoleAlreadyExistsError(
        RoleAuthorizationErrorMessage.ROLE_ALREADY_EXISTS
      );
    }

    const permissionEntities = await this.permissionRepository.findBy({
      name: In(permissions),
    });

    if (!permissionEntities) {
      throw new PermissionNotFoundError(
        PermissionErrorMessage.PERMISSION_NOT_FOUND
      );
    }

    const newRole = this.roleRepository.create({
      name,
      permissions: permissionEntities,
    });

    await this.roleRepository.save(newRole);
    return newRole;
  }

  async updateRole(id: number, permissions: string[]): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ["permissions"],
    });
    if (!role) {
      throw new RoleNotFoundError(RoleAuthorizationErrorMessage.ROLE_NOT_FOUND);
    }

    const permissionEntities = await this.permissionRepository.findBy({
      name: In(permissions),
    });

    if (!permissionEntities) {
      throw new PermissionNotFoundError(
        PermissionErrorMessage.PERMISSION_NOT_FOUND
      );
    }

    role.permissions = permissionEntities;
    await this.roleRepository.save(role);
    return role;
  }

  async deleteRole(id: number) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new RoleNotFoundError(RoleAuthorizationErrorMessage.ROLE_NOT_FOUND);
    }

    await this.roleRepository.remove(role);
  }

  async listRoles() {
    return this.roleRepository.find({ relations: ["permissions"] });
  }
}

export default new RoleService();
