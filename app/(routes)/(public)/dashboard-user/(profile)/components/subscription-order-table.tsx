"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "./data-table";
import {
  SubscriptionOrderColumn,
  SubscriptionOrderColumnType,
} from "./subscription-order-column";

interface SubscriptionOrderTableProps {
  data: SubscriptionOrderColumnType[];
}

export const SubscriptionOrderTable: React.FC<SubscriptionOrderTableProps> = ({
  data,
}) => {
  return (
    <>
      <Heading
        title={`Abonnements (${data.length})`}
        description="Résumé des abonnements"
      />
      <Separator />
      <DataTable
        searchKey="subscription"
        columns={SubscriptionOrderColumn}
        initialData={data}
      />
    </>
  );
};
