file_path = r"c:\roomzy\frontend\src\pages\dashboard\OwnerDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx in range(865, 882):
    if idx < len(lines):
        print(f"{idx+1}: {repr(lines[idx])}")
