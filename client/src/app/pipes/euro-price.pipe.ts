import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyUtils } from '../utils/currency.utils';

@Pipe({
  name: 'euroPrice',
  standalone: true
})
export class EuroPricePipe implements PipeTransform {
  transform(value: string | number): string {
    return CurrencyUtils.formatPrice(value);
  }
}