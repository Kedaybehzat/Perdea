-- Perdea şeması — Modül 3
-- İnternet gelince Supabase SQL editörüne yapıştırılacak.
-- NOT: users.id, Supabase'de auth.users'a bağlanacak (yarın rötuş).

create table users (
  id uuid primary key,
  username text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz default now()
);

create table favorites (
  id uuid primary key,
  user_id uuid references users(id),
  movie_id integer,
  created_at timestamptz default now(),
  unique (user_id, movie_id)
);

create table ratings (
  id uuid primary key,
  user_id uuid references users(id),
  movie_id integer,
  score integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, movie_id)
);