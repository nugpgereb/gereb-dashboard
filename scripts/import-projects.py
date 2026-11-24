"""Import the 21 project columns pasted from the source spreadsheet as TSV."""
import argparse
import csv
import datetime
from decimal import Decimal
import json
from pathlib import Path
import re

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
parser.add_argument('--output', type=Path, default=Path('projetos_fiotec_dashboard.csv'))
args = parser.parse_args()
with args.source.open(encoding='utf-8-sig', newline='') as source:
    rows = list(csv.reader(source, delimiter='\t'))
assert rows[0][:2] == ['ITEM', 'PROJETO'], 'Unexpected source header'
with args.output.open(encoding='utf-8-sig', newline='') as current:
    old_rows = list(csv.reader(current))
headers = old_rows[0]
assert len(headers) == 21, 'Unexpected target columns'
projects = []
for line, row in enumerate(rows[1:], 2):
    if not any(cell.strip() for cell in row):
        continue
    assert len(row) >= 21 and not any(cell.strip() for cell in row[21:]), f'Unexpected columns on row {line}'
    values = [cell.strip() for cell in row[:21]]
    assert values[0].isdigit() and re.fullmatch(r'GEREB[- ]\d+[- ][A-Z]+[- ]\d{2}', values[1]), f'Invalid project row {line}'
    for index in (12, 13):
        values[index] = datetime.datetime.strptime(values[index], '%d/%m/%Y').date().isoformat()
    for index in range(15, 21):
        raw = re.sub(r'\s+', '', values[index].replace('R$', ''))
        if raw in ('-', ''):
            amount = Decimal(0)
        else:
            assert re.fullmatch(r'-?[\d.]+,\d{2}', raw), f'Invalid money on row {line}, column {index + 1}: {raw}'
            amount = Decimal(raw.replace('.', '').replace(',', '.'))
        values[index] = format(amount, '.2f')
    projects.append(values)
assert projects and len({row[1] for row in projects}) == len(projects), 'Empty or duplicate project IDs'
old_ids = {row[1] for row in old_rows[1:]}
new_ids = {row[1] for row in projects}
report = {
    'projects': len(projects),
    'added': sorted(new_ids - old_ids),
    'removed': sorted(old_ids - new_ids),
    'instrument_types': {name: sum(row[7] == name for row in projects) for name in sorted({row[7] for row in projects})},
    'totals': {headers[index]: str(sum(Decimal(row[index]) for row in projects)) for index in range(15, 21)},
    'ids_with_spaces': [row[1] for row in projects if ' ' in row[1]],
}
with args.output.open('w', encoding='utf-8', newline='') as output:
    writer = csv.writer(output, lineterminator='\n')
    writer.writerow(headers)
    writer.writerows(projects)
print(json.dumps(report, ensure_ascii=True, indent=2))
