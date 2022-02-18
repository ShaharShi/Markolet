import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import * as moment from "moment";
import { ICategory } from "../models/category";
import { ECities, EUnits } from "../models/enums";

export function validateCity(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => 
    (Object.values(ECities) as string[]).includes(control.value) ?
      null :
    { typeErr: true }
}
export function validateUnit(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => 
    (Object.values(EUnits) as string[]).includes(control.value) ?
      null :
    { typeErr: true }
}
export function validateShippingDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => 
    !moment(control.value).isSameOrBefore(moment().add(8, 'hours')) ?
      null :
    { earlyShippingDate: true }
}
export function validateCategory(categories: ICategory[], categoryID: string): boolean {
  if (!categoryID) return false;
  const isCategory = categories.find(category => category._id === categoryID);
  return isCategory ? true : false;
}
export function validateCreditCard (control: AbstractControl): ValidationErrors | null {
  let results: ValidationErrors | null;
  const cc = control.value;
  switch (true) {
    case /^5326(1003)[0-9]{8}$|^5326(1011)[0-9]{8}$|^5326(1012)[0-9]{8}$|^5326(1013)[0-9]{8}$|^5326(1014)[0-9]{8}$|^5326(1103)[0-9]{8}$/.test(cc):
        // Israel Mastercard by isracard
        results = null;
      break;
    case /^5189(54)+[0-9]{10}$|5189(89)+[0-9]{10}$|5189(46)+[0-9]{10}$|5189(06)+[0-9]{10}$|5189(07)+[0-9]{10}$|5189(83)+[0-9]{10}$/.test(cc):
        // Israel Mastercard by cal
        results = null;
      break;
    case /^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(cc):
      // Mastercard
        results = null;
      break;
    case /^3[47][0-9]{13}$/.test(cc):
      // American Express
        results = null;
      break;
    case /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/.test(cc):
      // Diners Club Card
        results = null;
      break;
    case /^4[0-9]{12}(?:[0-9]{3})?$/.test(cc):
      // Visa
        results = null;
      break;
    case /^(5018|5020|5038|6304|6759|6761|6763)[0-9]{8,15}$/.test(cc):
      // Maestro Card
        results = null;
      break;
    case /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$/.test(cc):
      // Visa Master Card
        results = null;
      break;
    case /^4580+[0-9]{12}$|^4557+[0-9]{12}$/.test(cc):
      // Israel Visa
        results = null;
      break;

    default:
      results = { ccErr: true };
      break;
  }
  return results;
}