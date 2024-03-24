import { Request, Response } from "express";
import { PermissionService } from "../services/PermissionService"; // Adjust the import path as necessary
import { PermissionAlreadyExistsError } from "../errors/permission/PermissionAlreadyExistsError";
import { ServerErrorMessage } from "../constants/server/ServerErrorMessage";
import { PermissionNotFoundError } from "../errors/permission/PermissionNotFoundError";

export class PermissionController {
  private permissionService: PermissionService;

  constructor(permissionService: PermissionService) {
    this.permissionService = permissionService;
  }

  async createPermission(req: Request, res: Response): Promise<Response> {
    try {
      const { name } = req.body;
      const permission = await this.permissionService.createPermission(name);
      return res.status(201).json(permission);
    } catch (error) {
      if (error instanceof PermissionAlreadyExistsError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async getAllPermissions(req: Request, res: Response): Promise<Response> {
    try {
      const permissions = await this.permissionService.getAllPermissions();
      return res.status(200).json(permissions);
    } catch (error) {
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async getPermissionById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const permission = await this.permissionService.getPermissionById(id);
      return res.status(200).json(permission);
    } catch (error) {
      if (error instanceof PermissionNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async updatePermission(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      const updatedPermission = await this.permissionService.updatePermission(
        id,
        name
      );
      return res.status(200).json(updatedPermission);
    } catch (error) {
      if (error instanceof PermissionNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async deletePermission(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      await this.permissionService.deletePermission(id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof PermissionNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }
}
