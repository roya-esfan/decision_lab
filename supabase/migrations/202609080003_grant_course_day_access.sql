grant select, insert, update on table public.course_day_access to service_role;

notify pgrst, 'reload schema';
