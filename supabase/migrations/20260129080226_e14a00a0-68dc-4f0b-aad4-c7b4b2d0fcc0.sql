-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('apartment', 'society', 'office', 'campus')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hosts table (flat owners)
CREATE TABLE public.hosts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visitors table
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  host_id UUID REFERENCES public.hosts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  purpose TEXT NOT NULL,
  company TEXT,
  photo TEXT,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'checked-in', 'checked-out')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pre-registered visitors table
CREATE TABLE public.pre_registered_visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  host_id UUID REFERENCES public.hosts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  purpose TEXT NOT NULL,
  photo TEXT,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  frequency TEXT NOT NULL DEFAULT 'always' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'always')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blacklist table
CREATE TABLE public.blacklisted_visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  reason TEXT,
  photo TEXT,
  blacklisted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blacklisted_by TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled visits table
CREATE TABLE public.scheduled_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  host_id UUID REFERENCES public.hosts(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT NOT NULL,
  visitor_company TEXT,
  purpose TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  confirmation_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_registered_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklisted_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for properties
CREATE POLICY "Users can view their own properties" ON public.properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own properties" ON public.properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own properties" ON public.properties FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for hosts
CREATE POLICY "Users can view their own hosts" ON public.hosts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own hosts" ON public.hosts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own hosts" ON public.hosts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own hosts" ON public.hosts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for visitors
CREATE POLICY "Users can view their own visitors" ON public.visitors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own visitors" ON public.visitors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own visitors" ON public.visitors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own visitors" ON public.visitors FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for pre-registered visitors
CREATE POLICY "Users can view their own pre-registered visitors" ON public.pre_registered_visitors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pre-registered visitors" ON public.pre_registered_visitors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pre-registered visitors" ON public.pre_registered_visitors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pre-registered visitors" ON public.pre_registered_visitors FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for blacklisted visitors
CREATE POLICY "Users can view their own blacklisted visitors" ON public.blacklisted_visitors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own blacklisted visitors" ON public.blacklisted_visitors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own blacklisted visitors" ON public.blacklisted_visitors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own blacklisted visitors" ON public.blacklisted_visitors FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for scheduled visits
CREATE POLICY "Users can view their own scheduled visits" ON public.scheduled_visits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scheduled visits" ON public.scheduled_visits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scheduled visits" ON public.scheduled_visits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scheduled visits" ON public.scheduled_visits FOR DELETE USING (auth.uid() = user_id);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hosts_updated_at BEFORE UPDATE ON public.hosts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pre_registered_visitors_updated_at BEFORE UPDATE ON public.pre_registered_visitors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_scheduled_visits_updated_at BEFORE UPDATE ON public.scheduled_visits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();