const fs = require('fs');
const content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const startMarker = '        {/* ═══════════════ SERVICIO AL CLIENTE ═══════════════ */}';
const endMarker = '          </section>\n        )}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const sectionEnd = endIndex + endMarker.length;
    const servicio_block = content.substring(startIndex, sectionEnd);
    
    const servicio_fixed = servicio_block.replace(
        '{(activeTab === "servicio" || activeTab === "en_progreso" || activeTab === "historico") && (',
        '{activeTab === "servicio" && ('
    );
    
    const en_progreso_block = servicio_block.replace(
        '{(activeTab === "servicio" || activeTab === "en_progreso" || activeTab === "historico") && (',
        '{activeTab === "en_progreso" && ('
    ).replace('Tickets de Servicio al Cliente', 'Tickets en Progreso');
    
    const historico_block = servicio_block.replace(
        '{(activeTab === "servicio" || activeTab === "en_progreso" || activeTab === "historico") && (',
        '{activeTab === "historico" && ('
    ).replace('Tickets de Servicio al Cliente', 'Historial de Tickets');

    const new_content = content.substring(0, startIndex) +
                        servicio_fixed + "\n\n" +
                        en_progreso_block + "\n\n" +
                        historico_block +
                        content.substring(sectionEnd);
    
    fs.writeFileSync('src/components/AdminDashboard.tsx', new_content);
    console.log("Successfully duplicated tabs.");
} else {
    console.log("Could not find the block.");
}
