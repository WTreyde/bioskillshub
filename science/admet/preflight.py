#!/usr/bin/env python3
"""Fail closed until a real endpoint-specific checkpoint is documented."""
import argparse,csv,hashlib,json,pathlib

def validate(manifest_path):
    path=pathlib.Path(manifest_path);m=json.loads(path.read_text())
    required=['endpoint','endpoint_definition','output_units_or_classes','checkpoint_path','checkpoint_sha256','checkpoint_source','license','preprocessing','feature_settings','reference_dataset','reference_expected_output','bionemo_commit','reviewed_by']
    for key in required:
        if not isinstance(m.get(key),str) or not m[key].strip() or m[key].startswith('TODO'): raise ValueError('Missing verified field: '+key)
    if m.get('endpoint_finetuned') is not True: raise ValueError('General pretrained weights are not an ADMET endpoint predictor.')
    checkpoint=path.parent/m['checkpoint_path']
    # Stream large checkpoints and support the documented Python 3.10 runtime.
    hasher=hashlib.sha256()
    with checkpoint.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024*1024),b''):
            hasher.update(chunk)
    digest=hasher.hexdigest()
    if digest!=m['checkpoint_sha256']: raise ValueError('Checkpoint hash does not match.')
    for key in ['reference_dataset','reference_expected_output']:
        if not (path.parent/m[key]).is_file(): raise ValueError('Reference artefact is missing: '+key)
    with (path.parent/m['reference_dataset']).open(newline='') as f:
        rows=list(csv.DictReader(f))
    if not rows or not {'molecule_id','smiles'}<=set(rows[0]): raise ValueError('Reference CSV requires molecule_id and smiles.')
    ids=[r['molecule_id'] for r in rows]
    if len(ids)!=len(set(ids)) or any(not r['molecule_id'] or not r['smiles'] for r in rows): raise ValueError('Missing or duplicate molecular input.')
    return {'status':'provenance checks passed; inference still requires validation','endpoint':m['endpoint'],'checkpoint_sha256':digest,'reference_molecules':len(rows)}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('manifest');a=p.parse_args()
    try: print(json.dumps(validate(a.manifest),indent=2))
    except (ValueError,OSError) as exc: p.exit(1,f'ADMET BLOCKED: {exc}\n')
