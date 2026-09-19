#!/usr/bin/env python3
"""One-shot scheduled stop using an administrator's existing Brev login. No credential copying."""
import argparse,datetime,json,pathlib,shutil,subprocess,sys
DEADLINE=datetime.datetime(2026,9,21,11,0,tzinfo=datetime.timezone.utc)

def due(now):
    if now.tzinfo is None:raise ValueError('Timezone-aware time required.')
    return now>=DEADLINE

def main():
    p=argparse.ArgumentParser();p.add_argument('--execute',action='store_true');p.add_argument('--record',default='.local/shutdown.json');a=p.parse_args()
    now=datetime.datetime.now(datetime.timezone.utc)
    if not due(now):print('Scheduled stop is not due: 21 September 2026, 11:00 UTC / 12:00 BST.');return
    if not a.execute:print('Stop is due. Run with --execute on the administrator machine to stop bioskillshub-cpu.');return
    record=pathlib.Path(a.record)
    if record.exists() and json.loads(record.read_text()).get('stop_requested_successfully'):return
    binary=shutil.which('brev')
    if not binary:raise RuntimeError('Brev CLI unavailable; use the administrator machine.')
    result=subprocess.run([binary,'stop','bioskillshub-cpu'],stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=120)
    if result.returncode:raise RuntimeError('Brev stop failed; verify administrator authentication privately and retry.')
    record.parent.mkdir(parents=True,exist_ok=True)
    with record.open('w') as stream:
        record.chmod(0o600)
        json.dump({'instance':'bioskillshub-cpu','requested_at':now.isoformat(),'stop_requested_successfully':True,'console_and_disk_billing_verified':False},stream,indent=2)
    print('Brev accepted the stop request. Confirm stopped state and residual disk charges in the console.')

if __name__=='__main__':
    try:main()
    except Exception:print('Scheduled stop failed; check Brev access and retry privately.',file=sys.stderr);sys.exit(1)
