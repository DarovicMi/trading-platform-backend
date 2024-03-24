import { Request, Response } from "express";
import { RoleService } from "../services/RoleService"; // Update the path as necessary
import { RoleAlreadyExistsError } from "../errors/role-authorization/RoleAlreadyExistsError";
import { ServerErrorMessage } from "../constants/server/ServerErrorMessage";
import { RoleNotFoundError } from "../errors/role-authorization/RoleNotFoundError";

export class RoleController {
  private roleService: RoleService;

  constructor(roleService: RoleService) {
    this.roleService = roleService;
  }

  async createRole(req: Request, res: Response) {
    try {
      const { name, permissions } = req.body;
      const role = await this.roleService.createRole(name, permissions);
      return res.status(201).json(role);
    } catch (error) {
      if (error instanceof RoleAlreadyExistsError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const { permissions } = req.body;
      const { id } = req.params;
      const updatedRole = await this.roleService.updateRole(
        Number(id),
        permissions
      );
      return res.status(200).json(updatedRole);
    } catch (error) {
      if (error instanceof RoleNotFoundError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.roleService.deleteRole(Number(id));
      return res.status(204).send();
    } catch (error) {
      if (error instanceof RoleNotFoundError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async listRoles(req: Request, res: Response) {
    try {
      const roles = await this.roleService.listRoles();
      return res.status(200).json(roles);
    } catch (error) {
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }
}
