import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  numberAttribute,
} from '@angular/core';

@Component({
  selector: 'vb-paginator',
  standalone: true,
  templateUrl: './vb-paginator.component.html',
  styleUrl: './vb-paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbPaginatorComponent {
  readonly page = model<number>(1);
  readonly totalItems = input(0, { transform: numberAttribute });
  readonly pageSize = input(10, { transform: numberAttribute });
  readonly ariaLabel = input('Pagination', { alias: 'aria-label' });

  protected readonly totalPages = computed(() => {
    const size = this.normalizedPageSize();
    return Math.max(1, Math.ceil(Math.max(0, this.totalItems()) / size));
  });

  protected readonly currentPage = computed(() => this.clampPage(this.page()));

  protected readonly rangeLabel = computed(() => {
    const total = Math.max(0, this.totalItems());
    if (total === 0) {
      return '0 of 0';
    }

    const size = this.normalizedPageSize();
    const start = (this.currentPage() - 1) * size + 1;
    const end = Math.min(this.currentPage() * size, total);
    return `${start}-${end} of ${total}`;
  });

  protected setPage(page: number): void {
    this.page.set(this.clampPage(page));
  }

  protected setPageFromInput(value: string): void {
    const page = Number.parseInt(value, 10);
    if (Number.isNaN(page)) {
      this.setPage(this.currentPage());
      return;
    }

    this.setPage(page);
  }

  private normalizedPageSize(): number {
    return Math.max(1, Math.floor(this.pageSize()));
  }

  private clampPage(page: number): number {
    const normalized = Number.isFinite(page) ? Math.floor(page) : 1;
    return Math.min(Math.max(normalized, 1), this.totalPages());
  }
}
