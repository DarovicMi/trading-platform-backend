import { AppDataSource } from "../config/DatabaseConfig";
import { RoleAuthorizationErrorMessage } from "../constants/role/RoleAuthorizationErrorMessage ";
import { Role } from "../entities/Role";
import { RoleNotFoundError } from "../errors/role-authorization/RoleNotFoundError";

export class PermissionsManager {
  static async getPermissionsBasedOnRole(roleName: string): Promise<string[]> {
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository.findOne({
      where: { name: roleName },
      relations: ["permissions"],
    });

    if (!role) {
      throw new RoleNotFoundError(RoleAuthorizationErrorMessage.ROLE_NOT_FOUND);
    }

    return role.permissions.map((permission) => permission.name);
  }
}
