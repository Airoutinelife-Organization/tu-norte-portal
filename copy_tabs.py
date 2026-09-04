import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

# Find the section
match = re.search(r'(        {\/\* ═══════════════ SERVICIO AL CLIENTE ═══════════════ \*\/}.*?<\/section>\n        \})\n', content, re.DOTALL)
if match:
    servicio_block = match.group(1)
    
    # Modify the original to only be activeTab === "servicio"
    servicio_fixed = servicio_block.replace(
        '{(activeTab === "servicio" || activeTab === "en_progreso" || activeTab === "historico") && (',
        '{activeTab === "servicio" && ('
    )
    
    # Create en_progreso block
    en_progreso_block = servicio_block.replace(
        '{(activeTab === "servicio" || activeTab === "en_progreso" || activeTab === "historico") && (',
        '{activeTab === "en_progreso" && ('
    ).replace('Tickets de Servicio al Cliente', 'Tickets en Progreso')
    
    historico_block = servicio_block.replace(
        '{(activeTab === "servicio" || activeTab === "en_progreso" || activeTab === "historico") && (',
        '{activeTab === "historico" && ('
    ).replace('Tickets de Servicio al Cliente', 'Historial de Tickets')

    # Replace the single block with the three blocks
    new_content = content.replace(servicio_block, servicio_fixed + "\n\n" + en_progreso_block + "\n\n" + historico_block)
    
    with open("src/components/AdminDashboard.tsx", "w") as f:
        f.write(new_content)
    print("Successfully duplicated tabs.")
else:
    print("Could not find the block.")
