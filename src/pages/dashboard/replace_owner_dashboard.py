import os

file_path = r"c:\roomzy\frontend\src\pages\dashboard\OwnerDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """                                                        {(req.status === 'confirmed' || req.status === 'approved') && (
                                                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest px-4 py-2 bg-amber-50 rounded-lg">Awaiting Move-in</span>
                                                        )}"""

replacement = """                                                        {req.status === 'confirmed' && (
                                                            <button 
                                                                onClick={() => handleConfirmMoveIn(req.id)}
                                                                disabled={statusUpdating === req.id}
                                                                className="px-4 py-2 rounded-lg bg-emerald-500 text-[10px] font-black text-white hover:bg-emerald-600 transition-all uppercase tracking-widest disabled:opacity-50"
                                                            >
                                                                Confirm Move-in
                                                            </button>
                                                        )}
                                                        {req.status === 'approved' && (
                                                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest px-4 py-2 bg-amber-50 rounded-lg">Awaiting Payment</span>
                                                        )}"""

# Replace both LF and CRLF variations
if target in content:
    content = content.replace(target, replacement)
    print("Replaced successfully with LF")
else:
    target_crlf = target.replace("\n", "\r\n")
    replacement_crlf = replacement.replace("\n", "\r\n")
    if target_crlf in content:
        content = content.replace(target_crlf, replacement_crlf)
        print("Replaced successfully with CRLF")
    else:
        print("Target content not found!")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
