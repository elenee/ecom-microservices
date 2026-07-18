#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE user_service_db;
  CREATE DATABASE product_service_db;
  CREATE DATABASE cart_service_db;
  CREATE DATABASE order_service_db;
  CREATE DATABASE payments_service_db;
EOSQL