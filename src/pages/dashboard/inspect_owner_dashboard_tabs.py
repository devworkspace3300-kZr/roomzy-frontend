file_path = r"c:\roomzy\frontend\src\pages\dashboard\OwnerDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "activeTab === 'earnings'" in line or "fetchEarnings" in line or "earnings" in line.lower():
        print(f"{idx+1}: {line.strip()}")
