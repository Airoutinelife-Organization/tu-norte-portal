import re

with open("src/components/AdminDashboard.tsx", "r") as f:
    content = f.read()

# Add types and state
type_insertion = """type HumanAgent = {"""
new_types = """type VoiceAgent = {
  Agent: string;
  key: string;
  specialist: string[];
};

type HumanAgent = {"""
content = content.replace(type_insertion, new_types, 1)

state_insertion = r'(const \[isCreatingTicket, setIsCreatingTicket\] = useState\(false\);)'
new_state = r"""\1
  const [voiceAgents, setVoiceAgents] = useState<VoiceAgent[]>([]);
  const [newTicketAgent, setNewTicketAgent] = useState<string>("");
  const [newTicketSpecialist, setNewTicketSpecialist] = useState<string>("");

  useEffect(() => {
    if (isCreatingTicket && voiceAgents.length === 0) {
      fetch("https://vmi3345591.contaboserver.net/webhook/voice-agent", { method: "POST" })
        .then(res => res.json())
        .then((data: VoiceAgent[]) => setVoiceAgents(data))
        .catch(err => console.error("Error loading voice agents:", err));
    }
  }, [isCreatingTicket, voiceAgents.length]);"""
content = re.sub(state_insertion, new_state, content)

# Update modal content
modal_old = r'<div className="py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">\s*Formulario de creación en construcción\s*</div>'
modal_new = """<div className="flex flex-col gap-4 py-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Agente</label>
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
                <label className="block text-sm font-medium text-foreground mb-1">Especialista</label>
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
            </div>"""
content = re.sub(modal_old, modal_new, content)

with open("src/components/AdminDashboard.tsx", "w") as f:
    f.write(content)
