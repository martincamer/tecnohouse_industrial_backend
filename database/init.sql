CREATE TABLE salidas (
    id SERIAL PRIMARY KEY,
    chofer VARCHAR(255),
    km_viaje_control NUMERIC,
    km_viaje_control_precio NUMERIC,
    fletes_km NUMERIC,
    fletes_km_precio NUMERIC,
    armadores VARCHAR(255),
    total_viaticos NUMERIC,
    motivo VARCHAR(255),
    total_flete NUMERIC,
    total_control NUMERIC,
    datos_cliente json,
    role_id numeric,
    usuario varchar,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE remuneracion (
    id SERIAL PRIMARY KEY,
    armador VARCHAR(255),
    fecha_carga date,
    fecha_entrega date,
    km_lineal numeric,
    pago_fletero_espera numeric,
    viaticos numeric,
    refuerzo numeric,
    recaudacion numeric,
    datos_cliente json,
    role_id numeric,
    usuario varchar,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE choferes (
id SERIAL PRIMARY KEY,
chofer VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE ordenes (
id SERIAL PRIMARY KEY,
chofer VARCHAR(255),
fecha_llegada DATE,
orden_firma DATE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

//roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

//rol intro
INSERT INTO roles (name) VALUES ('admin'), ('user');


//alter table
ALTER TABLE users ADD COLUMN role_id INT;

-- Asignar rol "user" por defecto a los usuarios existentes
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'user');


CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email   VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)


ALTER TABLE users ADD COLUMN gravatar VARCHAR(255);

ALTER TABLE empleados ADD COLUMN user_id INTEGER REFERENCES users(id);
