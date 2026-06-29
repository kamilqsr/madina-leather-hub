
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','staff');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile + assign first user as admin, others as staff
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count int;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  SELECT count(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'staff');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Business tables
CREATE TABLE public.customers (
  customer_id bigserial PRIMARY KEY,
  full_name text NOT NULL,
  phone_number text UNIQUE,
  email text UNIQUE,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.suppliers (
  supplier_id bigserial PRIMARY KEY,
  supplier_name text NOT NULL,
  contact_number text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.raw_materials (
  material_id bigserial PRIMARY KEY,
  material_name text NOT NULL,
  quantity_available int NOT NULL DEFAULT 0,
  cost numeric(10,2) NOT NULL DEFAULT 0,
  supplier_id bigint REFERENCES public.suppliers(supplier_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  product_id bigserial PRIMARY KEY,
  product_name text NOT NULL,
  category text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  stock_quantity int NOT NULL DEFAULT 0,
  brand text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.employees (
  employee_id bigserial PRIMARY KEY,
  employee_name text NOT NULL,
  position text,
  salary numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  order_id bigserial PRIMARY KEY,
  customer_id bigint REFERENCES public.customers(customer_id) ON DELETE SET NULL,
  order_date date NOT NULL DEFAULT current_date,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  order_status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_details (
  order_detail_id bigserial PRIMARY KEY,
  order_id bigint NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
  product_id bigint REFERENCES public.products(product_id) ON DELETE SET NULL,
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE public.production (
  production_id bigserial PRIMARY KEY,
  product_id bigint REFERENCES public.products(product_id) ON DELETE SET NULL,
  employee_id bigint REFERENCES public.employees(employee_id) ON DELETE SET NULL,
  production_date date NOT NULL DEFAULT current_date,
  quantity_produced int NOT NULL DEFAULT 0
);

CREATE TABLE public.inventory (
  inventory_id bigserial PRIMARY KEY,
  product_id bigint REFERENCES public.products(product_id) ON DELETE CASCADE,
  available_stock int NOT NULL DEFAULT 0,
  last_updated date NOT NULL DEFAULT current_date
);

CREATE TABLE public.payments (
  payment_id bigserial PRIMARY KEY,
  order_id bigint NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text,
  payment_date date NOT NULL DEFAULT current_date
);

-- Grants + RLS for all business tables (read for any authenticated, write for admins only)
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['customers','suppliers','raw_materials','products','employees','orders','order_details','production','inventory','payments'])
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE public.%I_%s_seq TO authenticated',
      t,
      CASE t
        WHEN 'customers' THEN 'customer_id'
        WHEN 'suppliers' THEN 'supplier_id'
        WHEN 'raw_materials' THEN 'material_id'
        WHEN 'products' THEN 'product_id'
        WHEN 'employees' THEN 'employee_id'
        WHEN 'orders' THEN 'order_id'
        WHEN 'order_details' THEN 'order_detail_id'
        WHEN 'production' THEN 'production_id'
        WHEN 'inventory' THEN 'inventory_id'
        WHEN 'payments' THEN 'payment_id'
      END);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Authenticated read %I" ON public.%I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('CREATE POLICY "Admin insert %I" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), ''admin''))', t, t);
    EXECUTE format('CREATE POLICY "Admin update %I" ON public.%I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), ''admin''))', t, t);
    EXECUTE format('CREATE POLICY "Admin delete %I" ON public.%I FOR DELETE TO authenticated USING (public.has_role(auth.uid(), ''admin''))', t, t);
  END LOOP;
END $$;

-- Seed sample data
INSERT INTO public.customers (full_name, phone_number, email, address) VALUES
('Ali Khan','03001234567','ali@example.com','Lahore'),
('Ahmed Raza','03111234567','ahmed@example.com','Karachi'),
('Sara Noor','03221234567','sara@example.com','Islamabad');

INSERT INTO public.suppliers (supplier_name, contact_number, address) VALUES
('Leather Hub','03005556666','Lahore'),
('ABC Suppliers','03117778888','Karachi'),
('Prime Leather','03229990000','Sialkot');

INSERT INTO public.products (product_name, category, price, stock_quantity, brand) VALUES
('Leather Jacket','Jacket',8500,20,'Madina'),
('Leather Belt','Belt',1500,40,'Madina'),
('Leather Wallet','Wallet',2000,35,'Madina'),
('Leather Shoes','Shoes',6000,15,'Madina');

INSERT INTO public.employees (employee_name, position, salary) VALUES
('Usman Ali','Manager',60000),
('Bilal Ahmad','Worker',30000),
('Hamza Khan','Supervisor',45000);
