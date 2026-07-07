import CustomersTable from "@/app/ui/customers/table";
import { fetchCustomersPages } from "@/app/lib/data";
import Pagination from "@/app/ui/invoices/pagination";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchCustomersPages(query);
  return (
    <>
      <CustomersTable query={query} currentPage={currentPage}></CustomersTable>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </>
  );
}
