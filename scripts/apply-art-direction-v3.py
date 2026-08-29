from pathlib import Path

app = Path("src/App.jsx")
s = app.read_text()

imports_anchor = 'import { MotionDebugPanel } from "./components/MotionDebugPanel.jsx";\n'
extra_imports = (
    'import { ProcessSection } from "./components/ProcessSection.jsx";\n'
    'import { ContactSection } from "./components/ContactSection.jsx";\n'
)
if 'ProcessSection' not in s:
    if imports_anchor not in s:
        raise SystemExit("MotionDebugPanel import anchor not found")
    s = s.replace(imports_anchor, imports_anchor + extra_imports)

if '<Process />' not in s:
    raise SystemExit("Process usage anchor not found")
s = s.replace('<Process />', '<ProcessSection openAdvisorFor={openAdvisorFor} />', 1)

if '<Footer openAdvisorFor={openAdvisorFor} />' not in s:
    raise SystemExit("Footer usage anchor not found")
s = s.replace(
    '<Footer openAdvisorFor={openAdvisorFor} />',
    '<ContactSection openAdvisorFor={openAdvisorFor} />',
    1,
)

app.write_text(s)

final = app.read_text()
assert 'import { ProcessSection }' in final
assert 'import { ContactSection }' in final
assert '<ProcessSection openAdvisorFor={openAdvisorFor} />' in final
assert '<ContactSection openAdvisorFor={openAdvisorFor} />' in final
