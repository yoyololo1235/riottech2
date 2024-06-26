"use client";

import { ProductCell } from "@/components/table-custom-fuction/cell-orders";
import { CreatedAtCell } from "@/components/table-custom-fuction/common-cell";
import { FilterFn } from "@/components/table-custom-fuction/common-filter";
import { CreatedAtHeader } from "@/components/table-custom-fuction/common-header";
import { Checkbox } from "@/components/ui/checkbox";
import type { DataTableFilterableColumn, DataTableSearchableColumn, DataTableViewOptionsColumn } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { DisplayPdf } from "./display-pdf";

export type OrderColumnType = {
  id: string;
  isPaid: boolean;
  totalPrice: string;
  products: string;
  productsList: { name: string; quantity?: string }[];
  mailSend: boolean;
  pdfUrl: string;
  createdAt: Date;
};
export const OrdersColumn: ColumnDef<OrderColumnType>[] = [
  {
    accessorKey: "products",
    header: "Produits",
    cell: ProductCell,
  },
  {
    accessorKey: "totalPrice",
    header: "Prix total",
  },
  {
    accessorKey: "isPaid",
    header: "Payé",
    cell: ({ row }) => <Checkbox className="cursor-default self-center" checked={row.original.isPaid} />,
    filterFn: FilterFn,
  },
  {
    accessorKey: "pdfUrl",
    header: "Facture",
    cell: ({ row }) => <DisplayPdf avalaible={row.original.mailSend} pdfUrl={row.original.pdfUrl} />,
  },
  {
    accessorKey: "createdAt",
    header: CreatedAtHeader,
    cell: CreatedAtCell,
  },
];

export const searchableColumns: DataTableSearchableColumn<OrderColumnType>[] = [
  {
    id: "products",
    title: "Produits",
  },
];

export const filterableColumns: DataTableFilterableColumn<OrderColumnType>[] = [
  {
    id: "isPaid",
    title: "Payé",
    options: [
      { label: "Payé", value: "true" },
      { label: "Non Payé", value: "false" },
    ],
  },
];

export const viewOptionsColumns: DataTableViewOptionsColumn<OrderColumnType>[] = [
  {
    id: "products",
    title: "Produits",
  },

  {
    id: "totalPrice",
    title: "Prix total",
  },
  {
    id: "isPaid",
    title: "Payé",
  },
  {
    id: "pdfUrl",
    title: "Facture",
  },

  {
    id: "createdAt",
    title: "Date de création",
  },
];
