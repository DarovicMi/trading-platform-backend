import { User } from "../entities/User";

export interface IUserService {
  existingUserEmail(
    email: string
  ): Promise<{ found: boolean; userId?: number }>;
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
