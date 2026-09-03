import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

old_header = r'<div className="flex items-center gap-3">\s*<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">\s*<HeadphonesIcon className="h-4 w-4 text-blue-500" />\s*</div>\s*<div>\s*<h2 className="text-sm font-semibold text-foreground">Tickets de Servicio al Cliente</h2>\s*<p className="text-xs text-muted-foreground">\s*\{serviceLoading\s*\?\s*"Cargando desde el webhook\.\.\."\s*:\s*serviceError\s*\?\s*`Error: \$\{serviceError\}`\s*:\s*`\$\{serviceCalls\.length\} registros`\}\s*</p>\s*</div>\s*</div>\s*</div>'

new_header = """<div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <HeadphonesIcon className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Tickets de Servicio al Cliente</h2>
                  <p className="text-xs text-muted-foreground">
                    {serviceLoading
                      ? "Cargando desde el webhook..."
                      : serviceError
                        ? `Error: ${serviceError}`
                        : `${serviceCalls.length} registros`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreatingTicket(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Crear Ticket
              </button>
            </div>
            </div>"""

content = re.sub(old_header, new_header, content)

with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
