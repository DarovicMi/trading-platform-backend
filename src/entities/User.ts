import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import {
  IsNotEmpty,
  Length,
  IsString,
  Matches,
  IsEmail,
} from "class-validator";
import { UserErrorMessage } from "../constants/user/UserErrorMessage";
import { UserFieldValidation } from "../constants/user/UserFieldValidation";
import { Role } from "./Role";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsString()
  @Length(
    UserFieldValidation.USERNAME_MIN_LENGTH,
    UserFieldValidation.USERNAME_MAX_LENGTH
  )
  username: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsString()
  @Length(
    UserFieldValidation.EMAIL_MIN_LENGTH,
    UserFieldValidation.EMAIL_MAX_LENGTH
  )
  @IsEmail({}, { message: UserErrorMessage.USER_EMAIL_VALIDATION })
  email: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  @Length(
    UserFieldValidation.PASSWORD_MIN_LENGTH,
    UserFieldValidation.PASSWORD_MAX_LENGTH
  )
  @Matches(UserFieldValidation.PASSWORD_PATTERN, {
    message: UserErrorMessage.USER_PASSWORD_VALIDATION,
  })
  password: string;

  @Column({ name: "first_name" })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @Column({ name: "last_name" })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @Column({ type: "decimal", default: 0.0 })
  balance: number;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => Role)
  role: Role;

  @Column({ nullable: true, type: "varchar", length: 255 })
  activationToken: string | null;

  @Column({ nullable: true, type: "timestamp" })
  activationTokenExpires: Date | null;

  @Column({ nullable: true })
  refreshToken?: string;
}
