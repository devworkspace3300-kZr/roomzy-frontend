file_path = r"c:\roomzy\frontend\src\pages\dashboard\OwnerDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "activeTab ===" in line:
        print(f"{idx+1}: {line.strip()}")
