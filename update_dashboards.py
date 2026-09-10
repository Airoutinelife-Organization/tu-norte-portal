import os
import re

files_to_update = [
    "src/components/AIRPDashboard.tsx",
    "src/components/VentasDashboard.tsx",
    "src/components/ContactCenterDashboard.tsx"
]

for file_path in files_to_update:
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add X to lucide-react imports if not there
    lucide_import_pattern = r'(import\s*\{[^}]*?)(X,)?([^}]*?\}\s*from\s*"lucide-react";)'
    def add_x_import(match):
        if match.group(2) or " X " in match.group(0) or "\nX," in match.group(0):
            return match.group(0)
        return f"{match.group(1)}X,{match.group(3)}"
    
    content = re.sub(lucide_import_pattern, add_x_import, content)
    
    # 2. Add playingRecordingUrl state
    if "const [playingRecordingUrl" not in content:
        content = content.replace(
            "const [expandedKey, setExpandedKey] = useState<string | null>(null);",
            "const [expandedKey, setExpandedKey] = useState<string | null>(null);\n  const [playingRecordingUrl, setPlayingRecordingUrl] = useState<string | null>(null);"
        )
    
    # 3. Replace <a title="Oír grabación"> with <button>
    a_tag_pattern = r'<a href=\{c\.recording_url \|\| c\.url\} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800" title="Oír grabación">\s*<Play className="h-4 w-4" />\s*</a>'
    button_tag = """<button onClick={(e) => { e.preventDefault(); setPlayingRecordingUrl(c.recording_url || c.url); }} className="text-blue-600 hover:text-blue-800" title="Oír grabación">
                                    <Play className="h-4 w-4" />
                                  </button>"""
    content = re.sub(a_tag_pattern, button_tag, content)

    # 4. Add the audio player before </main>
    if "playingRecordingUrl &&" not in content:
        player_html = """
      {playingRecordingUrl && (
        <div className="fixed bottom-4 right-4 bg-white p-4 shadow-xl rounded-xl border border-border z-50 flex flex-col gap-3 min-w-[320px]">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm text-foreground">Reproduciendo grabación</span>
            <button onClick={() => setPlayingRecordingUrl(null)} className="text-muted-foreground hover:text-foreground" title="Cerrar reproductor">
              <X className="h-4 w-4" />
            </button>
          </div>
          <audio controls autoPlay src={playingRecordingUrl} className="w-full">
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
      )}
    </main>"""
        content = content.replace("    </main>", player_html)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Updated {file_path}")

