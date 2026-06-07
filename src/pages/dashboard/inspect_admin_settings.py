file_path = r"c:\roomzy\frontend\src\pages\dashboard\AdminDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

start_idx = -1
for idx, line in enumerate(lines):
    if "activeTab === 'settings'" in line:
        start_idx = idx
        break

if start_idx != -1:
    for idx in range(start_idx, start_idx + 150):
        if idx < len(lines):
            print(f"{idx+1}: {lines[idx].strip()}")
else:
    print("settings tab not found!")
