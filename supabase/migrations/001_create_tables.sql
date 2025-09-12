-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed');
CREATE TYPE machine_run_status AS ENUM ('pending', 'processing', 'completed', 'qa_failed', 'cancelled');

-- 1. CUSTOMERS TABLE
CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopify_customer_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    shipping_addr_1 VARCHAR(500),
    shipping_addr_2 VARCHAR(500),
    postal_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ORDERS TABLE
CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shopify_order_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    status order_status DEFAULT 'pending',
    shipping_addr_1 VARCHAR(500),
    shipping_addr_2 VARCHAR(500),
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MACHINE_RUNS TABLE (Central operations table)
CREATE TABLE machine_runs (
    machine_run_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    run_number INTEGER NOT NULL,
    status machine_run_status DEFAULT 'pending',
    
    -- Inputs: Order Info
    machine_run VARCHAR(255),
    mama_name VARCHAR(255),
    mama_nric VARCHAR(255),
    date_received DATE,
    date_processed DATE,
    date_packed DATE,
    
    -- Inputs: Run Calculations
    bags_weight_g DECIMAL(10,2),
    powder_weight_g DECIMAL(10,2),
    packing_requirements_ml DECIMAL(10,2),
    label_water_to_add_ml DECIMAL(10,2),
    water_activity_level DECIMAL(5,3),
    
    -- Inputs: Gram Ratio
    gram_ratio_staff_input_ml DECIMAL(10,2),
    
    -- Inputs: Others
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique run numbers per order
    UNIQUE(order_id, run_number)
);

-- 4. INDIVIDUAL_BAGS TABLE
CREATE TABLE individual_bags (
    bag_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_run_id UUID NOT NULL REFERENCES machine_runs(machine_run_id) ON DELETE CASCADE,
    bag_number INTEGER NOT NULL,
    date_expressed DATE,
    time_expressed TIME,
    weight_g DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique bag numbers per machine run
    UNIQUE(machine_run_id, bag_number)
);

-- CREATE INDEXES for better query performance
CREATE INDEX idx_customers_shopify_id ON customers(shopify_customer_id);
CREATE INDEX idx_orders_shopify_id ON orders(shopify_order_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_machine_runs_order_id ON machine_runs(order_id);
CREATE INDEX idx_machine_runs_status ON machine_runs(status);
CREATE INDEX idx_individual_bags_machine_run_id ON individual_bags(machine_run_id);

-- CREATE TRIGGERS for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_machine_runs_updated_at BEFORE UPDATE ON machine_runs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_individual_bags_updated_at BEFORE UPDATE ON individual_bags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();