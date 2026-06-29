export type FieldType = "text" | "number" | "date" | "select";

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  /** ref another table for dropdown: { table, valueKey, labelKey } */
  ref?: { table: string; valueKey: string; labelKey: string };
  hideInForm?: boolean; // e.g. PK
}

export interface TableConfig {
  slug: string;
  name: string;        // table name in DB
  title: string;       // display title
  singular: string;
  pk: string;
  fields: FieldConfig[];
  defaultSort?: { column: string; ascending: boolean };
}

export const TABLES: Record<string, TableConfig> = {
  customers: {
    slug: "customers", name: "customers", title: "Customers", singular: "Customer", pk: "customer_id",
    fields: [
      { key: "customer_id", label: "ID", type: "number", hideInForm: true },
      { key: "full_name", label: "Full Name", type: "text", required: true },
      { key: "phone_number", label: "Phone", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "address", label: "Address", type: "text" },
    ],
    defaultSort: { column: "customer_id", ascending: false },
  },
  suppliers: {
    slug: "suppliers", name: "suppliers", title: "Suppliers", singular: "Supplier", pk: "supplier_id",
    fields: [
      { key: "supplier_id", label: "ID", type: "number", hideInForm: true },
      { key: "supplier_name", label: "Name", type: "text", required: true },
      { key: "contact_number", label: "Contact", type: "text" },
      { key: "address", label: "Address", type: "text" },
    ],
    defaultSort: { column: "supplier_id", ascending: false },
  },
  "raw-materials": {
    slug: "raw-materials", name: "raw_materials", title: "Raw Materials", singular: "Material", pk: "material_id",
    fields: [
      { key: "material_id", label: "ID", type: "number", hideInForm: true },
      { key: "material_name", label: "Material", type: "text", required: true },
      { key: "quantity_available", label: "Quantity", type: "number", required: true },
      { key: "cost", label: "Cost", type: "number", required: true },
      { key: "supplier_id", label: "Supplier", type: "select", ref: { table: "suppliers", valueKey: "supplier_id", labelKey: "supplier_name" } },
    ],
    defaultSort: { column: "material_id", ascending: false },
  },
  products: {
    slug: "products", name: "products", title: "Products", singular: "Product", pk: "product_id",
    fields: [
      { key: "product_id", label: "ID", type: "number", hideInForm: true },
      { key: "product_name", label: "Name", type: "text", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "brand", label: "Brand", type: "text" },
      { key: "price", label: "Price (Rs)", type: "number", required: true },
      { key: "stock_quantity", label: "Stock", type: "number", required: true },
    ],
    defaultSort: { column: "product_id", ascending: false },
  },
  employees: {
    slug: "employees", name: "employees", title: "Employees", singular: "Employee", pk: "employee_id",
    fields: [
      { key: "employee_id", label: "ID", type: "number", hideInForm: true },
      { key: "employee_name", label: "Name", type: "text", required: true },
      { key: "position", label: "Position", type: "text" },
      { key: "salary", label: "Salary (Rs)", type: "number", required: true },
    ],
    defaultSort: { column: "employee_id", ascending: false },
  },
  orders: {
    slug: "orders", name: "orders", title: "Orders", singular: "Order", pk: "order_id",
    fields: [
      { key: "order_id", label: "ID", type: "number", hideInForm: true },
      { key: "customer_id", label: "Customer", type: "select", ref: { table: "customers", valueKey: "customer_id", labelKey: "full_name" } },
      { key: "order_date", label: "Date", type: "date", required: true },
      { key: "total_amount", label: "Total (Rs)", type: "number", required: true },
      { key: "order_status", label: "Status", type: "select", options: [
        { value: "Pending", label: "Pending" },
        { value: "Completed", label: "Completed" },
        { value: "Delivered", label: "Delivered" },
        { value: "Cancelled", label: "Cancelled" },
      ] },
    ],
    defaultSort: { column: "order_id", ascending: false },
  },
  "order-details": {
    slug: "order-details", name: "order_details", title: "Order Details", singular: "Line Item", pk: "order_detail_id",
    fields: [
      { key: "order_detail_id", label: "ID", type: "number", hideInForm: true },
      { key: "order_id", label: "Order", type: "select", ref: { table: "orders", valueKey: "order_id", labelKey: "order_id" }, required: true },
      { key: "product_id", label: "Product", type: "select", ref: { table: "products", valueKey: "product_id", labelKey: "product_name" } },
      { key: "quantity", label: "Quantity", type: "number", required: true },
      { key: "unit_price", label: "Unit Price", type: "number", required: true },
    ],
    defaultSort: { column: "order_detail_id", ascending: false },
  },
  production: {
    slug: "production", name: "production", title: "Production", singular: "Production Log", pk: "production_id",
    fields: [
      { key: "production_id", label: "ID", type: "number", hideInForm: true },
      { key: "product_id", label: "Product", type: "select", ref: { table: "products", valueKey: "product_id", labelKey: "product_name" } },
      { key: "employee_id", label: "Employee", type: "select", ref: { table: "employees", valueKey: "employee_id", labelKey: "employee_name" } },
      { key: "production_date", label: "Date", type: "date", required: true },
      { key: "quantity_produced", label: "Quantity Produced", type: "number", required: true },
    ],
    defaultSort: { column: "production_id", ascending: false },
  },
  inventory: {
    slug: "inventory", name: "inventory", title: "Inventory", singular: "Inventory Entry", pk: "inventory_id",
    fields: [
      { key: "inventory_id", label: "ID", type: "number", hideInForm: true },
      { key: "product_id", label: "Product", type: "select", ref: { table: "products", valueKey: "product_id", labelKey: "product_name" } },
      { key: "available_stock", label: "Available Stock", type: "number", required: true },
      { key: "last_updated", label: "Last Updated", type: "date", required: true },
    ],
    defaultSort: { column: "inventory_id", ascending: false },
  },
  payments: {
    slug: "payments", name: "payments", title: "Payments", singular: "Payment", pk: "payment_id",
    fields: [
      { key: "payment_id", label: "ID", type: "number", hideInForm: true },
      { key: "order_id", label: "Order", type: "select", ref: { table: "orders", valueKey: "order_id", labelKey: "order_id" }, required: true },
      { key: "amount", label: "Amount (Rs)", type: "number", required: true },
      { key: "payment_method", label: "Method", type: "select", options: [
        { value: "Cash", label: "Cash" },
        { value: "Card", label: "Card" },
        { value: "Bank Transfer", label: "Bank Transfer" },
        { value: "EasyPaisa", label: "EasyPaisa" },
        { value: "JazzCash", label: "JazzCash" },
      ] },
      { key: "payment_date", label: "Date", type: "date", required: true },
    ],
    defaultSort: { column: "payment_id", ascending: false },
  },
};

export const TABLE_LIST = Object.values(TABLES);
