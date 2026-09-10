import os

files_to_update = [
    "src/components/AIRPDashboard.tsx",
    "src/components/VentasDashboard.tsx",
    "src/components/ContactCenterDashboard.tsx"
]

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("setPlayingRecordingUrl(c.recording_url || c.url)", "setPlayingRecordingUrl(c.recording_url || c.url || null)")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

