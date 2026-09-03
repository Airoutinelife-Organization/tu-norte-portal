import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

# 1. Add state variable
state_insertion = r'(const \[assigningCall, setAssigningCall\] = useState<\{ key: string; role: string \} \| null>\(null\);)'
new_state = r'\1\n  const [isCreatingTicket, setIsCreatingTicket] = useState(false);'
content = re.sub(state_insertion, new_state, content)

# 2. Add button to Tickets header
old_tickets_header = r'<div className="flex items-center gap-3">\s*<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">\s*<Headset className="h-5 w-5" />\s*</div>\s*<div>\s*<h2 className="text-sm font-semibold text-foreground">Tickets de Servicio al Cliente</h2>\s*<p className="text-xs text-muted-foreground">\{serviceCalls\.length\} registros</p>\s*</div>\s*</div>'

new_tickets_header = """<div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Headset className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-foreground">Tickets de Servicio al Cliente</h2>
                          <p className="text-xs text-muted-foreground">{serviceCalls.length} registros</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsCreatingTicket(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        Crear Ticket
                      </button>
                    </div>"""

content = re.sub(old_tickets_header, new_tickets_header, content)

# 3. Add modal
modal_insertion = r'(</main>)'
new_modal = """
      {isCreatingTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Crear Nuevo Ticket
            </h3>
            <div className="py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
              Formulario de creación en construcción
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsCreatingTicket(false)}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>"""

content = re.sub(modal_insertion, new_modal, content)

with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
