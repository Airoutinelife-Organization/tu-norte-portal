import re

with open('src/components/ContactCenterDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Component declaration
content = content.replace(
    'export default function AdminDashboard({',
    'export default function VentasDashboard({'
)
content = content.replace(
    'mode = "contact-center",',
    'mode = "ventas",'
)
content = content.replace(
    'const [activeTab, setActiveTab] = useState<Tab>("servicio");',
    'const [activeTab, setActiveTab] = useState<Tab>("ventas");'
)

# 2. currentTabs
content = content.replace(
    'TABS.filter((t) => t.id !== "ventas");',
    'TABS.filter((t) => t.id !== "servicio");'
)

# 3. Titles
content = content.replace(
    'Contact Center - Tickets',
    'Ventas - Tickets'
)
content = content.replace(
    'Tickets de Servicio al Cliente',
    'Tickets de Ventas'
)

# 4. In the activeTab === "servicio" block, change it to "ventas"
# We need to replace `activeTab === "servicio"` to `activeTab === "ventas"`
content = content.replace(
    '{activeTab === "servicio" && (',
    '{activeTab === "ventas" && ('
)

# In the same block, we need to replace serviceCalls with purchasingCalls,
# serviceLoading with purchasingLoading, serviceError with purchasingError.
# But we must be careful not to replace serviceCalls everywhere, although wait,
# the original file uses serviceCalls for en_progreso and historico?
# Let's check ContactCenterDashboard.tsx again. In ContactCenterDashboard,
# en_progreso uses `enProgresoCalls`, historico uses `historicoCalls`.
# So replacing serviceCalls -> purchasingCalls globally is safe?
# Wait, let's just do a string replace because getServiceCalls is used.

content = content.replace('serviceLoading', 'purchasingLoading')
content = content.replace('serviceError', 'purchasingError')
content = content.replace('serviceCalls', 'purchasingCalls')
content = content.replace('fetchService', 'fetchPurchasing')

# Fix imports if needed? 
# The original file has getPurchasingCalls imported.

with open('src/components/VentasDashboard.tsx', 'w') as f:
    f.write(content)

