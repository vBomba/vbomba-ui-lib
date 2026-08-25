import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { VbInputComponent } from '../input/vb-input.component';
import type { VbTreePageNode, VbTreePageSelectionMode } from './vb-tree-page-node';

interface VbTreePageFlatRow {
  node: VbTreePageNode;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

function collectExpandableIds(nodes: VbTreePageNode[], into: Set<string> = new Set()): Set<string> {
  for (const node of nodes) {
    if (node.children?.length) {
      into.add(node.id);
      collectExpandableIds(node.children, into);
    }
  }
  return into;
}

function nodeMatchesQuery(node: VbTreePageNode, query: string): boolean {
  return (
    node.label.toLowerCase().includes(query) ||
    (node.description?.toLowerCase().includes(query) ?? false)
  );
}

/**
 * Keep nodes that match `query` (or have matching descendants).
 * Matching parents keep their full child list; otherwise only matching branches.
 */
function filterTreeNodes(nodes: VbTreePageNode[], query: string): VbTreePageNode[] {
  if (!query) {
    return nodes;
  }
  const out: VbTreePageNode[] = [];
  for (const node of nodes) {
    const selfMatch = nodeMatchesQuery(node, query);
    const filteredChildren = node.children?.length
      ? filterTreeNodes(node.children, query)
      : [];
    if (!selfMatch && !filteredChildren.length) {
      continue;
    }
    if (selfMatch && node.children?.length) {
      out.push({ ...node, children: node.children });
    } else if (filteredChildren.length) {
      out.push({ ...node, children: filteredChildren });
    } else {
      out.push({ ...node, children: undefined });
    }
  }
  return out;
}

@Component({
  selector: 'vb-tree-page-picker',
  standalone: true,
  imports: [VbInputComponent],
  templateUrl: './vb-tree-page-picker.component.html',
  styleUrl: './vb-tree-page-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VbTreePagePickerComponent {
  readonly nodes = input<VbTreePageNode[]>([]);
  /**
   * `single` — one page (`value`). `multiple` — several pages (`values`); UI ready for checkboxes.
   */
  readonly selectionMode = input<VbTreePageSelectionMode>('single');
  /** Selected page id when {@link selectionMode} is `single`. */
  readonly value = model<string | null>(null);
  /** Selected page ids when {@link selectionMode} is `multiple` (also mirrored in single as 0–1 ids). */
  readonly values = model<string[]>([]);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Expand every branch that has children on first bind / when the tree identity changes. */
  readonly expandAll = input(true, { transform: booleanAttribute });
  /**
   * Show a search field that filters by `label` / `description` (case-insensitive).
   * Matching branches stay visible; nest depth is unlimited (`children` recursively).
   */
  readonly filterable = input(false, { transform: booleanAttribute });
  /** Two-way filter text when {@link filterable} is on. */
  readonly filterQuery = model('');
  readonly filterPlaceholder = input('Filter pages…');
  readonly filterAriaLabel = input('Filter pages');
  readonly filterEmptyLabel = input('No matching pages');
  readonly emptyLabel = input('No pages');
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  private readonly expandedIds = signal<Set<string>>(new Set());
  private readonly seededForNodes = signal<VbTreePageNode[] | null>(null);

  protected readonly activeFilter = computed(() =>
    this.filterable() ? this.filterQuery().trim().toLowerCase() : '',
  );

  protected readonly displayNodes = computed((): VbTreePageNode[] => {
    const query = this.activeFilter();
    return query ? filterTreeNodes(this.nodes(), query) : this.nodes();
  });

  protected readonly rows = computed((): VbTreePageFlatRow[] => {
    const expanded = this.expandedIds();
    const forceExpand = !!this.activeFilter();
    const out: VbTreePageFlatRow[] = [];

    const walk = (list: VbTreePageNode[], depth: number): void => {
      for (const node of list) {
        const hasChildren = !!node.children?.length;
        const isExpanded = hasChildren && (forceExpand || expanded.has(node.id));
        out.push({ node, depth, hasChildren, expanded: isExpanded });
        if (hasChildren && isExpanded) {
          walk(node.children!, depth + 1);
        }
      }
    };

    walk(this.displayNodes(), 0);
    return out;
  });

  constructor() {
    effect(() => {
      const nodes = this.nodes();
      const expandAll = this.expandAll();
      if (!expandAll) {
        return;
      }
      if (this.seededForNodes() === nodes) {
        return;
      }
      untracked(() => {
        this.expandedIds.set(collectExpandableIds(nodes));
        this.seededForNodes.set(nodes);
      });
    });
  }

  protected isSelected(nodeId: string): boolean {
    if (this.selectionMode() === 'single') {
      return this.value() === nodeId;
    }
    return this.values().includes(nodeId);
  }

  protected toggleExpanded(nodeId: string, event: Event): void {
    event.stopPropagation();
    if (this.disabled() || this.activeFilter()) {
      // While filtering, branches stay expanded so matches remain visible.
      return;
    }
    this.expandedIds.update((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }

  protected onRowActivate(node: VbTreePageNode): void {
    if (this.disabled() || node.disabled) {
      return;
    }
    if (this.selectionMode() === 'single') {
      this.value.set(node.id);
      this.values.set([node.id]);
      return;
    }
    this.values.update((ids) => {
      if (ids.includes(node.id)) {
        return ids.filter((id) => id !== node.id);
      }
      return [...ids, node.id];
    });
    const next = this.values();
    this.value.set(next.length ? next[next.length - 1]! : null);
  }

  protected onRowKeydown(event: KeyboardEvent, node: VbTreePageNode): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onRowActivate(node);
    }
  }

  protected rowTitle(node: VbTreePageNode): string {
    return node.description?.trim() ? `${node.label} — ${node.description}` : node.label;
  }
}
