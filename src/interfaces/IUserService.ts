import { User } from "../entities/User";

export interface IUserService {
  existingUser(email: string): Promise<boolean>;
  createUser(user: Partial<User>): Promise<User>;
  getUserById(userId: number): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(
    userId: number,
    updates: Partial<User>,
    newRoleId?: number
  ): Promise<User>;
  deleteUser(userId: number): Promise<void>;
}
