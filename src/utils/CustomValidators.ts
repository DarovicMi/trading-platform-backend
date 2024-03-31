import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from "class-validator";
import { validatePhoneNumber } from "./PhoneNumberUtils";
import { UserFieldValidation } from "../constants/user/UserFieldValidation";

@ValidatorConstraint({ async: true })
class IsPhoneNumberConstraint implements ValidatorConstraintInterface {
  validate(phoneNumber: any, args: ValidationArguments) {
    return validatePhoneNumber(phoneNumber);
  }

  defaultMessage(args: ValidationArguments) {
    return UserFieldValidation.PHONE_NUMBER_VALIDATION;
  }
}

export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneNumberConstraint,
    });
  };
}
