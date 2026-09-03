import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

# Add state variables
state_insertion = r'(const \[newTicketSpecialist, setNewTicketSpecialist\] = useState<string>\(""\);)'
new_state = r"""\1
  const [newTicketPhone, setNewTicketPhone] = useState("");
  const [newTicketName, setNewTicketName] = useState("");
  const [newTicketDoc, setNewTicketDoc] = useState("");
  const [newTicketAddress, setNewTicketAddress] = useState("");
  const [newTicketRequest, setNewTicketRequest] = useState("");
  const [newTicketNotes, setNewTicketNotes] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 10) val = val.slice(0, 10);
    let formatted = val;
    if (val.length > 6) {
      formatted = `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6, 10)}`;
    } else if (val.length > 3) {
      formatted = `${val.slice(0, 3)}-${val.slice(3, 6)}`;
    }
    setNewTicketPhone(formatted);
  };
  
  const isTicketFormValid = newTicketAgent && newTicketSpecialist && newTicketPhone.length === 12 && newTicketName.trim() && newTicketDoc.trim() && newTicketRequest.trim();
"""
content = re.sub(state_insertion, new_state, content)

# Update modal content
modal_old = r'<div className="flex flex-col gap-4 py-4">.*?</div>\s*</div>\s*<div className="mt-6 flex justify-end">\s*<button\s*onClick=\{\(\) => setIsCreatingTicket\(false\)\}\s*className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80"\s*>\s*Cerrar\s*</button>\s*</div>'

modal_new = """<div className="flex flex-col gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Agente *</label>
                  <select 
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={newTicketAgent}
                    onChange={e => {
                      setNewTicketAgent(e.target.value);
                      setNewTicketSpecialist("");
                    }}
                  >
                    <option value="">Seleccione un agente...</option>
                    {voiceAgents.map(a => (
                      <option key={a.key} value={a.Agent}>{a.Agent}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Especialista *</label>
                  <select 
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={newTicketSpecialist}
                    onChange={e => setNewTicketSpecialist(e.target.value)}
                    disabled={!newTicketAgent}
                  >
                    <option value="">Seleccione un especialista...</option>
                    {voiceAgents.find(a => a.Agent === newTicketAgent)?.specialist.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Teléfono *</label>
                  <input
                    type="text"
                    placeholder="###-###-####"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={newTicketPhone}
                    onChange={handlePhoneChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Documento de Identidad *</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={newTicketDoc}
                    onChange={e => setNewTicketDoc(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  value={newTicketName}
                  onChange={e => setNewTicketName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
                <input
                  type="text"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  value={newTicketAddress}
                  onChange={e => setNewTicketAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Requerimiento *</label>
                <textarea
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground min-h-[80px] resize-y"
                  value={newTicketRequest}
                  onChange={e => setNewTicketRequest(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notas</label>
                <textarea
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground min-h-[60px] resize-y"
                  value={newTicketNotes}
                  onChange={e => setNewTicketNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsCreatingTicket(false)}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80"
              >
                Cancelar
              </button>
              <button
                disabled={!isTicketFormValid}
                onClick={() => {
                  // TODO: Webhook post here
                  alert("Formulario validado correctamente. En espera del webhook final.");
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  isTicketFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                }`}
              >
                Guardar Ticket
              </button>
            </div>"""

content = re.sub(modal_old, modal_new, content, flags=re.DOTALL)

with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
