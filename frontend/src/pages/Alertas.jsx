import React, { useState, useEffect } from 'react';
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

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || alert.type === filterType;
    return matchesSearch && matchesType;
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const date = new Date().toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Header Color Bar
    doc.setFillColor(3, 36, 72); // Navy Blue from primary color
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(branding.nombre_sistema.toUpperCase(), 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('REPORTE ADMINISTRATIVO DE ALERTAS', 20, 32);

    // Date and User info
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Fecha de emisión: ${date}`, pageWidth - 20, 50, { align: 'right' });
    doc.text(`Total de alertas: ${filteredAlerts.length}`, 20, 50);

    // Decorative Line
    doc.setDrawColor(230, 230, 230);
    doc.line(20, 55, pageWidth - 20, 55);

    // Table
    const tableData = filteredAlerts.map(alert => [
      alert.type === 'error' ? 'CRÍTICA' : 'ADVERTENCIA',
      alert.title,
      alert.message,
      new Date(alert.date).toLocaleDateString('es-ES')
    ]);

    autoTable(doc, {
      head: [['Prioridad', 'Recurso / Título', 'Descripción de Alerta', 'Vencimiento']],
      body: tableData,
      startY: 60,
      theme: 'striped',
      headStyles: {
        fillColor: [3, 36, 72],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 40, fontStyle: 'bold' },
        3: { cellWidth: 30, halign: 'center' }
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
        valign: 'middle'
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 0) {
          if (data.cell.raw === 'CRÍTICA') {
            data.cell.styles.textColor = [220, 38, 38]; // Red for critical
          } else {
            data.cell.styles.textColor = [217, 119, 6]; // Amber for warning
          }
        }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount} - Documento generado automáticamente por el Sistema de Gestión de Transporte`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2 md:pt-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-on-surface tracking-tight mb-1 md:mb-2 text-center md:text-left">Centro de Alertas</h2>
          <p className="text-xs md:text-sm text-on-surface-variant font-medium text-center md:text-left">Gestión preventiva de vencimientos y notificaciones</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button 
            onClick={generatePDF}
            className="w-full sm:w-auto bg-surface-container-high text-on-surface px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2 border border-outline-variant/30 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Generar PDF
          </button>
          <div className="w-full sm:w-auto bg-error/10 px-6 py-3 rounded-2xl border border-error/20 flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-error animate-pulse text-[20px]">notifications_active</span>
              <span className="text-xs md:text-sm font-black text-error uppercase tracking-wider">{alerts.length} Alertas Activas</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 p-3 md:p-4 rounded-[24px] md:rounded-[28px] shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50">search</span>
          <input 
            type="text" 
            placeholder="Buscar por placa, nombre o descripción..."
            className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide no-scrollbar">
          <button 
            onClick={() => setFilterType('all')}
            className={`flex-1 lg:flex-none whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border ${filterType === 'all' ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high'}`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFilterType('error')}
            className={`flex-1 lg:flex-none whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border ${filterType === 'error' ? 'bg-error text-on-error border-error shadow-lg shadow-error/20' : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high'}`}
          >
            Críticas
          </button>
          <button 
            onClick={() => setFilterType('warning')}
            className={`flex-1 lg:flex-none whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border ${filterType === 'warning' ? 'bg-warning-container text-on-warning-container border-warning shadow-lg' : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high'}`}
          >
            Advertencias
          </button>
        </div>
      </div>

      {/* Alerts Grid/List */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => (
            <div 
              key={index}
              className={`group bg-surface-container-lowest border border-outline-variant/40 p-5 md:p-6 rounded-[24px] md:rounded-[32px] transition-all hover:shadow-xl ${alert.type === 'error' ? 'hover:border-error/30' : 'hover:border-primary/30'}`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[18px] md:rounded-[22px] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${alert.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                  <span className="material-symbols-outlined text-[28px] md:text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {alert.icon}
                  </span>
                </div>
                
                <div className="flex-1 space-y-1 w-full">
                  <div className="flex items-center justify-between md:justify-start gap-3">
                    <h3 className={`text-base md:text-lg font-black tracking-tight ${alert.type === 'error' ? 'text-error' : 'text-on-surface'}`}>{alert.title}</h3>
                    <span className={`text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${alert.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                      {alert.type === 'error' ? 'Urgente' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-on-surface-variant font-medium text-xs md:text-sm leading-relaxed">{alert.message}</p>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/30 md:min-w-[180px]">
                  <div className="text-left md:text-right">
                    <p className="text-[9px] md:text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 mb-0.5 md:mb-1">Vencimiento</p>
                    <p className="font-black text-xs md:text-sm text-on-surface">{new Date(alert.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <button 
                    onClick={() => navigate(alert.link)}
                    className="bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all px-5 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 group/btn active:scale-95"
                  >
                    Gestionar
                    <span className="material-symbols-outlined text-[14px] md:text-[16px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
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
