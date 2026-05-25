# Requirements Document

## Introduction

This document defines the requirements for redesigning the user registration and ownership model in the Runner City housing management system. The current signup flow is overly restrictive (requiring exact owner name match and plot pre-existence). The new system adopts an "Open Signup + Admin Approval" model with support for multiple ownership types, relationship-based access, and ownership transfer capabilities. The scope is practical and implementable within a 15-day timeline using the existing Express.js, Prisma ORM, and MySQL stack.

## Glossary

- **Registration_System**: The module handling user signup, validation, and account creation
- **Admin_Panel**: The interface through which administrators review and approve or reject pending accounts
- **Ownership_Registry**: The subsystem that tracks plot/flat ownership records, types, and history
- **Transfer_Engine**: The module responsible for processing ownership transfers between users
- **Plot**: A land parcel identified by a unique plot number in the Runner City housing society
- **Flat**: A unit within a multi-floor building on a plot, identified by a flat/unit number
- **Full_Owner**: A user who owns an entire plot and all structures on it
- **Flat_Owner**: A user who owns a specific flat/unit within a multi-floor building on a plot
- **Co_Owner**: A user who shares ownership of a plot or flat with another user (e.g., joint ownership between spouses)
- **Tenant**: A user who rents a flat or plot but does not own it
- **Caretaker**: A user authorized by an owner to manage their account and perform actions on their behalf
- **Relationship_Type**: The declared relationship between a new registrant and the existing plot owner (e.g., son, daughter, wife, tenant, caretaker)
- **Ownership_Status**: The current state of an ownership record (active, transferred, inactive, deceased)
- **User_Status**: The account approval state (pending, approved, rejected, suspended, inactive)

## Requirements

### Requirement 1: Open Signup Registration

**User Story:** As a resident of Runner City, I want to register for an account without needing my name to exactly match existing records, so that I can request access to the system easily.

#### Acceptance Criteria

1. WHEN a user submits a registration form with name (1–100 characters), email (valid email format), phone (optional, 7–15 digits), password (minimum 8 characters), and plot number, THE Registration_System SHALL create a new user account with User_Status set to "pending"
2. IF a user submits a registration form with any required field (name, email, password, plot number) missing or failing validation, THEN THE Registration_System SHALL reject the registration and return an error indicating which field is invalid
3. WHEN a user submits a registration form with an email that already exists in the system, THE Registration_System SHALL reject the registration and return an error indicating the email is already registered
4. IF a user submits a registration form with a plot number that does not exist in the system, THEN THE Registration_System SHALL reject the registration and return an error indicating the plot number is invalid
5. WHEN a user submits a registration form with a plot number that already has an owner registered with User_Status "approved" or "pending", THE Registration_System SHALL require the user to provide a Relationship_Type to the existing owner
6. WHEN a user submits a registration form with a plot number that has no user registered against it, THE Registration_System SHALL allow registration without requiring a Relationship_Type
7. IF a user is required to provide a Relationship_Type but does not supply one, THEN THE Registration_System SHALL reject the registration and return an error indicating that Relationship_Type is required
8. THE Registration_System SHALL store the declared Relationship_Type alongside the user record for admin review
9. THE Registration_System SHALL accept the following Relationship_Type values: son, daughter, wife, husband, tenant, caretaker, co_owner, other

### Requirement 2: Admin Approval Flow

**User Story:** As an admin, I want to review and approve or reject pending registrations, so that only legitimate residents gain access to the system.

#### Acceptance Criteria

1. WHEN an admin views the pending registrations list, THE Admin_Panel SHALL display all users with User_Status "pending" along with their name, email, phone, and declared plot number
2. WHEN an admin approves a pending registration, THE Admin_Panel SHALL update the User_Status to "approved" and retain the role assigned during registration
3. WHEN an admin rejects a pending registration, THE Admin_Panel SHALL update the User_Status to "rejected" and provide a text field for the admin to enter a rejection reason (maximum 500 characters)
4. WHILE a user account has User_Status "pending" or "rejected", THE Registration_System SHALL deny login access to that user and return an error message indicating the account is not approved
5. WHEN an admin approves a user whose associated plot has no other user with User_Status "approved" assigned to it, THE Admin_Panel SHALL assign the role "full_owner" by default
6. IF an admin attempts to approve or reject a user whose User_Status is not "pending", THEN THE Admin_Panel SHALL display an error message indicating that only users with "pending" status can be approved or rejected and SHALL NOT modify the user record

