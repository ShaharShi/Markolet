import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeWord'
})
export class CapitalizeWordPipe implements PipeTransform {

  transform(word: string, seperator: string): string {
    if (!word) return word;
    if (word.includes(seperator)) {
      let fword = word.split(seperator)[0];
      let sword = word.split(seperator)[1];
      return `${fword[0].toUpperCase()}${fword.substring(1).toLowerCase()}${seperator}${sword[0].toUpperCase()}${sword.substring(1).toLowerCase()}`;
    } else {
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    }
  }

}
