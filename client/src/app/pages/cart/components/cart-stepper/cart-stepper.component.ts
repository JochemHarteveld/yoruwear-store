import { Component, input } from '@angular/core';

@Component({
  selector: 'app-cart-stepper',
  standalone: true,
  templateUrl: './cart-stepper.component.html',
  styleUrl: './cart-stepper.component.css'
})
export class CartStepperComponent {
  currentStep = input.required<number>();
}