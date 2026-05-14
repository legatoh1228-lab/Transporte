import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/common/Modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Asignaciones = () => {
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();
    const canCreate = hasPermission('Asignaciones', 'Crear');
    const canDelete = hasPermission('Asignaciones', 'Eliminar');

    const [asignaciones, setAsignaciones] = useState([]);
    const [operators, setOperators] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedAsignacion, setSelectedAsignacion] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form state
    const [formData, setFormData] = useState({
        operador: '',
        vehiculo: '',
        ruta: '',
        estatus: 'Activo',
        observaciones: ''
    });

    const [branding, setBranding] = useState({
        nombre_sistema: 'Transporte Aragua Digital',
        logo: null
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [asignRes, optRes, vehRes, routeRes, brandingRes] = await Promise.all([
                api.get('fleet/asignaciones-operativas/'),
                api.get('personnel/operators/'),
                api.get('fleet/vehicles/'),
                api.get('routes/rutas/'),
                api.get('catalogs/configuracion-visual/')
            ]);
            setAsignaciones(asignRes.data);
            setOperators(optRes.data);
            setVehicles(vehRes.data);
            setRoutes(routeRes.data);
            if (brandingRes.data) {
                setBranding({
                    nombre_sistema: brandingRes.data.nombre_sistema || 'Transporte Aragua Digital',
                    logo: brandingRes.data.logo
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasPermission('Asignaciones', 'Leer')) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, []);

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const date = new Date().toLocaleDateString('es-ES', { 
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        doc.setFillColor(3, 36, 72); 
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(branding.nombre_sistema.toUpperCase(), 20, 25);
        
        doc.setFontSize(10);
        doc.text('REPORTE DE ASIGNACIONES OPERATIVAS', 20, 32);

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.text(`Fecha: ${date}`, pageWidth - 20, 50, { align: 'right' });
        doc.text(`Total asignaciones: ${asignaciones.length}`, 20, 50);

        const tableData = asignaciones.map(a => [
            `${a.operador_nombre} ${a.operador_apellido}\n(${a.operador})`,
            a.vehiculo_placa,
            a.ruta_nombre,
            new Date(a.fecha_inicio).toLocaleDateString('es-ES'),
            a.estatus.toUpperCase()
        ]);

        autoTable(doc, {
            head: [['Operador', 'Unidad', 'Ruta Asignada', 'F. Inicio', 'Estatus']],
            body: tableData,
            startY: 60,
            theme: 'striped',
            headStyles: { fillColor: [3, 36, 72], textColor: [255, 255, 255], fontSize: 9 },
            styles: { fontSize: 8, cellPadding: 4 }
        });

        doc.save(`Asignaciones_${new Date().getTime()}.pdf`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('fleet/asignaciones-operativas/', formData);
            setShowModal(false);
            setFormData({ operador: '', vehiculo: '', ruta: '', estatus: 'Activo', observaciones: '' });
            fetchData();
        } catch (error) {
            alert("Error al crear la asignación.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Desea eliminar esta asignación?")) {
            try {
                await api.delete(`fleet/asignaciones-operativas/${id}/`);
                fetchData();
            } catch (error) {
                alert("Error al eliminar.");
            }
        }
    };

    const filteredAsignaciones = asignaciones.filter(a => 
        (a.operador_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.operador_apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.vehiculo_placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.ruta_nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-on-surface-variant font-black uppercase tracking-widest text-xs animate-pulse">Sincronizando Operaciones...</p>
        </div>
    );

    if (!hasPermission('Asignaciones', 'Leer')) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 bg-surface-container-lowest rounded-[40px] border border-outline-variant/30">
                <span className="material-symbols-outlined text-error text-7xl mb-4 animate-bounce">lock_person</span>
                <h2 className="text-3xl font-black text-on-surface tracking-tighter">Acceso Restringido</h2>
                <p className="text-on-surface-variant font-medium mt-2 max-w-sm">No posee las credenciales necesarias para gestionar la tabla de asignaciones.</p>
                <button onClick={() => navigate('/dashboard')} className="mt-8 bg-primary text-on-primary px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-all">Volver al Panel</button>
            </div>
        );
    }

    const selectedOperatorObj = formData.operador ? operators.find(op => op.cedula === formData.operador) : null;
    const selectedVehicleObj = formData.vehiculo ? vehicles.find(v => v.placa === formData.vehiculo) : null;

    return (
        <div className="space-y-8 font-public-sans pb-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/50 pb-8 pt-4">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-none">Asignaciones</h1>
                    <p className="text-sm font-bold text-on-surface-variant opacity-70">Control operativo de vinculación entre operadores, unidades y rutas.</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="bg-surface-container-high px-5 py-3 rounded-2xl border border-outline-variant/50 flex items-center gap-4 shadow-sm">
                      <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_ind</span>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none">Operaciones Activas</span>
                         <span className="text-xl font-black text-on-surface leading-tight">{asignaciones.length}</span>
                      </div>
                   </div>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-[32px] p-5 flex flex-col lg:flex-row gap-5 justify-between items-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-20"></div>
                <div className="relative w-full lg:max-w-md group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[22px] group-focus-within:text-primary transition-colors">search</span>
                    <input 
                        className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-2xl text-sm font-bold text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                        placeholder="Buscar por placa, operador o ruta..." 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                    <button 
                        onClick={generatePDF}
                        className="flex-1 sm:flex-none px-6 py-4 bg-surface-container-high text-on-surface border border-outline-variant rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary hover:text-on-primary transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                        Reporte
                    </button>
                    {canCreate && (
                        <button 
                            onClick={() => setShowModal(true)}
                            className="flex-1 sm:flex-none px-8 py-4 bg-primary text-on-primary rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[20px]">add_task</span>
                            Nueva Asignación
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-[36px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-surface-container-high/60">
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Operador Asignado</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Unidad</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Ruta Vinculada</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant">F. Inicio</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/30">
                            {filteredAsignaciones.map((asig) => (
                                <tr key={asig.id} className="hover:bg-primary/[0.03] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                <span className="material-symbols-outlined text-[24px]">person</span>
                                            </div>
                                            <div>
                                                <div className="font-black text-on-surface text-base leading-none">{asig.operador_nombre} {asig.operador_apellido}</div>
                                                <div className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider mt-1.5 opacity-60">ID: {asig.operador}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-surface-container-high rounded-xl border border-outline-variant/50">
                                            <span className="material-symbols-outlined text-[18px] text-secondary">directions_bus</span>
                                            <span className="font-mono font-black text-primary text-sm tracking-tighter">{asig.vehiculo_placa}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[20px] text-tertiary">alt_route</span>
                                            <span className="font-bold text-sm text-on-surface">{asig.ruta_nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-on-surface-variant">{new Date(asig.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-tighter w-fit px-1.5 py-0.5 rounded ${asig.estatus === 'Activo' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                                                {asig.estatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center items-center gap-2">
                                            <button 
                                                onClick={() => { setSelectedAsignacion(asig); setIsDetailOpen(true); }}
                                                className="w-11 h-11 flex items-center justify-center rounded-2xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                                            >
                                                <span className="material-symbols-outlined text-[22px]">visibility</span>
                                            </button>
                                            {canDelete && (
                                                <button 
                                                    onClick={() => handleDelete(asig.id)}
                                                    className="w-11 h-11 flex items-center justify-center rounded-2xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-all border border-transparent hover:border-error/20"
                                                >
                                                    <span className="material-symbols-outlined text-[22px]">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="Detalles de Asignación"
                icon="info"
                maxWidthClass="max-w-2xl"
                actions={<button onClick={() => setIsDetailOpen(false)} className="bg-primary text-on-primary px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest">Cerrar</button>}
            >
                {selectedAsignacion && (
                    <div className="space-y-6 p-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-surface-container rounded-[24px] border border-outline-variant/30">
                                <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest block mb-2">Operador</span>
                                <p className="font-black text-on-surface">{selectedAsignacion.operador_nombre} {selectedAsignacion.operador_apellido}</p>
                                <p className="text-xs font-bold text-primary mt-1">{selectedAsignacion.operador}</p>
                            </div>
                            <div className="p-5 bg-surface-container rounded-[24px] border border-outline-variant/30">
                                <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest block mb-2">Unidad</span>
                                <p className="font-black text-on-surface">{selectedAsignacion.vehiculo_placa}</p>
                            </div>
                        </div>
                        <div className="p-5 bg-surface-container rounded-[24px] border border-outline-variant/30">
                            <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest block mb-2">Ruta Asignada</span>
                            <p className="font-black text-on-surface">{selectedAsignacion.ruta_nombre}</p>
                        </div>
                        <div className="p-5 bg-surface-container rounded-[24px] border border-outline-variant/30">
                            <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest block mb-2">Observaciones</span>
                            <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                                {selectedAsignacion.observaciones || 'Sin observaciones registradas para esta asignación.'}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Nueva Asignación Operativa"
                subtitle="Vincula un operador a una unidad y ruta específica"
                icon="assignment_ind"
                maxWidthClass="max-w-5xl"
                actions={
                    <div className="flex gap-4 w-full">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-surface-container-highest hover:bg-surface-variant px-8 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-colors text-on-surface">Cancelar</button>
                        <button type="button" onClick={handleSubmit} className="flex-1 bg-primary hover:bg-primary/90 text-on-primary px-8 py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">Guardar Asignación</button>
                    </div>
                }
            >
                <div className="py-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Form Fields */}
                    <form className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-12 space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                                Operador <span className="text-error">*</span>
                            </label>
                            <select 
                                required 
                                className="w-full bg-surface-container-lowest hover:bg-surface-container border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                                value={formData.operador} onChange={(e) => setFormData({...formData, operador: e.target.value})}
                            >
                                <option value="">Seleccione un operador...</option>
                                {operators.map(op => <option key={op.cedula} value={op.cedula}>{op.nombres} {op.apellidos} ({op.cedula})</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-6 space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-secondary">directions_bus</span>
                                Unidad Asignada <span className="text-error">*</span>
                            </label>
                            <select 
                                required 
                                className="w-full bg-surface-container-lowest hover:bg-surface-container border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                                value={formData.vehiculo} onChange={(e) => setFormData({...formData, vehiculo: e.target.value})}
                            >
                                <option value="">Seleccione unidad...</option>
                                {vehicles.map(v => <option key={v.placa} value={v.placa}>{v.placa}</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-6 space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-tertiary">alt_route</span>
                                Ruta Operativa <span className="text-error">*</span>
                            </label>
                            <select 
                                required 
                                className="w-full bg-surface-container-lowest hover:bg-surface-container border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                                value={formData.ruta} onChange={(e) => setFormData({...formData, ruta: e.target.value})}
                            >
                                <option value="">Seleccione ruta...</option>
                                {routes.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-12 space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">notes</span>
                                Observaciones / Notas
                            </label>
                            <textarea 
                                className="w-full bg-surface-container-lowest hover:bg-surface-container border border-outline-variant rounded-xl py-3 px-4 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all h-28 resize-none shadow-sm"
                                placeholder="Ingrese notas adicionales o instrucciones especiales para esta asignación..."
                                value={formData.observaciones} onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                            />
                        </div>
                    </form>

                    {/* Right: Previews */}
                    <div className="lg:col-span-5 flex flex-col gap-5 lg:border-l border-outline-variant/30 lg:pl-6 pt-4 lg:pt-0 border-t lg:border-t-0">
                        {/* Operador Preview */}
                        <div className={`p-5 rounded-2xl border transition-all duration-300 ${selectedOperatorObj ? 'bg-surface-container-lowest border-primary/30 shadow-sm' : 'bg-surface-container-lowest/50 border-outline-variant border-dashed'}`}>
                            <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest block mb-4">Perfil del Operador</span>
                            {selectedOperatorObj ? (
                                <div className="flex items-center gap-4">
                                    {selectedOperatorObj.foto ? (
                                        <img src={selectedOperatorObj.foto} alt="Operador" className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow-sm shrink-0" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 text-primary flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[32px]">person</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-on-surface truncate">{selectedOperatorObj.nombres} {selectedOperatorObj.apellidos}</p>
                                        <p className="text-xs text-on-surface-variant mt-0.5 font-medium truncate">CI: {selectedOperatorObj.cedula}</p>
                                        <p className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-black w-fit mt-1.5 border border-primary/10">Operador Activo</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center text-on-surface-variant/50 h-20">
                                    <span className="material-symbols-outlined text-[32px] mb-2">account_circle</span>
                                    <p className="text-xs font-medium">Seleccione un operador para previsualizar</p>
                                </div>
                            )}
                        </div>

                        {/* Vehicle Preview */}
                        <div className={`p-5 rounded-2xl border transition-all duration-300 ${selectedVehicleObj ? 'bg-surface-container-lowest border-secondary/30 shadow-sm' : 'bg-surface-container-lowest/50 border-outline-variant border-dashed'}`}>
                            <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest block mb-4">Unidad Asignada</span>
                            {selectedVehicleObj ? (
                                <div className="flex flex-col gap-4">
                                    {selectedVehicleObj.foto ? (
                                        <img src={selectedVehicleObj.foto} alt="Vehículo" className="w-full h-32 rounded-xl object-cover border border-outline-variant/50 shadow-sm" />
                                    ) : (
                                        <div className="w-full h-24 rounded-xl bg-secondary/5 border border-secondary/20 text-secondary flex items-center justify-center shadow-inner">
                                            <span className="material-symbols-outlined text-[40px]">directions_bus</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 pr-4">
                                            <p className="font-bold text-sm text-on-surface truncate">{selectedVehicleObj.marca} {selectedVehicleObj.modelo}</p>
                                            <p className="text-xs font-medium text-on-surface-variant mt-0.5 uppercase tracking-wide">Placa: <span className="font-bold">{selectedVehicleObj.placa}</span></p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase">Capacidad</p>
                                            <p className="text-sm font-black text-secondary">{selectedVehicleObj.capacidad} pax</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center text-on-surface-variant/50 h-24">
                                    <span className="material-symbols-outlined text-[32px] mb-2">directions_bus</span>
                                    <p className="text-xs font-medium">Seleccione una unidad para previsualizar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Asignaciones;
