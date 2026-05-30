import type { ReactNode } from 'react';

type Column<T> = {
  readonly key: string;
  readonly header: string;
  readonly render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  readonly columns: readonly Column<T>[];
  readonly rows: readonly T[];
  readonly emptyText: string;
};

export const DataTable = <T,>({ columns, rows, emptyText }: DataTableProps<T>) => (
  <div className="table-wrap">
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((column) => <th key={column.key} scope="col">{column.header}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={columns.length}>{emptyText}</td></tr>
        ) : rows.map((row, index) => (
          <tr key={index}>
            {columns.map((column) => <td key={column.key}>{column.render(row)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
