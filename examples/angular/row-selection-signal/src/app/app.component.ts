import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  viewChild,
} from '@angular/core'
import {
  FlexRenderDirective,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  injectTable,
} from '@tanstack/angular-table'
import { FilterComponent } from './filter'
import { type Person, makeData } from './makeData'
import {
  TableHeadSelectionComponent,
  TableRowSelectionComponent,
} from './selection-column.component'
import type { ColumnDef, RowSelectionState } from '@tanstack/angular-table'
import type { TemplateRef } from '@angular/core'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FilterComponent, FlexRenderDirective],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly rowSelection = signal<RowSelectionState>({})
  readonly globalFilter = signal<string>('')
  readonly data = signal(makeData(10_000))

  readonly ageHeaderCell =
    viewChild.required<TemplateRef<unknown>>('ageHeaderCell')

  readonly columns: Array<ColumnDef<Person>> = [
    {
      id: 'select',
      header: () => TableHeadSelectionComponent<Person>,
      cell: () => TableRowSelectionComponent<Person>,
    },
    {
      header: 'Name',
      footer: (props) => props.column.id,
      columns: [
        {
          accessorKey: 'firstName',
          cell: (info) => info.getValue(),
          footer: (props) => props.column.id,
          header: 'First name',
        },
        {
          accessorFn: (row) => row.lastName,
          id: 'lastName',
          cell: (info) => info.getValue(),
          header: () => 'Last Name',
          footer: (props) => props.column.id,
        },
      ],
    },
    {
      header: 'Info',
      footer: (props) => props.column.id,
      columns: [
        {
          accessorKey: 'age',
          header: () => this.ageHeaderCell(),
          footer: (props) => props.column.id,
        },
        {
          header: 'More Info',
          columns: [
            {
              accessorKey: 'visits',
              header: () => 'Visits',
              footer: (props) => props.column.id,
            },
            {
              accessorKey: 'status',
              header: 'Status',
              footer: (props) => props.column.id,
            },
            {
              accessorKey: 'progress',
              header: 'Profile Progress',
              footer: (props) => props.column.id,
            },
          ],
        },
      ],
    },
  ]

  table = injectTable(() => ({
    data: this.data(),
    columns: this.columns,
    state: {
      rowSelection: this.rowSelection(),
    },
    enableRowSelection: true, // enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    onRowSelectionChange: (updaterOrValue) => {
      this.rowSelection.set(
        typeof updaterOrValue === 'function'
          ? updaterOrValue(this.rowSelection())
          : updaterOrValue,
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  }))

  readonly stringifiedRowSelection = computed(() =>
    JSON.stringify(this.rowSelection(), null, 2),
  )

  readonly rowSelectionLength = computed(
    () => Object.keys(this.rowSelection()).length,
  )

  onPageInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement
    const page = inputElement.value ? Number(inputElement.value) - 1 : 0
    this.table.setPageIndex(page)
  }

  onPageSizeChange(event: any): void {
    this.table.setPageSize(Number(event.target.value))
  }

  logSelectedFlatRows(): void {
    console.info(
      'table.getSelectedRowModel().flatRows',
      this.table.getSelectedRowModel().flatRows,
    )
  }

  refreshData(): void {
    this.data.set(makeData(10_000))
  }
}
