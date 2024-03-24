import { AppDataSource } from "../config/DatabaseConfig";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import { UserValidationError } from "../errors/user/UserValidationError";
import { UserAlreadyExistsError } from "../errors/user/UserAlreadyExistsError";
import { UserErrorMessage } from "../constants/user/UserErrorMessage";
import { UserFieldValidation } from "../constants/user/UserFieldValidation";
import { IUserService } from "../interfaces/IUserService";
import { UserNotFoundError } from "../errors/user/UserNotFoundError";
import { Repository } from "typeorm";
import { Role } from "../entities/Role";
import { UserRoles } from "../constants/user/UserRoles";
import { UserDefaultRoleError } from "../errors/user/UserDefaultRoleError";
import { RoleNotFoundError } from "../errors/role-authorization/RoleNotFoundError";
import { RoleAuthorizationErrorMessage } from "../constants/role/RoleAuthorizationErrorMessage ";

export class UserService implements IUserService {
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
  }

  async existingUser(email: string): Promise<boolean> {
    const existingUser = await this.userRepository.findOneBy({ email: email });
    return existingUser ? true : false;
  }

  async createUser(user: Partial<User>): Promise<User> {
    if (
      !user ||
      !user.username ||
      !user.email ||
      !user.password ||
      !user.firstName ||
      !user.lastName
    ) {
      throw new UserValidationError(UserErrorMessage.USER_VALIDATION_ERROR);
    }

    const existingUser = await this.existingUser(user.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(UserErrorMessage.USER_EXISTS);
    }

    const encryptedPassword = await bcrypt.hash(
      user.password,
      UserFieldValidation.PASSWORD_ENCRYPTION_SALT_ROUNDS
    );

    const defaultRole = await this.roleRepository.findOneBy({
      name: UserRoles.USER,
    });
    if (!defaultRole) {
      throw new UserDefaultRoleError(
        UserErrorMessage.USER_DEFAULT_ROLE_NOT_FOUND
      );
    }

    const registeredUser = this.userRepository.create({
      ...user,
      password: encryptedPassword,
      role: defaultRole,
    });

    await this.userRepository.save(registeredUser);

    return registeredUser;
  }

  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UserNotFoundError(UserErrorMessage.USER_NOT_FOUND, userId);
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async updateUser(
    userId: number,
    updates: Partial<User>,
    newRoleId?: number
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["role"],
    });

    if (!existingUser) {
      throw new UserNotFoundError(UserErrorMessage.USER_NOT_FOUND, userId);
    }

    if (newRoleId !== undefined) {
      const newRole = await this.roleRepository.findOneBy({
        id: newRoleId,
      });
      if (!newRole) {
        throw new RoleNotFoundError(
          RoleAuthorizationErrorMessage.ROLE_NOT_FOUND
        );
      }
      existingUser.role = newRole;
    }
    const updatedUser = await this.userRepository.save({
      ...existingUser,
      ...updates,
    });

    return updatedUser;
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UserNotFoundError(UserErrorMessage.USER_NOT_FOUND, userId);
    }
    await this.userRepository.remove(user);
  }
}
