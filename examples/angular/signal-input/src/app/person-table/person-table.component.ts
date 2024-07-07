import { ChangeDetectionStrategy, Component, input, model } from '@angular/core'
import {
  FlexRenderDirective,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  injectTable,
} from '@tanstack/angular-table'
import type { ColumnDef, PaginationState } from '@tanstack/angular-table'
import type { Person } from '../makeData'

@Component({
  selector: 'app-person-table',
  templateUrl: 'person-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FlexRenderDirective],
})
export class PersonTableComponent {
  readonly data = input.required<Array<Person>>()

  readonly pagination = model.required<PaginationState>()

  readonly columns: Array<ColumnDef<Person>> = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.lastName,
      id: 'lastName',
      header: () => `Last Name`,
      cell: (info) => info.getValue(),
    },
  ]

  table = injectTable(() => {
    return {
      data: this.data(),
      columns: this.columns,
      state: {
        pagination: this.pagination(),
      },
      onPaginationChange: (updaterOrValue) => {
        typeof updaterOrValue === 'function'
          ? this.pagination.update(updaterOrValue)
          : this.pagination.set(updaterOrValue)
      },
      getExpandedRowModel: getExpandedRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      debugTable: true,
    }
  })

  onPageInputChange(event: any): void {
    const page = event.target.value ? Number(event.target.value) - 1 : 0
    this.table.setPageIndex(page)
  }

  onPageSizeChange(event: any) {
    this.table.setPageSize(Number(event.target.value))
  }
}
