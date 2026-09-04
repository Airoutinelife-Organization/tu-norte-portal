const fs = require('fs');
const content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const selectHtml = `                              <select
                                className="bg-background border border-border rounded px-2 py-1 text-xs"
                                defaultValue={c.status || "Nuevo"}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  if (confirm(\`¿Estás seguro de que deseas cambiar el estado a \${newStatus}?\`)) {
                                    fetch('https://vmi3345591.contaboserver.net/webhook/set-status', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ call_id: c.key, status: newStatus })
                                    }).then(async res => {
                                      if (res.ok) window.location.reload();
                                      else {
                                        const errorText = await res.text();
                                        alert(\`Error al cambiar el estado: \${errorText}\`);
                                      }
                                    }).catch((err) => alert(\`Error de conexión: \${err.message}\`));
                                  } else {
                                    e.target.value = c.status || "Nuevo";
                                  }
                                }}
                              >
                                <option value="Nuevo">Nuevo</option>
                                <option value="En Progreso">En Progreso</option>
                                <option value="Solucionado">Solucionado</option>
                                <option value="Cancelado">Cancelado</option>
                              </select>`;

const btnRegex = /                              <button\n                                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded px-3 py-1 text-xs font-medium transition-colors"[\s\S]*?Cancelar\n                              <\/button>/g;

// We need to replace the button with the selectHtml in the en_progreso and historico blocks.
// We can find them by looking for {activeTab === "en_progreso" && ( ... )} and {activeTab === "historico" && ( ... )}

const enProgresoStartIndex = content.indexOf('{activeTab === "en_progreso" && (');
const historicoStartIndex = content.indexOf('{activeTab === "historico" && (');

if (enProgresoStartIndex !== -1 && historicoStartIndex !== -1) {
    let beforeEnProgreso = content.substring(0, enProgresoStartIndex);
    let enProgresoAndHistorico = content.substring(enProgresoStartIndex);
    
    // Replace all instances of the button in these two blocks with the select
    enProgresoAndHistorico = enProgresoAndHistorico.replace(btnRegex, selectHtml);
    
    const new_content = beforeEnProgreso + enProgresoAndHistorico;
    fs.writeFileSync('src/components/AdminDashboard.tsx', new_content);
    console.log("Successfully reverted En Progreso and Historico to dropdown.");
} else {
    console.log("Could not find the blocks.");
}
