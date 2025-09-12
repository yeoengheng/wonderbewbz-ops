We are using Supabase.

Below are the data schema I want to build.

## **1. customers**

Stores information about Clients 

| Column | Type | Description |
| --- | --- | --- |
| **customer_id** (PK) | UUID | Unique customer ID |
| shopify_customer_id | VARCHAR | From Shopify API |
| name | VARCHAR | Customer’s name |
| phone | VARCHAR | Contact number |
| shipping_addr_1 | VARCHAR | Primary shipping address |
| shipping_addr_2 | VARCHAR | Secondary shipping address |
| postal_code | VARCHAR | Postal code |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## **2. orders**

Orders are created automatically via Shopify webhook.

| Column | Type | Description |
| --- | --- | --- |
| **order_id** (PK) | UUID | Unique order ID |
| shopify_order_id | VARCHAR | ID from Shopify API |
| customer_id (FK) | UUID | Links to **customers** |
| status | ENUM | `pending`, `processing`, `completed` |
| shipping_addr_1 | VARCHAR | Snapshot from Shopify at order time |
| shipping_addr_2 | VARCHAR | Optional |
| postal_code | VARCHAR | Postal code |
| phone | VARCHAR | Customer contact |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## **3. machine_runs**

This is the **central operations table** where **all inputs** are captured. It consolidates order info, bag data, run calculations, and gram ratio inputs.

| Column | Type | Description |
| --- | --- | --- |
| **machine_run_id** (PK) | UUID | Unique machine run ID |
| order_id (FK) | UUID | Links to **orders** |
| run_number | INT | Sequential run number per order |
| status | ENUM | `pending`, `processing`, `completed`, `qa_failed`, `cancelled` |

### **Inputs: Order Info**

| Column | Type | Description |
| --- | --- | --- |
| machine_run | VARCHAR | Input  |
| mama_name | VARCHAR | Mama’s name |
| mama_nric | VARCHAR | Mama’s NRIC |
| date_received | DATE | Date milk was received |
| date_processed | DATE | Date processing started |
| date_packed | DATE | Date milk was packed |

### **Inputs: Run Calculations**

| Column | Type | Description |
| --- | --- | --- |
| bags_weight_g | DECIMAL | Total bags’ weight (g) |
| powder_weight_g | DECIMAL | Powder weight (g) |
| packing_requirements_ml | DECIMAL | Packing requirements (ml) |
| label_water_to_add_ml | DECIMAL | Label: Water to add (ml) |
| water_activity_level | DECIMAL | Water activity level |

### **Inputs: Gram Ratio**

| Column | Type | Description |
| --- | --- | --- |
| gram_ratio_staff_input_ml | DECIMAL | Staff-input ml for gram ratio |

### Inputs: Others

| Column | Type | Description |
| --- | --- | --- |
| remarks | TEXT | Operators Notes  |
| created_at | TIMESTAMP | Record Creation Timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## **4. individual_bags**

Each machine run produces multiple bags.

This stays as a separate table for **granular tracking**.

| Column | Type | Description |
| --- | --- | --- |
| **bag_id** (PK) | UUID | Unique bag ID |
| machine_run_id (FK) | UUID | Links to **machine_runs** |
| bag_number | INT | Sequential bag number |
| date_expressed | DATE | Date milk was expressed |
| time_expressed | TIME | Time milk was expressed |
| weight_g | DECIMAL | Bag’s weight (g) |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Relationship

```json
Customer (1) ────< Orders (∞) ────< Machine Runs (∞) ────< Individual Bags (∞)
```

---- remember you are an expert full-stack designer, especially in Supabase, React, Next JS, Tailwind, shadcn. 