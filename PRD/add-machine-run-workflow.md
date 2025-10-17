Product Requirements Document (PRD)

Feature: Workflow to Add Machine Run

Overview

Each order in the system can have zero, one, or multiple machine runs associated with it. This feature enables users to add, view, and edit machine runs directly from the order table. A machine run is captured in a structured 3-step flow, with all related information stored in the database.

Goals

Allow users to attach machine runs to orders.

Provide clear visibility of machine runs associated with an order (empty state or card list view).

Guide users through a structured process for entering machine run details (3-step wizard).

Persist all run data and related bag information in the database.

User Flow

1. Entry Point

From the Orders table, users click from the Actions column.

Select Add/Edit Machine Runs.

2. Machine Run Overview

User is taken to a dedicated Machine Run Overview Page for the selected order.

Page layout:

Order summary (name, phone, etc.).

Empty state (if no runs, as shown in Image 1).

Cards view (if runs exist, each run displayed as a card with details).

Users can click + Add Runs to create a new run or Edit on a card to modify an existing run.

3. Machine Run Creation / Editing (3-Step Wizard)

Step 1 – Basic Info

Fields:

Mama’s Name

Mama’s NRIC

Date Expressed

Action buttons: Next, Cancel.

Step 2 – Individual Bags

Capture bags per run:

Date (dropdown)

Bag weight (g)

Ability to add multiple bags per date.

Ability to add additional dates.

Action buttons: Save (persists progress), Cancel, Next.

Step 3 – Calculation Inputs

Input section for calculation metrics (e.g., packing requirements, gram ratio, water activity level, remarks).

Outputs panel updates dynamically based on inputs (will be given later, now put placeholder) 

Action buttons: Save, Cancel.

Data Model

Key Tables

orders

order_id, customer_id, phone, status, etc.

customers

customer_id, name, phone, address info, etc.

machine_runs

machine_run_id (primary key)

order_id (FK)

run_number, mama_name, mama_nric

Dates: date_received, date_processed, date_packed

Metrics: bags_weight_g, powder_weight_g, packing_requirement, water_activity_level, etc.

individual_bags

bag_id (primary key)

machine_run_id (FK)

bag_number, date_expressed, time_expressed, weight_g

Make full use of the current techstack

Typescript

Next JS 

ShadCN

Tailwind

Others in the code base 
