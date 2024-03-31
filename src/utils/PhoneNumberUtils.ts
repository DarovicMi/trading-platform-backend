import { PhoneNumberUtil } from "google-libphonenumber";
import { UserValidationError } from "../errors/user/UserValidationError";
import { UserFieldValidation } from "../constants/user/UserFieldValidation";

const phoneUtil = PhoneNumberUtil.getInstance();

export function validatePhoneNumber(phoneNumber: any): boolean {
  try {
    const number = phoneUtil.parse(phoneNumber);
    const isValid = phoneUtil.isValidNumber(number);
    const isPossible = phoneUtil.isPossibleNumber(number);
    if (!isValid && !isPossible) {
      throw new UserValidationError(
        UserFieldValidation.PHONE_NUMBER_VALIDATION
      );
    }
    return isValid && isPossible;
  } catch (error) {
    return false;
  }
}
