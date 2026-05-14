import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Alertas = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [dateRange, setDateRange] = useState('all'); // all, expired, soon, month
  const [branding, setBranding] = useState({
    nombre_sistema: 'Transporte Aragua Digital',
    logo: null
  });

  useEffect(() => {
    if (!hasPermission('Alertas', 'Leer')) {
        setLoading(false);
        return;
    }
    const fetchData = async () => {
      try {
        const [alertsRes, brandingRes] = await Promise.all([
          api.get('users/alerts/'),
          api.get('catalogs/configuracion-visual/')
        ]);
        setAlerts(alertsRes.data);
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
    fetchData();
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // 1. Search filter
      const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            alert.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Priority filter
      const matchesType = filterType === 'all' || alert.type === filterType;
      
      // 3. Date Selection (Manual)
      let matchesManualDate = true;
      if (filterDate) {
        const alertDate = new Date(alert.date).toISOString().split('T')[0];
        matchesManualDate = alertDate === filterDate;
      }

      // 4. Date Range (Quick Filters)
      let matchesRange = true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const alertDate = new Date(alert.date);
      alertDate.setHours(0, 0, 0, 0);

      if (dateRange === 'expired') {
        matchesRange = alertDate < today;
      } else if (dateRange === 'soon') {
        const next7Days = new Date(today);
        next7Days.setDate(today.getDate() + 7);
        matchesRange = alertDate >= today && alertDate <= next7Days;
      } else if (dateRange === 'month') {
        matchesRange = alertDate.getMonth() === today.getMonth() && alertDate.getFullYear() === today.getFullYear();
      }
      
      return matchesSearch && matchesType && matchesManualDate && matchesRange;
    });
  }, [alerts, searchTerm, filterType, filterDate, dateRange]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const date = new Date().toLocaleDateString('es-ES', { 
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    // --- Header Corporativo ---
    doc.setFillColor(3, 36, 72); 
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(branding.nombre_sistema.toUpperCase(), 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('CENTRO DE GESTIÓN OPERATIVA Y ALERTAS TEMPRANAS', 20, 33);
    doc.setDrawColor(255, 255, 255, 0.5);
    doc.line(20, 37, 100, 37);

    // --- Información del Reporte ---
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME ESTADO DE ALERTAS Y VENCIMIENTOS', 20, 60);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(`Documento emitido el: ${date}`, pageWidth - 20, 60, { align: 'right' });

    // --- Resumen Ejecutivo ---
    const criticalCount = filteredAlerts.filter(a => a.type === 'error').length;
    const warningCount = filteredAlerts.filter(a => a.type === 'warning').length;

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(20, 68, pageWidth - 40, 25, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 36, 72);
    doc.text('RESUMEN EJECUTIVO', 25, 75);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Total de registros: ${filteredAlerts.length}`, 25, 83);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`Prioridad Crítica: ${criticalCount}`, 70, 83);
    
    doc.setTextColor(217, 119, 6);
    doc.text(`Advertencias: ${warningCount}`, 120, 83);

    // --- Tabla de Datos ---
    const tableData = filteredAlerts.map(alert => [
      alert.type === 'error' ? 'CRÍTICA' : 'AVISO',
      alert.title,
      alert.message,
      new Date(alert.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    ]);

    autoTable(doc, {
      head: [['Prioridad', 'Concepto / Recurso', 'Descripción Detallada', 'Vencimiento']],
      body: tableData,
      startY: 100,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 4, valign: 'middle' },
      headStyles: {
        fillColor: [3, 36, 72],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 45, fontStyle: 'bold' },
        3: { cellWidth: 25, halign: 'center' }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 0) {
          if (data.cell.raw === 'CRÍTICA') data.cell.styles.textColor = [220, 38, 38];
          else data.cell.styles.textColor = [217, 119, 6];
        }
      },
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });

    // --- Pie de Página ---
    const totalPagesCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPagesCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Reporte Oficial - ${branding.nombre_sistema} - Página ${i} de ${totalPagesCount}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
      doc.setFontSize(7);
      doc.text("Documento oficial para fines administrativos. Información sujeta a reserva legal.", pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    doc.save(`Reporte_Alertas_${new Date().getTime()}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasPermission('Alertas', 'Leer')) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 font-public-sans">
        <div className="w-24 h-24 bg-error/10 text-error rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[48px]">lock</span>
        </div>
        <h3 className="text-2xl font-black text-on-surface mb-2">Acceso Denegado</h3>
        <p className="text-sm font-medium text-on-surface-variant max-w-md">No tienes los permisos necesarios para visualizar el centro de alertas. Por favor, contacta al administrador del sistema.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-8 bg-primary text-on-primary px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 font-public-sans pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2 md:pt-4 border-b border-outline-variant/60 pb-8">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-on-surface tracking-tighter mb-1 md:mb-2 text-center md:text-left">Centro de Alertas</h2>
          <p className="text-xs md:text-sm text-on-surface-variant font-bold text-center md:text-left opacity-70">Gestión preventiva de vencimientos y notificaciones operativas.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
          <div className="bg-error/10 px-6 py-3 rounded-2xl border border-error/20 flex items-center justify-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-error animate-pulse text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
              <span className="text-xs md:text-sm font-black text-error uppercase tracking-wider">{alerts.length} Notificaciones</span>
          </div>
          <button 
            onClick={generatePDF}
            className="bg-primary text-on-primary px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Exportar Informe
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      {/* Optimized Filter Bar - Compact & Professional */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 p-5 rounded-[32px] shadow-sm space-y-4">
        <div className="flex flex-col xl:flex-row items-center gap-4">
          {/* Search Field */}
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar recurso o placa..."
              className="w-full pl-11 pr-4 py-3 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-bold transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Controls Group */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Priority Selector (Compact) */}
            <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 w-full sm:w-auto">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'error', label: 'Críticas' },
                { id: 'warning', label: 'Avisos' }
              ].map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setFilterType(t.id)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterType === t.id ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Date Manual Picker (Compact) */}
            <div className="relative w-full sm:w-44">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[18px] z-10 pointer-events-none">calendar_today</span>
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => { setFilterDate(e.target.value); setDateRange('all'); }}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-2.5 pl-10 pr-3 text-xs font-bold outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quick Filters and Stats Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Filtros Rápidos:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Historial' },
                { id: 'expired', label: 'Vencidos' },
                { id: 'soon', label: 'Próx. 7 días' },
                { id: 'month', label: 'Este mes' }
              ].map((r) => (
                <button 
                  key={r.id}
                  onClick={() => { setDateRange(r.id); setFilterDate(''); }}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${dateRange === r.id ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/20' : 'bg-surface-container-low text-on-surface-variant border-transparent hover:border-outline-variant/40'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
             <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                <span className="material-symbols-outlined text-[16px]">done_all</span> 
                <span>{filteredAlerts.length} Resultados</span>
             </div>

            {(searchTerm || filterType !== 'all' || filterDate || dateRange !== 'all') && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterDate(''); setDateRange('all'); }}
                className="text-[10px] font-black text-error uppercase tracking-widest flex items-center gap-2 hover:underline"
              >
                <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Grid - Optimized Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => (
            <div 
              key={index}
              className={`group bg-surface-container-lowest border border-outline-variant/40 p-5 rounded-[28px] transition-all hover:shadow-xl hover:-translate-y-1 ${alert.type === 'error' ? 'hover:border-error/30' : 'hover:border-primary/30'}`}
            >
              <div className="flex items-start gap-4 h-full">
                {/* Icon Column */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-12 ${alert.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {alert.icon}
                  </span>
                </div>
                
                {/* Content Column */}
                <div className="flex-1 flex flex-col justify-between h-full min-h-[110px]">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className={`text-sm md:text-base font-black tracking-tight line-clamp-1 ${alert.type === 'error' ? 'text-error' : 'text-on-surface'}`}>{alert.title}</h3>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0 ${alert.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                        {alert.type === 'error' ? 'Urgente' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-on-surface-variant font-medium text-xs leading-relaxed line-clamp-2">{alert.message}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-auto border-t border-outline-variant/30">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Vencimiento</span>
                      <span className="font-black text-xs text-on-surface">{new Date(alert.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <button 
                      onClick={() => navigate(alert.link)}
                      className="bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group/btn active:scale-95"
                    >
                      Gestionar
                      <span className="material-symbols-outlined text-[14px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-[32px] md:rounded-[40px] p-10 md:p-20 flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-surface-container rounded-full flex items-center justify-center mb-4 md:mb-6">
              <span className="material-symbols-outlined text-[36px] md:text-[48px] text-on-surface-variant">verified_user</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-on-surface mb-2">Sin alertas activas</h3>
            <p className="text-xs md:text-sm font-medium text-on-surface-variant max-w-md">No hay notificaciones que coincidan con tus filtros. El sistema se encuentra en estado óptimo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alertas;
