import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { usePermissions } from '../hooks/usePermissions';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from '../components/common/PaginationControls';

const Gremios = () => {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('Organizaciones', 'Crear');
  const canUpdate = hasPermission('Organizaciones', 'Actualizar');
  const canDelete = hasPermission('Organizaciones', 'Eliminar');

  const [gremios, setGremios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, razon_social: '' });
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    rif: '',
    razon_social: '',
    direccion: '',
    anio_creacion: '',
    telefono: '',
    correo: '',
  });

  const fetchGremios = async () => {
    try {
      setLoading(true);
      const res = await api.get('organizations/gremios/');
      setGremios(res.data);
    } catch (err) {
      console.error('Error fetching gremios:', err);
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGremios(); }, []);

  const resetForm = () => {
    setFormData({ rif: '', razon_social: '', direccion: '', anio_creacion: '', telefono: '', correo: '' });
    setIsEditing(false);
    setFormError(null);
  };

  const handleOpenCreate = () => { resetForm(); setIsModalOpen(true); };

  const handleEdit = (g) => {
    setFormData({
      id: g.id,
      rif: g.rif || '',
      razon_social: g.razon_social || '',
      direccion: g.direccion || '',
      anio_creacion: g.anio_creacion || '',
      telefono: g.telefono || '',
      correo: g.correo || '',
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.rif || !formData.razon_social) {
      setFormError('El RIF y la Razón Social son obligatorios.');
      return;
    }
    const payload = { ...formData, anio_creacion: formData.anio_creacion || null };
    try {
      if (isEditing) {
        await api.put(`organizations/gremios/${formData.id}/`, payload);
      } else {
        await api.post('organizations/gremios/', payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchGremios();
    } catch (err) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Error al guardar.';
      setFormError(msg);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`organizations/gremios/${deleteModal.id}/`);
      setDeleteModal({ isOpen: false, id: null, razon_social: '' });
      fetchGremios();
    } catch (err) {
      alert('No se pudo eliminar el gremio. Puede tener organizaciones asociadas.');
    }
  };

  const filteredGremios = gremios.filter(g =>
    g.rif.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.correo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    paginatedData, currentPage, totalPages, totalFiltered,
    startIndex, endIndex, hasNextPage, hasPrevPage, goToPage, nextPage, prevPage
  } = usePagination(filteredGremios, { itemsPerPage: 10, enableSearch: false, enableFilter: false });

  return (
    <div className="space-y-6 font-public-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <span className="material-symbols-outlined text-[20px]">groups</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Registro de Agremiaciones</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-black">Gremios y Federaciones</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Administración de gremios, federaciones y asociaciones de transporte a los que pertenecen las organizaciones operadoras.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-2xl border border-outline-variant/50">
            <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Total</span>
              <span className="text-lg font-black text-on-surface leading-tight">{gremios.length}</span>
            </div>
          </div>
          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="bg-primary text-on-primary px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Nuevo Gremio
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-[32px] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-outline-variant/50 bg-surface-container-low/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50">search</span>
            <input
              type="text"
              placeholder="Buscar por RIF, razón social o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant bg-surface-container px-4 py-2 rounded-xl border border-outline-variant/40">
            <span className="material-symbols-outlined text-[16px] text-primary">filter_list</span>
            {totalFiltered} registros
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-on-surface-variant font-bold animate-pulse">Cargando gremios...</p>
            </div>
          ) : error ? (
            <div className="p-20 text-center flex flex-col items-center gap-3 opacity-60">
              <span className="material-symbols-outlined text-[48px] text-error">error</span>
              <p className="font-bold text-on-surface">{error}</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-on-surface border-collapse">
              <thead className="bg-surface-container-high/50 text-[11px] uppercase text-on-surface-variant font-black tracking-widest border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4">RIF / Razón Social</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Dirección</th>
                  <th className="px-6 py-4 text-center">Año Fundación</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 bg-surface-container-lowest">
                {paginatedData.length > 0 ? paginatedData.map((g) => (
                  <tr key={g.id} className="hover:bg-surface-container-low transition-all group border-b border-outline-variant/30">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <span className="material-symbols-outlined text-primary text-[22px]">groups</span>
                        </div>
                        <div>
                          <div className="font-black text-on-surface text-[15px] leading-tight">{g.razon_social}</div>
                          <div className="font-mono text-[11px] text-primary font-bold mt-0.5 tracking-wider">{g.rif}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        {g.telefono && (
                          <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant font-medium">
                            <span className="material-symbols-outlined text-[14px]">call</span>
                            {g.telefono}
                          </div>
                        )}
                        {g.correo && (
                          <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant font-medium">
                            <span className="material-symbols-outlined text-[14px]">mail</span>
                            {g.correo}
                          </div>
                        )}
                        {!g.telefono && !g.correo && <span className="text-[11px] text-on-surface-variant/40 italic">Sin contacto</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[12px] text-on-surface-variant font-medium line-clamp-2 max-w-[220px]">
                        {g.direccion || <span className="italic opacity-40">Sin dirección</span>}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {g.anio_creacion ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-[11px] font-black bg-secondary-container text-on-secondary-container">
                          {g.anio_creacion}
                        </span>
                      ) : (
                        <span className="text-[11px] text-on-surface-variant/40 italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewModal({ isOpen: true, data: g })}
                          className="w-9 h-9 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center"
                          title="Ver detalle"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => handleEdit(g)}
                            className="w-9 h-9 rounded-xl text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-all flex items-center justify-center"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, id: g.id, razon_social: g.razon_social })}
                            className="w-9 h-9 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-all flex items-center justify-center"
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <span className="material-symbols-outlined text-[48px] mb-2">group_off</span>
                        <p className="font-black">No se encontraron gremios</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
          <PaginationControls
            currentPage={currentPage} totalPages={totalPages} totalFiltered={totalFiltered}
            startIndex={startIndex} endIndex={endIndex} totalItems={gremios.length}
            hasNextPage={hasNextPage} hasPrevPage={hasPrevPage}
            onPageChange={goToPage} onNextPage={nextPage} onPrevPage={prevPage}
          />
        </div>
      </div>

      {/* View Detail Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, data: null })}
        title="Ficha del Gremio"
        icon="groups"
        maxWidthClass="max-w-2xl"
        actions={
          <button onClick={() => setViewModal({ isOpen: false, data: null })} className="bg-surface-container-highest px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all shadow-sm">
            Cerrar
          </button>
        }
      >
        {viewModal.data && (
          <div className="space-y-6 py-2">
            <div className="flex items-center gap-6 bg-surface-container-low p-6 rounded-[28px] border border-outline-variant/30">
              <div className="w-20 h-20 rounded-[28px] bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[40px]">groups</span>
              </div>
              <div>
                <div className="inline-flex px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-2">
                  {viewModal.data.rif}
                </div>
                <h2 className="text-2xl font-black text-on-surface tracking-tight">{viewModal.data.razon_social}</h2>
                {viewModal.data.anio_creacion && (
                  <p className="text-sm text-on-surface-variant font-medium mt-1">Fundado en {viewModal.data.anio_creacion}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Teléfono', value: viewModal.data.telefono, icon: 'call' },
                { label: 'Correo Electrónico', value: viewModal.data.correo, icon: 'mail' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">{icon}</span>
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{label}</span>
                  </div>
                  <p className="font-bold text-on-surface text-sm">{value || <span className="italic text-on-surface-variant/40">No registrado</span>}</p>
                </div>
              ))}
            </div>
            {viewModal.data.direccion && (
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Dirección</span>
                </div>
                <p className="font-medium text-on-surface text-sm leading-relaxed border-l-4 border-primary/20 pl-3">{viewModal.data.direccion}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={isEditing ? 'Modificar Gremio' : 'Registrar Nuevo Gremio'}
        icon={isEditing ? 'edit_square' : 'group_add'}
        maxWidthClass="max-w-2xl"
        actions={
          <div className="flex gap-4 w-full justify-end">
            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-8 py-3 text-sm font-black text-on-surface-variant hover:bg-surface-container-highest rounded-2xl transition-all uppercase tracking-widest">
              Cancelar
            </button>
            <button onClick={handleSubmit} className="px-10 py-3 text-sm font-black text-on-primary bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 transition-all uppercase tracking-widest active:scale-95">
              {isEditing ? 'Guardar Cambios' : 'Registrar Gremio'}
            </button>
          </div>
        }
      >
        <form className="space-y-6 py-2">
          {formError && (
            <div className="bg-error/10 border border-error/20 p-4 rounded-2xl flex items-center gap-3">
              <span className="material-symbols-outlined text-error text-[22px]">warning</span>
              <p className="text-[11px] font-black text-error uppercase tracking-widest">{formError}</p>
            </div>
          )}

          {/* RIF + Razón Social */}
          <div className="bg-surface-container-low p-6 rounded-[28px] border border-outline-variant/30 space-y-5">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">badge</span>
              Identificación Legal
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">RIF <span className="text-error">*</span></label>
                <input
                  name="rif" value={formData.rif} onChange={handleInputChange}
                  disabled={isEditing}
                  placeholder="J-00000000-0"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-wider disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Año de Fundación</label>
                <input
                  type="number" name="anio_creacion" value={formData.anio_creacion} onChange={handleInputChange}
                  placeholder="Ej: 1995" min="1900" max={new Date().getFullYear()}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Razón Social <span className="text-error">*</span></label>
              <input
                name="razon_social" value={formData.razon_social} onChange={handleInputChange}
                placeholder="Nombre completo del gremio o federación..."
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-surface-container-low p-6 rounded-[28px] border border-outline-variant/30 space-y-5">
            <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">contact_phone</span>
              Información de Contacto
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Teléfono</label>
                <input
                  name="telefono" value={formData.telefono} onChange={handleInputChange}
                  placeholder="+58-243-0000000"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Correo Electrónico</label>
                <input
                  type="email" name="correo" value={formData.correo} onChange={handleInputChange}
                  placeholder="contacto@gremio.ve"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Dirección</label>
              <textarea
                name="direccion" value={formData.direccion} onChange={handleInputChange}
                placeholder="Av., Calle, Municipio, Estado..."
                rows={3}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all resize-none"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, razon_social: '' })}
        title="Confirmar Eliminación"
        icon="delete_forever"
        maxWidthClass="max-w-md"
        actions={
          <div className="flex gap-4 w-full justify-end">
            <button onClick={() => setDeleteModal({ isOpen: false, id: null, razon_social: '' })} className="px-8 py-3 text-sm font-black text-on-surface-variant hover:bg-surface-container-highest rounded-2xl transition-all uppercase tracking-widest">
              Cancelar
            </button>
            <button onClick={handleDeleteConfirm} className="px-8 py-3 text-sm font-black text-on-error bg-error hover:bg-error/90 rounded-2xl shadow-lg shadow-error/20 transition-all uppercase tracking-widest active:scale-95">
              Eliminar
            </button>
          </div>
        }
      >
        <div className="py-4 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-error text-[36px]">warning</span>
          </div>
          <p className="text-on-surface font-bold">¿Está seguro de eliminar el gremio?</p>
          <p className="text-sm font-black text-primary">{deleteModal.razon_social}</p>
          <p className="text-xs text-on-surface-variant font-medium">Esta acción no se puede deshacer. Las organizaciones asociadas quedarán sin gremio asignado.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Gremios;
