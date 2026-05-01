-- SchoolTrack — reference seed data (idempotent: TRUNCATE + INSERT).
-- Apply with: psql "$POSTGRES_URL_NON_POOLING" -f supabase/seed.sql
-- DOES NOT seed auth.users — that is done by scripts/seed-users.mjs
-- which uses the service_role admin API.

set search_path = public;

truncate table marks, exams, subjects, messages, holidays, attendance,
               students, teachers, classes, schools restart identity cascade;

-- ─── Schools ────────────────────────────────────────────────────────────────
insert into schools (id, name, city, credits, active) values
  ('SCH001', 'Greenwood Academy',       'Mumbai',    420, true),
  ('SCH002', 'Sunrise Public School',   'Delhi',      88, true),
  ('SCH003', 'Blue Ridge International','Bangalore', 650, true);

-- ─── Classes ────────────────────────────────────────────────────────────────
insert into classes (id, school_id, name, section, grade) values
  ('CLS001', 'SCH001', 'Grade 5A', 'A', 5),
  ('CLS002', 'SCH001', 'Grade 5B', 'B', 5),
  ('CLS003', 'SCH001', 'Grade 6A', 'A', 6);

-- ─── Teachers ───────────────────────────────────────────────────────────────
insert into teachers (id, school_id, class_id, name, email, phone) values
  ('T001', 'SCH001', 'CLS001', 'Ms. Priya Sharma', 'priya@greenwood.edu', '+919876543210'),
  ('T002', 'SCH001', 'CLS002', 'Mr. Rahul Mehta',  'rahul@greenwood.edu', '+919876543211'),
  ('T003', 'SCH001', 'CLS003', 'Ms. Anita Roy',    'anita@greenwood.edu', '+919876543212');

-- ─── Students ───────────────────────────────────────────────────────────────
insert into students (id, school_id, class_id, name, roll, parent_phone, dob, gender, father_name, mother_name, attendance_pct) values
  ('S001','SCH001','CLS001','Aarav Patel','01','+919800001111','2015-01-12','Male','Rajesh Patel','Priya Patel',92),
  ('S002','SCH001','CLS001','Diya Singh','02','+919800001112','2015-03-03','Female','Amit Singh','Sunita Singh',88),
  ('S003','SCH001','CLS001','Kabir Sharma','03','+919800001113','2015-06-22','Male','Vikram Sharma','Neha Sharma',95),
  ('S004','SCH001','CLS001','Meera Joshi','04','+919800001114','2015-08-15','Female','Suresh Joshi','Kavita Joshi',79),
  ('S005','SCH001','CLS001','Rohan Gupta','05','+919800001115',null,'Male',null,null,86),
  ('S006','SCH001','CLS001','Sia Kumar','06','+919800001116',null,'Female',null,null,90),
  ('S007','SCH001','CLS002','Aditya Nair','01','+919800002221',null,'Male',null,null,84),
  ('S008','SCH001','CLS002','Pooja Iyer','02','+919800002222',null,'Female',null,null,91),
  ('S009','SCH001','CLS002','Vikram Das','03','+919800002223',null,'Male',null,null,77),
  ('S010','SCH001','CLS003','Nisha Verma','01','+919800003331',null,'Female',null,null,89),
  ('S011','SCH001','CLS003','Arjun Bose','02','+919800003332',null,'Male',null,null,82);

-- ─── Attendance (sample for 2026-03-04) ─────────────────────────────────────
insert into attendance (id, school_id, class_id, student_id, date, status, teacher_id, photo) values
  ('A001','SCH001','CLS001','S001','2026-03-04','present','T001',true),
  ('A002','SCH001','CLS001','S002','2026-03-04','absent', 'T001',true),
  ('A003','SCH001','CLS001','S003','2026-03-04','present','T001',true),
  ('A004','SCH001','CLS001','S004','2026-03-04','present','T001',true),
  ('A005','SCH001','CLS001','S005','2026-03-04','absent', 'T001',true),
  ('A006','SCH001','CLS001','S006','2026-03-04','present','T001',true);