### Requirement 3: Ownership Type Classification

**User Story:** As an admin, I want to classify ownership types for each plot, so that the system correctly represents full plot ownership versus flat ownership in multi-floor buildings.

#### Acceptance Criteria

1. THE Ownership_Registry SHALL support the following ownership types: full_owner, flat_owner, co_owner, tenant, caretaker, and SHALL reject any ownership record submitted with a type value not in this list
2. WHEN a plot contains a multi-floor building, THE Ownership_Registry SHALL allow multiple Flat_Owner records for distinct flat/unit numbers on the same plot, up to a maximum of 200 flat/unit records per plot
3. WHEN a plot is registered with ownership type full_owner, THE Ownership_Registry SHALL store a single Full_Owner record for that plot and SHALL reject any additional full_owner or flat_owner record for the same plot
4. THE Ownership_Registry SHALL store an ownership record linking a user to a plot or flat with ownership type, start date, and Ownership_Status where Ownership_Status is one of: active, inactive, disputed, transferred
5. WHEN a user is registered as a Co_Owner, THE Ownership_Registry SHALL link the Co_Owner record to the same plot or flat as an existing active full_owner or flat_owner record on that plot, and SHALL reject the co_owner registration if no active full_owner or flat_owner record exists for the target plot or flat
6. WHEN a user is registered as a Tenant, THE Ownership_Registry SHALL store the tenancy with a reference to the flat or plot, the landlord user who holds an active full_owner or flat_owner record for that flat or plot, and an optional lease end date
7. IF an admin attempts to register the same user with the same ownership type on the same plot or flat where an active record already exists, THEN THE Ownership_Registry SHALL reject the duplicate registration and indicate that an active ownership record already exists for that user on the specified plot or flat
8. IF an admin attempts to assign a flat_owner record to a plot that already has an active full_owner record, or a full_owner record to a plot that already has active flat_owner records, THEN THE Ownership_Registry SHALL reject the assignment and indicate that the ownership types are mutually exclusive for the same plot

### Requirement 4: Ownership Transfer

**User Story:** As an admin, I want to transfer ownership from one user to another, so that ownership changes due to death, departure, or sale are properly recorded.

#### Acceptance Criteria

1. WHEN an admin initiates an ownership transfer, THE Transfer_Engine SHALL set the current owner's Ownership_Status to "transferred", create a new ownership record for the receiving user with Ownership_Status "active", and reassign the associated plot (updating the Plot's assigned_to to the new owner's user_id and the new owner's plot_no to the transferred plot)
2. WHEN an ownership transfer is completed, THE Transfer_Engine SHALL record the transfer date, reason, and both the previous and new owner (identified by user_id) in a transfer history record, where reason is one of: "death", "sale", "departure", or "other" with a mandatory free-text explanation of no more than 500 characters when "other" is selected
3. WHEN an ownership transfer is completed, THE Transfer_Engine SHALL update the previous owner's role to "inactive" and set their plot_no to null
4. THE Transfer_Engine SHALL preserve all historical ownership records and never delete previous ownership data
5. IF an admin attempts to transfer ownership to a user who is not registered in the system, THEN THE Transfer_Engine SHALL reject the transfer and return an error message indicating the target user does not exist
6. IF an admin attempts to transfer ownership from a user whose Ownership_Status is not "active", THEN THE Transfer_Engine SHALL reject the transfer and return an error message indicating the current owner does not hold active ownership
7. IF an admin attempts to transfer ownership to a user whose Ownership_Status is already "active", THEN THE Transfer_Engine SHALL reject the transfer and return an error message indicating the target user already holds active ownership

### Requirement 5: User Roles and Access Levels

**User Story:** As a system architect, I want clearly defined user roles, so that each user type has appropriate access to system features.

#### Acceptance Criteria

