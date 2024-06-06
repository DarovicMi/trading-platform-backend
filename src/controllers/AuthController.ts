import { Request, Response } from "express";
import { AppDataSource } from "../config/DatabaseConfig";
import { User } from "../entities/User";
import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserErrorMessage } from "../constants/user/UserErrorMessage";
import { ServerErrorMessage } from "../constants/server/ServerErrorMessage";
import { AuthenticationErrorMessage } from "../constants/authentication/AuthenticationErrorMessage";
import { UserInformationalMessage } from "../constants/user/UserInformationalMessage";

const NODE_ENV = process.env.NODE_ENV === "production";

const JWT_SECRET = process.env.JWT_SECRET as string;

const JWT_ACCESS_TOKEN_STRING = process.env.JWT_ACCESS_TOKEN_STRING as string;
const JWT_ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY as string;
const JWT_REFRESH_TOKEN_STRING = process.env.JWT_REFRESH_TOKEN_STRING as string;
const JWT_REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY as string;

const JWT_COOKIE_ACCESS_TOKEN_MAX_AGE = process.env
  .JWT_COOKIE_ACCESS_TOKEN_MAX_AGE as string;

const JWT_COOKIE_REFRESH_TOKEN_MAX_AGE = process.env
  .JWT_COOKIE_REFRESH_TOKEN_MAX_AGE as string;

const JWT_COOKIE_REFRESH_TOKEN_PATH = process.env
  .JWT_COOKIE_REFRESH_TOKEN_PATH as string;

export class AuthController {
  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!(email && password)) {
        return res.status(400).json(UserErrorMessage.USER_VALIDATION_ERROR);
      }

      const userRepository = AppDataSource.getRepository(User);
      let user: User;

      try {
        user = await userRepository.findOneOrFail({
          where: { email },
          relations: ["role"],
        });
      } catch (error) {
        return res
          .status(401)
          .json({ message: UserErrorMessage.USER_NOT_FOUND });
      }

      if (!user.isActive) {
        return res
          .status(401)
          .json({ message: UserErrorMessage.USER_IS_INACTIVE });
      }

      if (!bcrypt.compareSync(password, user.password)) {
        return res
          .status(401)
          .json({ message: UserErrorMessage.USER_INVALID_CREDENTIALS });
      }

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role.name },
        JWT_SECRET,
        { expiresIn: JWT_ACCESS_TOKEN_EXPIRY }
      );

      res.cookie(JWT_ACCESS_TOKEN_STRING, accessToken, {
        httpOnly: true,
        secure: NODE_ENV,
        maxAge: parseInt(JWT_COOKIE_ACCESS_TOKEN_MAX_AGE),
        sameSite: "strict",
      });

      const refreshToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role.name },
        JWT_SECRET,
        { expiresIn: JWT_REFRESH_TOKEN_EXPIRY }
      );

      res.cookie(JWT_REFRESH_TOKEN_STRING, refreshToken, {
        httpOnly: true,
        secure: NODE_ENV,
        maxAge: parseInt(JWT_COOKIE_REFRESH_TOKEN_MAX_AGE),
        //   path: JWT_COOKIE_REFRESH_TOKEN_PATH,
        sameSite: "strict",
      });

      user.refreshToken = refreshToken;
      await userRepository.save(user);

      res.send({ accessToken, refreshToken });
    } catch (error) {
      res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  };

  static refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .send(AuthenticationErrorMessage.REFRESH_TOKEN_REQUIRED);
    }

    let jwtPayload;
    try {
      jwtPayload = <any>jwt.verify(refreshToken, JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .send(AuthenticationErrorMessage.REFRESH_TOKEN_INVALID);
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: jwtPayload.userId },
      relations: ["role"],
    });
    if (!user || user.refreshToken !== refreshToken) {
      return res
        .status(401)
        .send(AuthenticationErrorMessage.REFRESH_TOKEN_INVALID);
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.name },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_TOKEN_EXPIRY }
    );

    res.cookie(JWT_ACCESS_TOKEN_STRING, newAccessToken, {
      httpOnly: true,
      secure: NODE_ENV,
      maxAge: parseInt(JWT_COOKIE_ACCESS_TOKEN_MAX_AGE),
      sameSite: "none",
    });

    const newRefreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.name },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_TOKEN_EXPIRY }
    );

    res.cookie(JWT_REFRESH_TOKEN_STRING, newRefreshToken, {
      httpOnly: true,
      secure: NODE_ENV,
      maxAge: parseInt(JWT_COOKIE_REFRESH_TOKEN_MAX_AGE),
      path: JWT_COOKIE_REFRESH_TOKEN_PATH,
      sameSite: "none",
    });

    user.refreshToken = newRefreshToken;
    await userRepository.save(user);

    res.send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  };

  static getCurrentLoggedInUser = async (req: Request, res: Response) => {
    try {
      const token = req.cookies[JWT_ACCESS_TOKEN_STRING];
      if (!token) {
        return res
          .status(401)
          .send({ message: AuthenticationErrorMessage.NO_ACCESS_TOKEN });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = (decoded as jwt.JwtPayload).userId;
      if (!userId) {
        return res
          .status(401)
          .send({ message: AuthenticationErrorMessage.ACCESS_TOKEN_INVALID });
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({
        id: Number(userId),
      });
      if (!user) {
        return res
          .status(404)
          .send({ message: UserErrorMessage.USER_NOT_FOUND });
      }
      const { password, refreshToken, ...userDetails } = user;
      res.json(userDetails);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res
          .status(401)
          .send({ message: AuthenticationErrorMessage.ACCESS_TOKEN_EXPIRED });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res
          .status(401)
          .send({ message: AuthenticationErrorMessage.ACCESS_TOKEN_INVALID });
      }
      res.status(500).send({ message: ServerErrorMessage.SERVER_ERROR });
    }
  };

  static logout = async (req: Request, res: Response) => {
    try {
      const token = req.cookies[JWT_REFRESH_TOKEN_STRING];
      if (token) {
        const userRepository = AppDataSource.getRepository(User);
        const jwtPayload = jwt.verify(token, JWT_SECRET) as any;
        const user = await userRepository.findOneBy({ id: jwtPayload.userId });

        if (user) {
          user.refreshToken = "";
          await userRepository.save(user);
        }
      }

      res.cookie(JWT_ACCESS_TOKEN_STRING, "", {
        httpOnly: true,
        secure: NODE_ENV,
        maxAge: 0,
        sameSite: "none",
      });

      res.cookie(JWT_REFRESH_TOKEN_STRING, "", {
        httpOnly: true,
        secure: NODE_ENV,
        maxAge: 0,
        path: JWT_COOKIE_REFRESH_TOKEN_PATH,
        sameSite: "none",
      });

      return res
        .status(200)
        .send({ message: UserInformationalMessage.USER_LOGGED_OUT });
    } catch (error) {
      return res.status(500).send({ message: ServerErrorMessage.SERVER_ERROR });
    }
  };

  static isUserLoggedIn = async (req: Request, res: Response) => {
    try {
      const token = req.cookies[JWT_ACCESS_TOKEN_STRING];
      if (!token) {
        return res.status(200).send({
          message: AuthenticationErrorMessage.NO_ACCESS_TOKEN,
          loggedIn: false,
        });
      }

      jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
          return res.status(200).send({
            message: AuthenticationErrorMessage.ACCESS_TOKEN_INVALID,
            loggedIn: false,
          });
        }
        return res.status(200).json({ loggedIn: true });
      });
    } catch (error) {
      return res.status(500).send({ message: ServerErrorMessage.SERVER_ERROR });
    }
  };
}
