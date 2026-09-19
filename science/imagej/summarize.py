#!/usr/bin/env python3
"""Descriptive summaries only. Nuclei are not biological replicates."""
import argparse,csv,json,pathlib,statistics,hashlib,html
from collections import defaultdict

def summarise(counts_path,metadata_path,out):
    with open(metadata_path,newline='') as f: metadata=list(csv.DictReader(f))
    mapping={}
    for row in metadata:
        if not all(row.get(k) for k in ('image_id','replicate_id','condition')): raise ValueError('Metadata requires image_id, replicate_id and condition.')
        if row['image_id'] in mapping: raise ValueError('Duplicate image_id in metadata.')
        mapping[row['image_id']]=row
    groups=defaultdict(list); seen=set()
    with open(counts_path,newline='') as f:
        for row in csv.DictReader(f):
            key=(row['image_id'],row['nucleus_id'])
            if key in seen: raise ValueError('Duplicate nucleus ID within image.')
            seen.add(key)
            if row['image_id'] not in mapping: raise ValueError('Missing image metadata.')
            count=int(row['foci_count'])
            if count<0: raise ValueError('Negative count.')
            groups[row['image_id']].append(count)
    if not groups: raise ValueError('No nuclei: inspect segmentation before analysis.')
    missing=set(mapping)-set(groups)
    if missing: raise ValueError('Images without counts require review: '+', '.join(sorted(missing)))
    out=pathlib.Path(out);out.mkdir(parents=True,exist_ok=True)
    images=[];replicates=defaultdict(list)
    for image_id,values in groups.items():
        m=mapping[image_id]
        images.append(dict(image_id=image_id,replicate_id=m['replicate_id'],condition=m['condition'],nuclei=len(values),mean_foci=statistics.mean(values),median_foci=statistics.median(values)))
        replicates[(m['condition'],m['replicate_id'])].extend(values)
    reps=[dict(condition=c,replicate_id=r,nuclei=len(v),mean_foci=statistics.mean(v)) for (c,r),v in sorted(replicates.items())]
    for name,rows in [('images',images),('replicates',reps)]:
        with (out/f'{name}.csv').open('w',newline='') as f: writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
    maximum=max([r['mean_foci'] for r in reps]+[1]);height=90+len(reps)*45
    svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="720" height="{height}" viewBox="0 0 720 {height}"><rect width="100%" height="100%" fill="#f8faf6"/><text x="20" y="30" font-family="sans-serif" font-size="17">Mean foci per nucleus, by biological replicate</text>']
    for i,r in enumerate(reps):
        y=70+i*45;label=html.escape(f'{r["condition"]} / {r["replicate_id"]}')
        svg.append(f'<text x="20" y="{y+17}" font-family="sans-serif" font-size="12">{label}</text><rect x="230" y="{y}" width="{r["mean_foci"]/maximum*370}" height="24" fill="#286b50"/><text x="620" y="{y+17}" font-family="sans-serif" font-size="12">{r["mean_foci"]:.2f}</text>')
    svg.append('</svg>');(out/'replicates.svg').write_text(''.join(svg))
    manifest={'analysis':'descriptive only','aggregation':'pooled nuclei within each biological replicate; no inferential test','counts_sha256':hashlib.sha256(pathlib.Path(counts_path).read_bytes()).hexdigest(),'metadata_sha256':hashlib.sha256(pathlib.Path(metadata_path).read_bytes()).hexdigest(),'images':len(images),'biological_replicates':len(reps)}
    (out/'summary.manifest.json').write_text(json.dumps(manifest,indent=2))
    return reps

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('counts');p.add_argument('metadata');p.add_argument('--output',required=True);a=p.parse_args();summarise(a.counts,a.metadata,a.output)
