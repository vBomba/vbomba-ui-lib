import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

export interface VbSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

let nextSelectId = 0;

@Component({
  selector: 'vb-select',
  standalone: true,
  templateUrl: './vb-select.component.html',
  styleUrl: './vb-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbSelectComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Two-way bound option value. */
  readonly value = model<string>('');

  /** When non-empty, options are rendered from this list; otherwise use projected `<option>` / `<optgroup>`. */
  readonly options = input<VbSelectOption[]>([]);

  readonly placeholder = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly id = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  protected readonly open = signal(false);
  protected readonly listboxId = `vb-select-listbox-${nextSelectId++}`;

  protected readonly selectedOption = computed(() =>
    this.options().find((opt) => opt.value === this.value()),
  );

  protected readonly displayLabel = computed(
    () => this.selectedOption()?.label ?? this.placeholder() ?? '',
  );

  protected readonly isPlaceholder = computed(() => !this.selectedOption());

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  protected onChange(sel: HTMLSelectElement): void {
    this.value.set(sel.value);
  }

  protected toggleOpen(): void {
    if (!this.disabled()) {
      this.open.update((open) => !open);
    }
  }

  protected selectOption(option: VbSelectOption): void {
    if (option.disabled) {
      return;
    }

    this.value.set(option.value);
    this.open.set(false);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    if (event.key === 'Escape') {
      this.open.set(false);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.open.set(true);
    }
  }
}
