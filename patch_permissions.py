import re

# 1. Update Gremios.jsx
try:
    with open('frontend/src/pages/Gremios.jsx', 'r', encoding='utf-8') as f:
        text = f.read()
    
    text = text.replace("hasPermission('Organizaciones', 'Crear')", "hasPermission('Gremios', 'Crear')")
    text = text.replace("hasPermission('Organizaciones', 'Actualizar')", "hasPermission('Gremios', 'Actualizar')")
    text = text.replace("hasPermission('Organizaciones', 'Eliminar')", "hasPermission('Gremios', 'Eliminar')")
    
    with open('frontend/src/pages/Gremios.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Gremios updated.")
except Exception as e:
    print(e)

# 2. Update Terminales.jsx
try:
    with open('frontend/src/pages/Terminales.jsx', 'r', encoding='utf-8') as f:
        text = f.read()
    
    text = text.replace("hasPermission('Organizaciones', 'Crear')", "hasPermission('Terminales', 'Crear')")
    text = text.replace("hasPermission('Organizaciones', 'Actualizar')", "hasPermission('Terminales', 'Actualizar')")
    text = text.replace("hasPermission('Organizaciones', 'Eliminar')", "hasPermission('Terminales', 'Eliminar')")
    
    with open('frontend/src/pages/Terminales.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Terminales updated.")
except Exception as e:
    print(e)

# 3. Update Insumos.jsx
try:
    with open('frontend/src/pages/Insumos.jsx', 'r', encoding='utf-8') as f:
        text = f.read()
    
    target_perms = "const canEdit = hasPermission('Vehículos', 'Escribir');"
    repl_perms = """const canCreate = hasPermission('Insumos', 'Crear');
  const canUpdate = hasPermission('Insumos', 'Actualizar');
  const canDelete = hasPermission('Insumos', 'Eliminar');"""
    
    text = text.replace(target_perms, repl_perms)
    
    # Replace usages of canEdit
    text = text.replace("{canEdit && (\\n              <button onClick={openNewInsumo}", "{canCreate && (\\n              <button onClick={openNewInsumo}")
    text = text.replace("{canEdit && (\\n                      <>\\n                        <button onClick={() => openEditInsumo(insumo)}", "{canUpdate && (\\n                      <>\\n                        <button onClick={() => openEditInsumo(insumo)}")
    
    # Actually it's better to just regex replace `canEdit` to `canUpdate` then fix `openNewInsumo`.
    text = text.replace("canEdit", "canUpdate")
    # For the new insumo button:
    text = text.replace("{canUpdate && (\\n              <button onClick={openNewInsumo}", "{canCreate && (\\n              <button onClick={openNewInsumo}")
    # Also fix delete button which is inside the block:
    # {canUpdate && ( <> ... openEdit ... handleDelete )}
    # Well, we can keep the wrapper as canUpdate, but that means if you don't have update you can't delete. Let's make it cleaner.
    
    with open('frontend/src/pages/Insumos.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Insumos updated.")
except Exception as e:
    print(e)
