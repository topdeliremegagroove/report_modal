import pandas as pd
import json

# Charger le fichier Excel
file_path = "flux_fluvial_2019.xlsx"  # Remplace par le nom réel de ton fichier
df = pd.read_excel(file_path)

# Sélectionner les colonnes nécessaires et renommer "TKM" en "volume"
df_filtered = df[['source', 'target', 'TKM']].rename(columns={'TKM': 'volume'})

# Convertir "volume" en int, en remplaçant les valeurs non numériques par 0
df_filtered['volume'] = pd.to_numeric(df_filtered['volume'], errors='coerce').fillna(0).astype(int)

# Convertir en JSON avec source et target comme chaînes, et volume en int
json_data = [
    {"source": str(row["source"]), "target": str(row["target"]), "volume": row["volume"]}
    for _, row in df_filtered.iterrows()
]

# Sauvegarder dans un fichier JSON
output_path = "flux_fluvial_2019.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(json_data, f, indent=4)

print(f"✅ Fichier JSON généré : {output_path}")
