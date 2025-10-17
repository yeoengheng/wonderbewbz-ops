1. Overview

We want to introduce a side panel UI that allows users to view detailed information about machine runs associated with an order. This side panel will appear when a user clicks on a machine run value in the table.

2. Goals

Provide a clear and organized detail view for machine runs.

Ensure the information layout is intuitive, following a tabbed design.

Lay the groundwork for future enhancements (e.g., edit functionality, inputs, and bag details).

3. Scope
   3.1 Trigger

Users will see a table that contains a column named Machine Runs.

Each order can have one or more machine runs listed in this column.

When a user clicks on a specific machine run, a side panel will appear from the right-hand side of the screen.

3.2 Side Panel Layout
Header Section

Machine Run Name (e.g., "123-A").

Status (e.g., "In Progress") shown as a badge.

Edit Button on the right side (non-functional for now).

Content Section (Tabbed Interface)

The side panel will contain 3 tabs:

Main (default active tab)

Displays order-related information in a key-value layout.

Sections:

Order Info: Mama’s Name, Mama’s NRIC, Date Expressed.

Calculations: Placeholder fields (empty for now).

Remarks: Text value (if any).

Inputs

Placeholder content (empty for now).

Individual Bags

Placeholder content (empty for now).

4. Functional Requirements

FR1: When a user clicks a machine run value in the table, the side panel slides in from the right.

FR2: The side panel should overlay on top of the table but not affect the underlying data.

FR3: The header must include machine run name, status, and a non-functional Edit button.

FR4: The content must be structured into tabs: Main, Inputs, and Individual Bags.

FR5: The Main tab must display information in a key-value layout:

Order Info (Mama’s Name, Mama’s NRIC, Date Expressed).

Calculations (empty).

Remarks (text field).

FR6: Inputs and Individual Bags tabs will remain empty placeholders for now.

5. Non-Functional Requirements

Usability: Side panel must be responsive and intuitive.

Performance: Panel should load instantly when a machine run is clicked.

Scalability: Structure allows for future expansion (edit functionality, more calculations, inputs, and bags details).

6. Out of Scope

Edit functionality of the button.

Populating calculations, inputs, and individual bags with real data.
