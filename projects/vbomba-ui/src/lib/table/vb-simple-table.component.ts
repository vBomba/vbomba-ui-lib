import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import { MatSortModule, type Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { VbPaginatorComponent } from '../paginator/vb-paginator.component';

export interface VbSimpleTableColumn {
  key: string;
  label: string;
  /** When false, column has no sort control (default: true). */
  sortable?: boolean;
}

@Component({
  selector: 'vb-simple-table',
  standalone: true,
  imports: [MatTableModule, MatSortModule, VbPaginatorComponent],
  templateUrl: './vb-simple-table.component.html',
  styleUrl: './vb-simple-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbSimpleTableComponent {
  readonly columns = input.required<VbSimpleTableColumn[]>();
  readonly rows = input.required<Record<string, unknown>[]>();
  readonly pagination = input(false, { transform: booleanAttribute });
  readonly pageSize = input(5, { transform: numberAttribute });
  readonly page = model<number>(1);

  private readonly sortState = signal<Sort>({ active: '', direction: '' });

  protected readonly displayedRows = computed(() => {
    const rows = this.sortedRows();
    if (!this.pagination()) {
      return rows;
    }

    const size = this.normalizedPageSize();
    const start = (this.currentPage() - 1) * size;
    return rows.slice(start, start + size);
  });

  private readonly sortedRows = computed(() => {
    const sort = this.sortState();
    const rows = [...this.rows()];

    if (!sort.active || sort.direction === '') {
      return rows;
    }

    return rows.sort((a, b) => {
      const aValue = this.sortValue(a, sort.active);
      const bValue = this.sortValue(b, sort.active);
      const compare = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sort.direction === 'asc' ? compare : -compare;
    });
  });

  private readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.rows().length / this.normalizedPageSize())),
  );

  private readonly currentPage = computed(() => this.clampPage(this.page()));

  protected columnKeys(): string[] {
    return this.columns().map((c) => c.key);
  }

  protected isSortable(col: VbSimpleTableColumn): boolean {
    return col.sortable !== false;
  }

  protected onSortChange(sort: Sort): void {
    this.sortState.set(sort);
  }

  private sortValue(row: Record<string, unknown>, columnId: string): string | number {
    const value = row[columnId];
    if (value == null) return '';
    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value ? 1 : 0;
    return String(value).toLowerCase();
  }

  private normalizedPageSize(): number {
    return Math.max(1, Math.floor(this.pageSize()));
  }

  private clampPage(page: number): number {
    const normalized = Number.isFinite(page) ? Math.floor(page) : 1;
    return Math.min(Math.max(normalized, 1), this.totalPages());
  }
}
