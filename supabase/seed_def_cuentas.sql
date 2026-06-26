-- ============================================================
-- Seed: Definición de Cuentas — Impuestos
-- ============================================================
-- Columna izquierda: Impuestos y Retenciones Generales
-- Columna derecha: Impuestos Específicos y Saludables

INSERT INTO def_cuentas_contables (emp_ide, tab, seccion, concepto_id, concepto, cuenta_puc, naturaleza) VALUES

-- IZQUIERDA: Impuestos y Retenciones Generales
('SYSPRO_00001', 'impuestos', 'izquierda', 'retefuente_inv', 'Anticipo de ReteFte Inv (DB)', '135515002', 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'retefuente_serv', 'Anticipo de ReteFte Serv (DB)', '135515002', 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'autorenta', 'Anticipo Autorenta (DB)', '135595', 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'reteiva', 'Anticipo de ReteIva (DB)', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'reteica', 'Anticipo de ReteIca (DB)', '135518', 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'bomberil_db', 'Anticipo Bomberil (DB)', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'autoretencion_ica_cr', 'Autorretencion Ica (CR)', NULL, 'C'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'autoretenciones_cr', 'Autorretenciones (CR)', NULL, 'C'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'autoretencion_renta', 'Autorretencion en renta (CR)', '236575002', 'C'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'impuesto_4xm', 'Impuesto 4 x mil', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'retefuente_intcores', 'Anti ReteFte Intcores(DB)', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'impoconsumo_asumido', 'Impoconsumo asumido (Db)', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'reteiva_pagar', 'ReteIva x pagar (CR)', '236505', 'C'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'reteica_pagar', 'ReteIca x pagar (CR)', '236801', 'C'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'bomberil_pagar', 'Bomberil x pagar (CR)', NULL, 'C'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'retefuente_asum_comp', 'ReteFuente asumida Compras', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'retefuente_asum_serv', 'ReteFuente asumida Servicios', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'retefuente_asum_honor', 'ReteFuente asumida Honorarios', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'retecree_asum_comp', 'ReteCree asumida Compras', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'retecree_asum_serv', 'ReteCree asumida Servicios', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'izquierda', 'retecree_asum_honor', 'ReteCree asumida Honorarios', NULL, 'D'),

-- DERECHA: Impuestos Específicos y Saludables
('SYSPRO_00001', 'impuestos', 'derecha', 'bolsa_asumido_db', 'Impuesto a la bolsa asumido (Db)', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'derecha', 'bolsa_asumido_cr', 'Impuesto a la bolsa asumido (Cr)', NULL, 'C'),
('SYSPRO_00001', 'impuestos', 'derecha', 'retefte_mandatos_db', 'Anticipo ReteFte Mandatos (DB)', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'derecha', 'reteica_mandatos_db', 'Anticipo de Retelca mandatos (DB)', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'derecha', 'bomberil_mandatos_db', 'Anticipo Bomberil mandatos(DB)', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'derecha', 'avisos_tableros_db', 'Anticipo avisos y tableros (DB)', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'derecha', 'avisos_tableros_mandato_db', 'Anticipo avisos y tableros mandato(DB)', NULL, 'D'),
('SYSPRO_00001', 'impuestos', 'derecha', 'ibua_cr', 'Impuesto saludable IBUA (CR)', '240204', 'C'),
('SYSPRO_00001', 'impuestos', 'derecha', 'icui_cr', 'Impuesto saludable ICUI (CR)', '240202', 'C'),
('SYSPRO_00001', 'impuestos', 'derecha', 'inpp_cr', 'Impuesto Nacional sobre Productos Plásticos - INPP (CR)', NULL, 'C'),
('SYSPRO_00001', 'impuestos', 'derecha', 'inpp_db', 'Impuesto Nacional sobre Productos Plásticos - INPP (DB)', NULL, 'D')
ON CONFLICT (ide, emp_ide) DO NOTHING;
