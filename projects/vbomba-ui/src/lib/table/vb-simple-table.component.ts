import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

export interface VbSimpleTableColumn {
  key: string;
  label: string;
  /** When false, column has no sort control (default: true). */
  sortable?: boolean;
}

@Component({
  selector: 'vb-simple-table',
  standalone: true,
  imports: [MatTableModule, MatSortModule],
  templateUrl: './vb-simple-table.component.html',
  styleUrl: './vb-simple-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbSimpleTableComponent {
  readonly columns = input.required<VbSimpleTableColumn[]>();
  readonly rows = input.required<Record<string, unknown>[]>();

  private readonly sort = viewChild(MatSort);
  protected readonly dataSource: MatTableDataSource<Record<string, unknown>> =
    new MatTableDataSource<Record<string, unknown>>([]);

  constructor() {
    this.dataSource.sortingDataAccessor = (
      row: Record<string, unknown>,
      columnId: string,
    ): string | number => {
      const v = row[columnId];
      if (v == null) return '';
      if (typeof v === 'number') return v;
      if (typeof v === 'boolean') return v ? 1 : 0;
      return String(v).toLowerCase();
    };
    effect(() => {
      this.dataSource.data = [...this.rows()];
      const s = this.sort();
      if (s) {
        this.dataSource.sort = s;
      }
    });
  }

  protected columnKeys(): string[] {
    return this.columns().map((c) => c.key);
  }

  protected isSortable(col: VbSimpleTableColumn): boolean {
    return col.sortable !== false;
  }
}