1. THE Registration_System SHALL support the following roles: admin, full_owner, flat_owner, co_owner, tenant, caretaker
2. WHILE a user has the role "caretaker", THE Registration_System SHALL grant the caretaker the same access permissions as the owner they represent, scoped to that owner's plot or flat
3. WHILE a user has the role "tenant", THE Registration_System SHALL grant read access to plot/flat information and fee payment capabilities but deny ownership management actions
4. WHILE a user has the role "co_owner", THE Registration_System SHALL grant the same access as the primary owner for the shared plot or flat
5. THE Registration_System SHALL store a reference linking each caretaker to the specific owner they represent

### Requirement 6: User Status Lifecycle

**User Story:** As an admin, I want to manage user account statuses including marking users as inactive or deceased, so that the system accurately reflects the current state of all residents.

#### Acceptance Criteria

1. THE Admin_Panel SHALL support the following User_Status values: pending, approved, rejected, suspended, inactive, deceased
2. WHEN an admin marks a user as "deceased", THE Admin_Panel SHALL retain the user record, set User_Status to "deceased", and deny login access
3. WHEN an admin marks a user as "suspended", THE Admin_Panel SHALL deny login access while preserving all user data and ownership records
4. WHEN a user is marked "inactive" or "deceased", THE Admin_Panel SHALL prompt the admin to initiate an ownership transfer if the user holds active ownership

### Requirement 7: Plot and Flat Structure

**User Story:** As an admin, I want to define whether a plot contains a single building or multiple flats, so that ownership can be correctly assigned at the right level.

#### Acceptance Criteria

1. THE Ownership_Registry SHALL store a plot type field indicating whether a plot is "single_unit" (one owner for entire plot) or "multi_unit" (multiple flats/units)
2. WHILE a plot is marked as "multi_unit", THE Ownership_Registry SHALL allow creation of flat/unit records with unique identifiers (alphanumeric, maximum 20 characters, unique within that plot), up to a maximum of 999 flats per plot
3. WHILE a plot is marked as "single_unit", THE Ownership_Registry SHALL restrict ownership to a single Full_Owner record plus a maximum of 10 optional Co_Owner records
4. THE Ownership_Registry SHALL store flat records with: flat identifier, floor number (integer ranging from -5 to 200), plot reference, and current owner reference
5. IF an admin attempts to change a plot type from "multi_unit" to "single_unit" while flat records with assigned owners exist for that plot, THEN THE Ownership_Registry SHALL reject the change and display an error message indicating that existing flat ownership records must be removed before changing plot type
6. IF an admin attempts to create a flat/unit record on a plot marked as "single_unit", THEN THE Ownership_Registry SHALL reject the creation and display an error message indicating that flat records are only permitted on "multi_unit" plots
7. IF an admin attempts to assign a plot-level owner directly to a "multi_unit" plot, THEN THE Ownership_Registry SHALL reject the assignment and display an error message indicating that ownership must be assigned at the flat level for multi_unit plots

### Requirement 8: Ownership Dispute Handling

**User Story:** As an admin, I want to flag and manage ownership disputes, so that conflicting claims are tracked and resolved without data loss.

#### Acceptance Criteria

1. WHEN two or more users submit ownership registration requests for the same plot or flat, THE Admin_Panel SHALL allow the admin to flag the plot or flat as "disputed"
2. WHILE a plot or flat is flagged as "disputed", THE Ownership_Registry SHALL retain all claimant records without granting exclusive ownership to any party and SHALL prevent new ownership transfers for that plot or flat
3. WHEN an admin resolves a dispute by selecting one claimant as the verified owner, THE Admin_Panel SHALL update the Ownership_Status of the selected owner to "active" and set each remaining claimant's status to one of the following: "rejected" or "tenant"
4. THE Ownership_Registry SHALL store dispute resolution notes (1 to 2000 characters) and the date of resolution for each resolved dispute for audit purposes
5. IF an admin attempts to resolve a dispute without selecting exactly one verified owner, THEN THE Admin_Panel SHALL display an error message indicating that a single owner must be selected and SHALL retain the "disputed" flag unchanged
