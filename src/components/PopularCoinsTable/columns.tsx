import { ICoinOverview } from "@/types/coinTypes";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<ICoinOverview>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "current_price",
    header: "Price",
    // cell: ({ row }) => {
    //   const amount = parseFloat(row.getValue("amount"));
    //   const formatted = new Intl.NumberFormat("en-US", {
    //     style: "currency",
    //     currency: "USD",
    //   }).format(amount);

    //   return <div className="">{formatted}</div>;
    // },
  },
  {
    accessorKey: "volume_24h",
    header: "24h Volume",
  },
  {
    accessorKey: "price_change_percentage_24h",
    header: "24H Change",
  },
  {
    accessorKey: "total_market_cap",
    header: "Market Cap",
  },
];
