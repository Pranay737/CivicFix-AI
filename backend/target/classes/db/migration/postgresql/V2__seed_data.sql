-- ====================================================================
-- CivicFix AI - Seed Data (PostgreSQL)
-- ====================================================================

-- 1. Departments
INSERT INTO departments (id, name, code, description, active) VALUES
(1, 'Roads & Infrastructure', 'ROADS', 'Maintenance of roads, bridges, pavements, and public infrastructure', true),
(2, 'Sanitation & Waste Management', 'SANITATION', 'Garbage collection, public cleaning, waste disposal and dump management', true),
(3, 'Electricity & Streetlights', 'ELECTRICITY', 'Streetlighting, public electrical grids, traffic signal illumination', true),
(4, 'Water Supply & Pipelines', 'WATER', 'Municipal water distribution, pipe leaks, contamination and supply pressure', true),
(5, 'Drainage & Sewage', 'DRAINAGE', 'Stormwater drainage, manholes, sewer lines, and waterlogging management', true),
(6, 'General Civic Affairs', 'GENERAL', 'Parks, public amenities, general municipal grievances and miscellaneous issues', true)
ON CONFLICT (id) DO NOTHING;

-- Reset department sequence
SELECT setval(pg_get_serial_sequence('departments', 'id'), coalesce(max(id), 1)) FROM departments;

-- 2. Categories
INSERT INTO categories (id, name, description, department_id, default_priority, active) VALUES
(1, 'Pothole / Road Damage', 'Potholes, cracks, broken pavements, or road cave-ins', 1, 'MEDIUM', true),
(2, 'Uncollected Garbage / Dump', 'Overflowing dumpsters, roadside trash piles, uncleared waste', 2, 'MEDIUM', true),
(3, 'Broken Streetlight / Blackout', 'Non-functioning streetlights, flickering lights, dark streets', 3, 'MEDIUM', true),
(4, 'Water Leakage / Pipe Burst', 'Water pipeline bursts, leaking municipal taps, low pressure or muddy water', 4, 'HIGH', true),
(5, 'Drainage Overflow / Clogged Drain', 'Blocked stormwater drains, open manholes, sewage overflow', 5, 'HIGH', true),
(6, 'Damaged Public Property', 'Broken bus shelters, damaged road signs, vandalized public benches', 1, 'LOW', true),
(7, 'Other Civic Issue', 'Other municipal concerns not listed under specific categories', 6, 'LOW', true)
ON CONFLICT (id) DO NOTHING;

-- Reset category sequence
SELECT setval(pg_get_serial_sequence('categories', 'id'), coalesce(max(id), 1)) FROM categories;

-- 3. SLA Policies
INSERT INTO sla_policies (category_id, priority, resolution_hours) VALUES
-- Pothole
(1, 'CRITICAL', 12), (1, 'HIGH', 24), (1, 'MEDIUM', 48), (1, 'LOW', 96),
-- Garbage
(2, 'CRITICAL', 6),  (2, 'HIGH', 12), (2, 'MEDIUM', 24), (2, 'LOW', 48),
-- Streetlight
(3, 'CRITICAL', 6),  (3, 'HIGH', 12), (3, 'MEDIUM', 24), (3, 'LOW', 48),
-- Water Leakage
(4, 'CRITICAL', 8),  (4, 'HIGH', 16), (4, 'MEDIUM', 36), (4, 'LOW', 72),
-- Drainage
(5, 'CRITICAL', 8),  (5, 'HIGH', 16), (5, 'MEDIUM', 36), (5, 'LOW', 72),
-- Damaged Property
(6, 'CRITICAL', 24), (6, 'HIGH', 48), (6, 'MEDIUM', 96), (6, 'LOW', 168),
-- Other
(7, 'CRITICAL', 24), (7, 'HIGH', 48), (7, 'MEDIUM', 72), (7, 'LOW', 120)
ON CONFLICT (category_id, priority) DO NOTHING;

-- 4. Knowledge Documents (RAG Knowledge Base)
INSERT INTO knowledge_documents (id, title, source, category, content, active) VALUES
(1, 'Civic Issue Reporting Guidelines', 'Municipal Corporation Citizen Charter', 'General',
 'Citizens can report civic issues 24/7 through the CivicFix AI portal. When submitting a complaint, provide a clear title, detailed description, accurate location pin, and clear photographs showing the extent of the damage. Each complaint is assigned a unique tracking number (e.g., CFX-2026-XXXX). AI automatically triages the complaint to determine category, priority, and responsible department. Once an issue is resolved, citizens have 72 hours to verify and close or reopen the complaint.', true),

(2, 'Pothole & Road Repair Operating Procedures', 'Department of Roads & Infrastructure Manual', 'Roads',
 'The Roads & Infrastructure Department classifies road damages into three severity tiers: Tier 1 (Hazardous potholes exceeding 10cm depth or on high-speed arterials) with 12-24 hour turnaround; Tier 2 (Surface deterioration and minor potholes) with 48-72 hour resolution; Tier 3 (Pavement cosmetic repairs) within 7 days. Cold mix asphalt is utilized for emergency wet-weather repairs, followed by permanent hot mix asphalt patching during dry conditions. Work zones must be demarcated with safety cones and reflective signage.', true),

(3, 'Municipal Sanitation and Waste Disposal Standards', 'Sanitation Department Operational Handbook', 'Sanitation',
 'Garbage collection vehicles operate daily between 06:00 AM and 01:00 PM. High-density commercial areas receive a secondary evening collection. Overflowing garbage complaints carry a standard 24-hour SLA. Hazardous waste, construction debris (C&D), and bio-waste must not be mixed with municipal solid waste and require specialized dispatch requests. Bulk waste pick-ups can be scheduled through the municipal helpline or designated collection drives.', true),

(4, 'Streetlight Maintenance and Electrical Safety Protocol', 'Electricity & Public Lighting Division', 'Electricity',
 'Public lighting networks are monitored for energy efficiency and public safety. Standard dark-street or single-lamp failures have an SLA of 24 to 48 hours. Urgent safety concerns such as exposed live wiring, sparking junctions, leaning electric poles, or submerged electrical boxes are marked as CRITICAL and require on-site technical response within 2 hours. Citizens must never touch fallen electrical wires and must maintain a minimum 10-meter clearance zone.', true),

(5, 'Drainage Emergencies and Monsoon Preparedness', 'Drainage & Stormwater Authority', 'Drainage',
 'Clogged storm drains and sewage overflow during monsoon months pose acute flood risks and disease hazards. The department maintains rapid-action desilting units equipped with suction tankers and jetting machines. Open manholes are classified as CRITICAL safety hazards with an immediate 4-hour replacement and safety barricading SLA. Citizens are advised not to dispose of solid plastic waste or motor oil into curbside storm drains.', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('knowledge_documents', 'id'), coalesce(max(id), 1)) FROM knowledge_documents;
