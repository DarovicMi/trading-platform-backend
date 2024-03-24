import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { User } from "../entities/User";
import { UserValidationError } from "../errors/user/UserValidationError";
import { UserAlreadyExistsError } from "../errors/user/UserAlreadyExistsError";
import { UserNotFoundError } from "../errors/user/UserNotFoundError";
import { UserInformationalMessage } from "../constants/user/UserInformationalMessage";
import { ServerErrorMessage } from "../constants/server/ServerErrorMessage";
import { UserRoles } from "../constants/user/UserRoles";
import { RoleAuthorizationErrorMessage } from "../constants/role/RoleAuthorizationErrorMessage ";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const user: User = req.body;
      const newUser = await this.userService.createUser(user);
      return res.status(201).json({
        message: UserInformationalMessage.USER_CREATED,
        data: newUser,
      });
    } catch (error) {
      if (
        error instanceof UserValidationError ||
        error instanceof UserAlreadyExistsError
      ) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const userId = parseInt(req.params.id);
      const user = await this.userService.getUserById(userId);
      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users: User[] = await this.userService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const userIdToUpdate = parseInt(req.params.id);
      const isAdmin = req.user?.role === UserRoles.ADMIN;
      const { roleId, ...userUpdates } = req.body;

      if ("role" in userUpdates && !isAdmin) {
        return res.status(403).json({
          message: RoleAuthorizationErrorMessage.ONLY_ADMINS_CAN_UPDATE_ROLES,
        });
      }

      const requestingUserId = req.user?.userId;
      if (!isAdmin && requestingUserId !== userIdToUpdate) {
        return res.status(403).json({
          message:
            RoleAuthorizationErrorMessage.ONLY_OWN_PROFILE_UPDATE_ALLOWED,
        });
      }

      const updatedUser = await this.userService.updateUser(
        userIdToUpdate,
        userUpdates,
        isAdmin && roleId ? roleId : undefined
      );
      const { password, refreshToken, ...userDetails } = updatedUser;

      return res.status(201).json({
        message: UserInformationalMessage.USER_UPDATED,
        data: userDetails,
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const requestingUserId = req.user?.userId;
      if (userId !== requestingUserId) {
        return res.status(403).json({
          message:
            RoleAuthorizationErrorMessage.ONLY_OWN_PROFILE_DELETE_ALLOWED,
        });
      }
      await this.userService.deleteUser(userId);
      return res
        .status(200)
        .json({ message: UserInformationalMessage.USER_DELETED });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }
}
