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
import { RoleAuthorizationErrorMessage } from "../constants/role/RoleAuthorizationErrorMessage";
import { v4 as uuidv4 } from "uuid";
import { EmailService } from "./EmailService";
import { ValidateUser } from "../utils/ValidateUser";

export class UserService implements IUserService {
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
  }

  async existingUserEmail(
    email: string
  ): Promise<{ found: boolean; id?: number }> {
    const existingUser = await this.userRepository.findOneBy({ email: email });

    if (existingUser) {
      return { found: true, id: existingUser.id };
    }
    return { found: false };
  }

  async existingUserName(
    username: string
  ): Promise<{ found: boolean; id?: number }> {
    const existingUser = await this.userRepository.findOneBy({
      username: username,
    });
    if (existingUser) {
      return { found: true, id: existingUser.id };
    }
    return { found: false };
  }

  private async ensureUniqueUser(
    email: string,
    username: string
  ): Promise<void> {
    const emailExists = await this.existingUserEmail(email);
    if (emailExists.found) {
      throw new UserAlreadyExistsError(UserErrorMessage.USER_EMAIL_EXISTS);
    }

    const usernameExists = await this.existingUserName(username);
    if (usernameExists.found) {
      throw new UserAlreadyExistsError(
        UserErrorMessage.USERNAME_ALREADY_EXISTS
      );
    }
  }

  private async createUser(userInput: Partial<User>): Promise<User> {
    if (userInput.password === undefined) {
      throw new UserValidationError(UserErrorMessage.USER_VALIDATION_ERROR);
    }
    const encryptedPassword = await bcrypt.hash(
      userInput.password,
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

    const activationToken = this.createActivationToken();
    const activationTokenExpiry = new Date(
      new Date().getTime() + 60 * 60 * 1000
    );

    return this.userRepository.create({
      ...userInput,
      password: encryptedPassword,
      role: defaultRole,
      activationToken,
      activationTokenExpires: activationTokenExpiry,
      isActive: false,
    });
  }

  async saveUser(user: Partial<User>): Promise<User> {
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

    await ValidateUser.validateUserInput(user);

    await this.ensureUniqueUser(user.email, user.username);

    const userInput = await this.createUser(user);
    await this.userRepository.save(userInput);

    await EmailService.sendActivationEmail(userInput);

    return userInput;
  }

  private createActivationToken(): string {
    return uuidv4();
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

    if (updates.email && updates.email !== existingUser.email) {
      const { found, id } = await this.existingUserEmail(updates.email);
      if (found && id !== userId) {
        throw new UserAlreadyExistsError(UserErrorMessage.USER_EMAIL_EXISTS);
      }
    }

    if (updates.username && updates.username !== existingUser.username) {
      const { found, id } = await this.existingUserName(updates.username);
      if (found && id !== userId) {
        throw new UserAlreadyExistsError(
          UserErrorMessage.USERNAME_ALREADY_EXISTS
        );
      }
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
