import { Pipe, PipeTransform } from '@angular/core';
import { toRem } from '../services/utils';

@Pipe({name: 'toRem'})
export class ToRemPipe implements PipeTransform {
  transform(value: number): string {
    return toRem(value);
  }
}