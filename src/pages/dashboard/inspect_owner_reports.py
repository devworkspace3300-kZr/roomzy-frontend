file_path = r"c:\roomzy\frontend\src\pages\dashboard\OwnerDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

found_reports = False
for idx, line in enumerate(lines):
    if "activeTab === 'reports'" in line:
        found_reports = True
    if found_reports:
        if idx < len(lines):
            print(f"{idx+1}: {line.strip()}")
            if "activeTab ===" in line and "reports" not in line:
                break
