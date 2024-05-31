create table if not exists users (
	public_id uuid primary key,
	id BIGSERIAL not null,
	name varchar(80) not null,
	email varchar(255) not null,
	created_at timestamp not null default current_timestamp,
	updated_at timestamp null
);

create table if not exists unit_types (
	public_id uuid primary key,
	id BIGSERIAL not null,
	user_id uuid not null,
	name varchar(4) not null,
	description text null,
	created_at timestamp not null default current_timestamp,
	updated_at timestamp null,
	constraint fk_user foreign key(user_id) references users(public_id),
	constraint unique_unit_type_name_user_id unique (name, user_id)
);

create table if not exists product_types (
	public_id uuid primary key,
	id BIGSERIAL not null,
	user_id uuid not null,
	name varchar(80) not null,
	description text null,
	created_at timestamp not null default current_timestamp,
	updated_at timestamp null,
	constraint fk_user foreign key(user_id) references users(public_id),
	constraint unique_product_type_name_user_id unique (name, user_id)
);

create table if not exists brands (
	public_id uuid primary key,
	id BIGSERIAL not null,
	user_id uuid not null,
	name varchar(80) not null,
	description text null,
	image text null,
	created_at timestamp not null default current_timestamp,
	updated_at timestamp null,
	constraint fk_user foreign key(user_id) references users(public_id),
	constraint unique_brand_name_user_id unique (name, user_id)
);

create table if not exists products (
	public_id uuid primary key,
	id BIGSERIAL not null,
	user_id uuid not null,
	name varchar(80) not null,
	description text null,
	product_type_id uuid not null,
	unit_type_id uuid not null,
	min_quantity int not null,
	created_at timestamp not null default current_timestamp,
	updated_at timestamp null,
	constraint fk_user foreign key(user_id) references users(public_id),
	constraint fk_unit_type foreign key(user_id) references unit_types(public_id),
	constraint fk_product_type foreign key(user_id) references product_types(public_id),
	constraint unique_product_name_user_id unique (name, user_id)
);

create table if not exists product_images (
	public_id uuid primary key,
	id BIGSERIAL not null,
	brand_id uuid not null,
	product_id uuid not null,
	image text not null,
	created_at timestamp not null default current_timestamp,
	constraint fk_brand foreign key(brand_id) references brands(public_id),
	constraint fk_product foreign key(product_id) references products(public_id),
	constraint unique_prouct_brand_id unique (product_id, brand_id)
);

create table if not exists product_price_logs (
	public_id uuid primary key,
	id BIGSERIAL not null,
	brand_id uuid not null,
	product_id uuid not null,
	price decimal(10, 2) not null,
	created_at timestamp not null default current_timestamp,
	constraint fk_brand foreign key(brand_id) references brands(public_id),
	constraint fk_product foreign key(product_id) references products(public_id)
);

create table if not exists storages (
	public_id uuid primary key,
	id BIGSERIAL not null,
	user_id uuid not null,
	created_at timestamp not null default current_timestamp,
	updated_at timestamp null,
	constraint fk_user foreign key(user_id) references users(public_id),
	constraint unique_user_storage unique (user_id)
);

create table if not exists shopping_lists (
	public_id uuid primary key,
	id BIGSERIAL not null,
	user_id uuid not null,
	created_at timestamp not null default current_timestamp,
	updated_at timestamp null,
	completed_at timestamp null,
	constraint fk_user foreign key(user_id) references users(public_id)
);

create table if not exists storage_products (
	public_id uuid primary key,
	id BIGSERIAL not null,
	storage_id uuid not null,
	product_id uuid not null,
	brand_id uuid null,
	quantity float not null,
	status varchar(15) not null,
	created_at timestamp not null default current_timestamp,
	updated_at timestamp null,
	constraint fk_product foreign key(product_id) references products(public_id),
	constraint fk_storage foreign key(storage_id) references storages(public_id),
	constraint fk_brand foreign key(brand_id) references brands(public_id),
	constraint unique_product_brand_in_storage unique (product_id, brand_id)
);

create table if not exists shopping_list_products (
	public_id uuid primary key,
	id BIGSERIAL not null,
	shopping_list_id uuid not null,
	product_id uuid not null,
	brand_id uuid null,
	quantity_bought float not null,
	price_paid_per_item decimal(10, 2) null,
	total_price_paid decimal(10, 2) null,
	status varchar(15) not null,
	created_at timestamp not null default current_timestamp,
	updated_at timestamp null,
	constraint fk_product foreign key(product_id) references products(public_id),
	constraint fk_shopping_list foreign key(shopping_list_id) references shopping_lists(public_id),
	constraint fk_brand foreign key(brand_id) references brands(public_id),
	constraint unique_product_in_shopping_list unique (product_id)
);