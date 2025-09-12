-- Disable RLS on orders table temporarily (like customers table)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Drop any existing RLS policies on orders
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Allow insert for authenticated and anon users" ON orders;
DROP POLICY IF EXISTS "Allow select for authenticated and anon users" ON orders;
DROP POLICY IF EXISTS "Allow update for authenticated and anon users" ON orders;
DROP POLICY IF EXISTS "Allow delete for authenticated and anon users" ON orders;

-- Make user_id column nullable and optional for orders
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN user_id DROP DEFAULT;

-- Grant full access to authenticated and anon users
GRANT ALL ON orders TO authenticated, anon;

-- Create test orders linked to existing customers
-- First, let's get the customer IDs from our test data
INSERT INTO orders (
    shopify_order_id, 
    customer_id, 
    status, 
    shipping_addr_1, 
    shipping_addr_2, 
    postal_code, 
    phone
) 
SELECT 
    'order_' || generate_random_uuid()::text,
    c.customer_id,
    CASE 
        WHEN random() < 0.3 THEN 'pending'::text
        WHEN random() < 0.6 THEN 'processing'::text  
        ELSE 'completed'::text
    END,
    c.shipping_addr_1,
    c.shipping_addr_2,
    c.postal_code,
    c.phone
FROM customers c
WHERE c.name LIKE 'Test Customer%' OR c.name = 'Demo Customer'
ON CONFLICT DO NOTHING;

-- Add a few more specific test orders
INSERT INTO orders (
    shopify_order_id,
    customer_id,
    status,
    shipping_addr_1,
    postal_code,
    phone
) VALUES
    (
        'ORD-2024-001',
        (SELECT customer_id FROM customers WHERE name = 'Test Customer 1' LIMIT 1),
        'processing',
        '123 Main Street',
        '123456', 
        '+65 1234 5678'
    ),
    (
        'ORD-2024-002',
        (SELECT customer_id FROM customers WHERE name = 'Test Customer 2' LIMIT 1),
        'completed',
        '456 Oak Avenue',
        '654321',
        '+65 8765 4321'
    ),
    (
        'ORD-2024-003',
        (SELECT customer_id FROM customers WHERE name = 'Demo Customer' LIMIT 1),
        'pending',
        '789 Pine Road',
        '789012',
        '+65 5555 0000'
    )
ON CONFLICT (shopify_order_id) DO NOTHING;

-- Add comment
COMMENT ON TABLE orders IS 'RLS temporarily disabled for development. Re-enable for production.';