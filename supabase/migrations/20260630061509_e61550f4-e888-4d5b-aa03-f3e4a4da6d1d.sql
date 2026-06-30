-- Allow all authenticated users to insert/update/delete on all business tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['customers','suppliers','raw_materials','products','employees','orders','order_details','production','inventory','payments']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "admins_insert_%1$s" ON public.%1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS "admins_update_%1$s" ON public.%1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS "admins_delete_%1$s" ON public.%1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS "auth_insert_%1$s" ON public.%1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS "auth_update_%1$s" ON public.%1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS "auth_delete_%1$s" ON public.%1$I', t);

    EXECUTE format('CREATE POLICY "auth_insert_%1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "auth_update_%1$s" ON public.%1$I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "auth_delete_%1$s" ON public.%1$I FOR DELETE TO authenticated USING (true)', t);
  END LOOP;
END $$;