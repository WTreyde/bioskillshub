#!/usr/bin/env python3
"""Validate owner-supplied image/reference provenance, without running scientific analysis."""
import argparse, hashlib, json, pathlib, math

def digest(path):
    value=hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda:stream.read(1024*1024),b''):value.update(chunk)
    return value.hexdigest()

def text(value):
    return isinstance(value,str) and bool(value.strip()) and not value.strip().upper().startswith(('TODO','UNCONFIRMED'))

def validate(filename):
    path=pathlib.Path(filename);data=json.loads(path.read_text())
    for field in ('reviewed_by','permission','biological_question','independent_replicate'):
        if not text(data.get(field)):raise ValueError('Missing reviewed field: '+field)
    def verify(item,key):
        if not text(item.get(key+'_path')) or not text(item.get(key+'_sha256')):raise ValueError('Missing artifact: '+key)
        artifact=path.parent/item[key+'_path']
        if digest(artifact)!=item[key+'_sha256']:raise ValueError('Artifact hash mismatch: '+key)
        return item[key+'_sha256']
    verify(data,'protocol')
    metrics=data.get('frozen_metrics')
    if not isinstance(metrics,dict) or not metrics:raise ValueError('Freeze metric definitions and tolerances before evaluation.')
    for metric,definition in metrics.items():
        if not isinstance(definition,dict) or not text(definition.get('definition')) or not text(definition.get('acceptance_rule')):raise ValueError('Metric requires a definition and acceptance rule: '+metric)
    images=data.get('images')
    if not isinstance(images,list) or not images:raise ValueError('No reference images supplied.')
    ids=set();splits={};hash_splits={}
    for image in images:
        for field in ('image_id','replicate_id','condition','channel_definition'):
            if not text(image.get(field)):raise ValueError('Missing image field: '+field)
        if image['image_id'] in ids:raise ValueError('Duplicate image ID.')
        ids.add(image['image_id'])
        split=image.get('split')
        if split not in ('development','held_out'):raise ValueError('Split must be development or held_out.')
        replicate=image['replicate_id']
        if replicate in splits and splits[replicate]!=split:raise ValueError('Biological replicate crosses development and held-out splits.')
        splits[replicate]=split
        size=image.get('pixel_size_um')
        if type(size) not in (int,float) or not math.isfinite(size) or size<=0:raise ValueError('Positive finite pixel size required.')
        if image.get('dimensions')!='2D' or image.get('bit_depth') not in (8,16,32):raise ValueError('Prototype supports documented 2D images with 8/16/32-bit depth only.')
        for key in ('nuclei','foci','reference_counts','reference_mask'):
            sha=verify(image,key)
            if key in ('nuclei','foci'):
                if sha in hash_splits and hash_splits[sha]!=split:raise ValueError('Same image bytes cross development and held-out splits.')
                hash_splits[sha]=split
    if 'held_out' not in splits.values():raise ValueError('A held-out reference set is required.')
    return {'status':'provenance checked; scientific review and evaluation still required','images':len(ids),'replicates':len(splits),'scientifically_validated':False}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('manifest');args=parser.parse_args()
    try:print(json.dumps(validate(args.manifest),indent=2))
    except (ValueError,OSError,KeyError,TypeError):parser.exit(1,'ImageJ intake blocked: complete the reviewed manifest and verify artifact paths, hashes and splits.\n')
