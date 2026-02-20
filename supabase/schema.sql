-- SQL Schema for migrating from Firebase to Supabase

-- Create "products" table
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price numeric DEFAULT 0,
  affiliate_link text,
  sales integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create "posts" table
CREATE TABLE posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  caption text NOT NULL,
  theme text NOT NULL,
  selected_items text[],
  fb_post_id text,
  reach integer DEFAULT 0,
  clicks integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Because we are migrating from Firebase where IDs are strings (alphanumeric),
-- we need to change the primary key type if we want to preserve Firebase IDs:
-- In that case, use `id text PRIMARY KEY` instead of UUID. 

-- Adjusted Schema preserving Firebase String IDs:
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price numeric DEFAULT 0,
  affiliate_link text,
  sales integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
  id text PRIMARY KEY,
  caption text NOT NULL,
  theme text NOT NULL,
  selected_items text[],
  fb_post_id text,
  reach integer DEFAULT 0,
  clicks integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
