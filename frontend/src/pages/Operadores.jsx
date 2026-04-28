import React, { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

export default function Operadores() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const response = await api.get('personnel/operators/');
      setOperators(response.data);
    } catch (err) {
      console.error("Error fetching operators:", err);
      setError("Error al cargar operadores");
      // Fallback
      setOperators([
        { cedula: 'V-15.678.901', nombres: 'Carlos', apellidos: 'Mendoza', licencia_grado: 5, vence_lic: '2025-05-12' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  return (
    <div className="flex flex-col gap-6 font-public-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Registro de Operadores</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Administración y control del personal de transporte</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
          Registrar Operador
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar por cédula o nombre..." 
              className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-on-surface-variant">Cargando personal...</div>
          ) : (
            <table className="w-full text-left text-sm text-on-surface">
              <thead className="bg-surface-container text-xs uppercase text-on-surface-variant font-bold">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Cédula</th>
                  <th className="px-6 py-4">Operador</th>
                  <th className="px-6 py-4">Grado de Licencia</th>
                  <th className="px-6 py-4 whitespace-nowrap">Vencimiento</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {operators.map((row) => (
                  <tr key={row.cedula} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{row.cedula}</td>
                    <td className="px-6 py-4 font-bold">{row.nombres} {row.apellidos}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-outline-variant bg-surface-container text-on-surface">
                        Grado {row.licencia_grado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.vence_lic}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                        <button className="text-on-surface-variant hover:text-error p-1 rounded-full hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
