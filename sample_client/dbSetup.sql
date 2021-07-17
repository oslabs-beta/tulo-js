CREATE TABLE public.userActivity (
  "_id" serial primary key,
  "strategy" varchar not null,
  "endpoint" varchar not null,
  "action" varchar not null
  "ts" timestamp not null,
);