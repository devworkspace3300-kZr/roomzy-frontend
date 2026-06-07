file_path = r"c:\roomzy\frontend\src\pages\dashboard\OwnerDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

start_idx = -1
for idx, line in enumerate(lines):
    if "activeTab === 'earnings'" in line:
        start_idx = idx

if start_idx != -1:
    for idx in range(start_idx + 80, start_idx + 120):
        if idx < len(lines):
            print(f"{idx+1}: {lines[idx].rstrip()}")
else:
    print("earnings tab not found!")