-- ─── Holidays ───────────────────────────────────────────────────────────────
insert into holidays (id, school_id, date, title) values
  ('H001','SCH001','2026-03-25','Holi'),
  ('H002','SCH001','2026-04-14','Dr. Ambedkar Jayanti');

-- ─── Messages ───────────────────────────────────────────────────────────────
insert into messages (id, school_id, student_name, parent_phone, date, status) values
  ('M001','SCH001','Diya Singh','+919800001112','2026-03-04 09:15:00+05:30','delivered'),
  ('M002','SCH001','Rohan Gupta','+919800001115','2026-03-04 09:16:00+05:30','delivered');

-- ─── Subjects (Greenwood) ───────────────────────────────────────────────────
insert into subjects (id, school_id, name, has_theory, has_practical, theory_max, practical_max, passing_marks) values
  ('SUB001','SCH001','English',         true, false, 80,  0, 27),
  ('SUB002','SCH001','Mathematics',     true, false, 80,  0, 27),
  ('SUB003','SCH001','Science',         true, true,  60, 20, 23),
  ('SUB004','SCH001','Social Science',  true, false, 80,  0, 27),
  ('SUB005','SCH001','Hindi',           true, false, 80,  0, 27),
  ('SUB006','SCH001','Computer Science',true, true,  50, 30, 20);

-- ─── Exams (Greenwood, Grade 5A) ────────────────────────────────────────────
insert into exams (id, school_id, class_id, name, date_label, session, max_marks, status) values
  ('EX001','SCH001','CLS001','Unit Test 1',       'July 2025',     '2025-26', 100, 'closed'),
  ('EX002','SCH001','CLS001','Half Yearly',       'September 2025','2025-26', 100, 'open'),
  ('EX003','SCH001','CLS001','Unit Test 2',       'November 2025', '2025-26', 100, 'upcoming'),
  ('EX004','SCH001','CLS001','Final Examination', 'March 2026',    '2025-26', 100, 'upcoming');

-- ─── Marks (EX001 — Unit Test 1, Grade 5A subset) ───────────────────────────
insert into marks (school_id, exam_id, student_id, subject_id, theory, practical) values
  -- Aarav (S001)
  ('SCH001','EX001','S001','SUB001',72,0),
  ('SCH001','EX001','S001','SUB002',78,0),
  ('SCH001','EX001','S001','SUB003',54,18),
  ('SCH001','EX001','S001','SUB004',68,0),
  ('SCH001','EX001','S001','SUB005',65,0),
  ('SCH001','EX001','S001','SUB006',44,27),
  -- Diya (S002)
  ('SCH001','EX001','S002','SUB001',58,0),
  ('SCH001','EX001','S002','SUB002',62,0),
  ('SCH001','EX001','S002','SUB003',48,15),
  ('SCH001','EX001','S002','SUB004',55,0),
  ('SCH001','EX001','S002','SUB005',70,0),
  ('SCH001','EX001','S002','SUB006',38,22),
  -- Kabir (S003)
  ('SCH001','EX001','S003','SUB001',76,0),
  ('SCH001','EX001','S003','SUB002',80,0),
  ('SCH001','EX001','S003','SUB003',58,20),
  ('SCH001','EX001','S003','SUB004',74,0),
  ('SCH001','EX001','S003','SUB005',72,0),
  ('SCH001','EX001','S003','SUB006',48,29),
  -- Meera (S004)
  ('SCH001','EX001','S004','SUB001',45,0),
  ('SCH001','EX001','S004','SUB002',38,0),
  ('SCH001','EX001','S004','SUB003',35,12),
  ('SCH001','EX001','S004','SUB004',42,0),
  ('SCH001','EX001','S004','SUB005',50,0),
  ('SCH001','EX001','S004','SUB006',30,18);
