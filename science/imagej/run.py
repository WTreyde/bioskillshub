#!/usr/bin/env python3
"""Run the prototype macro with a reviewed config and bounded execution."""
import argparse,hashlib,json,os,pathlib,re,subprocess,time

def main():
    p=argparse.ArgumentParser();p.add_argument('--nuclei',required=True);p.add_argument('--foci',required=True);p.add_argument('--image-id',required=True);p.add_argument('--config',required=True);p.add_argument('--output',required=True);p.add_argument('--synthetic',action='store_true');p.add_argument('--timeout',type=int,default=120);a=p.parse_args()
    if not re.fullmatch(r'[A-Za-z0-9_-]+',a.image_id):p.error('Image ID must be a simple alphanumeric identifier.')
    cfg=json.loads(pathlib.Path(a.config).read_text())
    if cfg.get('synthetic_only') and not a.synthetic:p.error('Synthetic configuration cannot be used on real images.')
    if not cfg.get('reviewed_by'):p.error('A reviewed configuration is required.')
    if cfg.get('threshold_method') not in ['Otsu','Triangle','Huang','Default','Li']:p.error('Unsupported threshold method.')
    for key in ('minimum_nuclear_area_pixels','foci_prominence'):
        if not isinstance(cfg.get(key),(int,float)) or cfg[key]<=0:p.error('Positive '+key+' required.')
    if not isinstance(cfg.get('watershed'),bool):p.error('watershed must be boolean.')
    binary=os.environ.get('FIJI_BIN')
    if not binary:p.error('Set FIJI_BIN to the Fiji launcher or the provided ImageJ-core wrapper.')
    out=pathlib.Path(a.output).resolve();out.mkdir(parents=True,exist_ok=True)
    files=[pathlib.Path(a.nuclei).resolve(),pathlib.Path(a.foci).resolve()]
    if any('\n' in str(f) for f in files+[out]):p.error('Newlines in paths are unsupported.')
    inputs={str(f):hashlib.sha256(f.read_bytes()).hexdigest() for f in files}
    macro=pathlib.Path(__file__).with_name('analyse.ijm').resolve()
    argument='\n'.join([str(files[0]),str(files[1]),str(out),a.image_id,cfg['threshold_method'],str(cfg['minimum_nuclear_area_pixels']),str(cfg['foci_prominence']),str(cfg['watershed']).lower()])
    started=time.monotonic()
    try:
        result=subprocess.run([binary,'--headless','-macro',str(macro),argument],capture_output=True,text=True,timeout=a.timeout)
    except subprocess.TimeoutExpired:
        (out/'execution.manifest.json').write_text(json.dumps({'image_id':a.image_id,'completed':False,'error':'execution timed out','time_limit_seconds':a.timeout,'input_hashes':inputs,'configuration':cfg},indent=2))
        raise RuntimeError('ImageJ timed out; failure manifest saved. Inspect for a GUI-dependent command.') from None
    (out/'execution.log').write_text(result.stdout+'\n'+result.stderr)
    manifest={'image_id':a.image_id,'synthetic':a.synthetic,'scientifically_validated':False,'configuration':cfg,'input_hashes':inputs,'macro_sha256':hashlib.sha256(macro.read_bytes()).hexdigest(),'elapsed_seconds':time.monotonic()-started,'returncode':result.returncode}
    (out/'execution.manifest.json').write_text(json.dumps(manifest,indent=2))
    if result.returncode or not (out/f'{a.image_id}_counts.csv').exists():raise RuntimeError('ImageJ did not produce counts; inspect execution.log.')
    print('Macro produced outputs. Scientific validation still requires reference annotations.')

if __name__=='__main__':main()
