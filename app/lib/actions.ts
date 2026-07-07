"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import postgres from "postgres";
import { redirect } from "next/navigation";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

const Invoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  try {
    const { customerId, amount, status } = Invoice.parse({
      customerId: formData.get("customerId"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split("T")[0];

    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
    revalidatePath("/dashboard/invoices");
  } catch {
    console.error("Error creating invoice");
    return;
  }
  redirect("/dashboard/invoices");
}

export async function updateInvoice(id: string, formData: FormData) {
  try {
    const { customerId, amount, status } = Invoice.parse({
      customerId: formData.get("customerId"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    });

    const amountInCents = amount * 100;

    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

    revalidatePath("/dashboard/invoices");
  } catch {
    console.error("Error updating invoice");
  }
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string, formData: FormData) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;

    revalidatePath("/dashboard/invoices");
  } catch {
    console.error("Error deleting invoice");
    return;
  }
}
