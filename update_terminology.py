import os
import re

files_to_update = ["TeacherPanel.jsx", "Dashboard.jsx", "LoginPage.jsx"]

replacements = [
    # Classes arrays
    (r'\["7-A",\s*"7-B",\s*"7-V",\s*"8-A",\s*"8-B",\s*"9-A",\s*"9-B",\s*"10-A",\s*"10-B",\s*"11-A",\s*"11-B"\]', 
     '["1-kurs", "2-kurs", "3-kurs", "4-kurs", "Magistratura"]'),
    (r'\["7-A","7-B","7-V","8-A","8-B","9-A","9-B","10-A","10-B","11-A","11-B"\]', 
     '["1-kurs", "2-kurs", "3-kurs", "4-kurs", "Magistratura"]'),
    
    # Specific phrases
    (r'Sinflar kesimida', 'Guruhlar kesimida'),
    (r'Barcha sinflar', 'Barcha guruhlar'),
    (r'Eng faol o\'quvchilar', 'Eng faol talabalar'),
    (r'Jami o\'quvchilar', 'Jami talabalar'),
    (r'O\'quvchi ismi', 'Talaba ismi'),
    (r'O\'quvchi logini', 'Talaba logini'),
    (r'O\'quvchi reytingi', 'Talabalar reytingi'),
    (r'O\'QUVCHI', 'TALABA'),
    (r'SINF', 'GURUH'),
    
    # General words (with word boundaries to avoid partial matches if necessary, but these are mostly UI text)
    (r'Sinflar', 'Guruhlar'),
    (r'sinflar', 'guruhlar'),
    (r'-sinf', '-kurs'),
    (r'Sinf', 'Guruh'),
    (r'sinf', 'guruh'),
    
    (r'O\'quvchilar', 'Talabalar'),
    (r'o\'quvchilar', 'talabalar'),
    (r'O\'quvchi', 'Talaba'),
    (r'o\'quvchi', 'talaba'),
]

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    for old, new in replacements:
        content = re.sub(old, new, content)
        
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
print("Terminology updated successfully!")
