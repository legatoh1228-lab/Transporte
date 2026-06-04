import re

with open('frontend/src/pages/Vehicles.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add import
import_target = "import { buildPdfHeader, addTableAndSave } from '../utils/pdfExport';"
import_repl = "import { buildPdfHeader, addTableAndSave } from '../utils/pdfExport';\nimport { QRCodeSVG } from 'qrcode.react';"

if import_target in text:
    text = text.replace(import_target, import_repl)
else:
    print("Failed to replace import")

# 2. Add QR Code to Modal Header
header_target = """                   <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-3">
                      <div className="flex items-center gap-3 text-on-surface-variant font-bold text-sm bg-surface-container-highest/30 px-4 py-2 rounded-xl">
                         <span className="material-symbols-outlined text-[20px] text-primary">precision_manufacturing</span>
                         {selectedVehicle.marca} {selectedVehicle.modelo}
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant font-bold text-sm bg-surface-container-highest/30 px-4 py-2 rounded-xl">
                         <span className="material-symbols-outlined text-[20px] text-primary">calendar_today</span>
                         Año {selectedVehicle.anio}
                      </div>
                   </div>
                </div>
             </div>"""

header_repl = """                   <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-3">
                      <div className="flex items-center gap-3 text-on-surface-variant font-bold text-sm bg-surface-container-highest/30 px-4 py-2 rounded-xl">
                         <span className="material-symbols-outlined text-[20px] text-primary">precision_manufacturing</span>
                         {selectedVehicle.marca} {selectedVehicle.modelo}
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant font-bold text-sm bg-surface-container-highest/30 px-4 py-2 rounded-xl">
                         <span className="material-symbols-outlined text-[20px] text-primary">calendar_today</span>
                         Año {selectedVehicle.anio}
                      </div>
                   </div>
                </div>
                <div className="flex flex-col items-center gap-2 mt-6 md:mt-0 md:ml-auto">
                   <div className="bg-white p-2.5 rounded-2xl shadow-md border border-outline-variant/30 flex items-center justify-center hover:scale-105 transition-transform duration-300">
                     <QRCodeSVG 
                        value={`${window.location.origin}/vehiculos?placa=${selectedVehicle.placa}`} 
                        size={100} 
                        level="H" 
                        includeMargin={false} 
                        fgColor="#032448" 
                     />
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
                      Ficha Digital
                   </span>
                </div>
             </div>"""

if header_target in text:
    text = text.replace(header_target, header_repl)
else:
    print("Failed to replace header")

with open('frontend/src/pages/Vehicles.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Vehicles patched successfully.")
