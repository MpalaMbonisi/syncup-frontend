import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo-component',
  imports: [CommonModule],
  templateUrl: './logo-component.html',
  styleUrl: './logo-component.scss',
})
export class LogoComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
