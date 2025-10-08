PRD: Final Cross Check Section in Wizard (Step 3)
Overview

A new section called “Final Cross Check” will be added to Step 3 of the wizard.
This section lets operators input powder weight and quantity combinations, and verify totals against the expected powder weight defined in the machine run.

Discrepancies will be surfaced as UI warnings only, with a configurable tolerance of ±5%. Users can optionally add clarifications in the existing remarks field of the machine run.

Goals

Provide an easy-to-use input system for powder weight × quantity checks.

Ensure totals can be validated against machine run powder weight with tolerance applied.

Keep discrepancies as non-blocking warnings.

Allow operators to optionally document discrepancies in the remarks field.

User Experience
Placement

Section: Final Cross Check

Appears after existing sections in Step 3.

Input (Left Side)

Rows with two fields:

Powder Weight (g) – numeric.

Quantity – integer.

Users can add/remove multiple rows.

Output (Right Side)

Per-row calculated Total Weight = Powder Weight × Quantity.

Combined Total Weight (sum of all rows).

Comparison result:

Compare Combined Total vs. machine_runs.powder_weight_g.

If within ±5% tolerance → display “Match” checkmark.

If outside tolerance → display warning message (non-blocking).

Prompt to optionally edit remarks.

Data Schema
New Table: cross_checks
Column	Type	Description
cross_check_id	uuid	Primary key.
machine_run_id	uuid	Foreign key → machine_runs(machine_run_id).
powder_weight_g	numeric	User input for per-unit powder weight.
quantity	int4	User input for quantity.
created_at	timestamptz	Timestamp for creation.
updated_at	timestamptz	Timestamp for update.
user_id	text	Operator who entered data.

⚠️ Note: No derived values (total_weight_g, combined_total_g) are stored in the DB. These are always calculated live.

Functional Requirements

Row Management

Users can dynamically add/remove rows.

Calculations (UI only)

Per-row total = powder_weight_g × quantity.

Combined total = sum of all rows.

Comparison Logic

Compare Combined Total to machine_runs.powder_weight_g.

If variance ≤ ±5% → show Match indicator.

If variance > ±5% → show Warning.

Tolerance

Initial threshold: 5% variance.

Should be configurable in the future.

Discrepancy Handling

Warnings do not block progress.

If warning shown, allow editing of machine_runs.remarks (optional).

Persistence

Store raw inputs in cross_checks.

Maintain FK relationship with machine_runs.

Non-Functional Requirements

Performance: All calculations and tolerance checks must be instant on UI.

Integrity: Strong FK constraints between cross_checks and machine_runs.

Scalability: Support dozens of rows per machine run without slowdown.

Auditability: Track user_id, created_at, updated_at.