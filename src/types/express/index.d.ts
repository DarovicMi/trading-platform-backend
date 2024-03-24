import { UserRoles } from "../entities/User";

declare global {
  namespace Express {
    interface User {
      id: number;
      role: UserRoles;
      userId: number;
    }

    interface Request {
      user?: User;
    }
  }
}
