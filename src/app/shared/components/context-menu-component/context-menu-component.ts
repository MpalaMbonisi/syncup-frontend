import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  danger?: boolean;
  visible?: boolean;
}

@Component({
  selector: 'app-context-menu-component',
  imports: [],
  templateUrl: './context-menu-component.html',
  styleUrl: './context-menu-component.scss',
})
export class ContextMenuComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() position: 'left' | 'right' | 'top' | 'bottom' = 'right';

  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @Output() itemClicked = new EventEmitter<string>();

  isOpen: boolean = false;

  toggle(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.opened.emit();
    } else {
      this.closed.emit();
    }
  }

  open(): void {
    if (!this.isOpen) {
      this.toggle();
    }
  }

  close(): void {
    if (this.isOpen) {
      this.toggle();
    }
  }

  onTriggerClick(event: Event): void {
    event.stopPropagation();
    this.toggle();
  }

  onItemClick(item: MenuItem, event: Event): void {
    event.stopPropagation();

    if (item.disabled) {
      return;
    }

    this.itemClicked.emit(item.id);
    item.action();
    this.close();
  }

  getVisibleItems(): MenuItem[] {
    return this.menuItems.filter(item => item.visible !== false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.close();
    }
  }
}
