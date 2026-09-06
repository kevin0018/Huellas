ALTER TABLE `ProcedureSchedule`
  ADD COLUMN `procedure_type` ENUM('VACCINATION', 'GENERAL_CHECKUP', 'MEDICATION', 'TREATMENT', 'TEST', 'SURGERY', 'WEIGHT', 'OTHER') NOT NULL DEFAULT 'OTHER',
  ADD COLUMN `recurrence_days` INTEGER NULL,
  ADD COLUMN `due_window_before_days` INTEGER NOT NULL DEFAULT 14,
  ADD COLUMN `due_window_after_days` INTEGER NOT NULL DEFAULT 14,
  ADD COLUMN `region` VARCHAR(191) NOT NULL DEFAULT 'ES',
  ADD COLUMN `source` VARCHAR(191) NOT NULL DEFAULT 'Huellas MVP guidance',
  ADD COLUMN `version` VARCHAR(191) NOT NULL DEFAULT '2026.1';

UPDATE `ProcedureSchedule`
SET `procedure_type` = CASE
  WHEN LOWER(`procedure_name`) LIKE '%vacun%' THEN 'VACCINATION'
  WHEN LOWER(`procedure_name`) LIKE '%test%' THEN 'TEST'
  WHEN LOWER(`procedure_name`) LIKE '%chequeo%' OR LOWER(`procedure_name`) LIKE '%revisi%' THEN 'GENERAL_CHECKUP'
  WHEN LOWER(`procedure_name`) LIKE '%paras%' THEN 'TREATMENT'
  ELSE 'OTHER'
END,
`recurrence_days` = CASE
  WHEN LOWER(COALESCE(`notes`, '')) LIKE '%cada 2 semanas%' THEN 14
  WHEN LOWER(COALESCE(`notes`, '')) LIKE '%anual%' THEN 365
  ELSE NULL
END;
