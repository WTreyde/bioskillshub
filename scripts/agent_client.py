#!/usr/bin/env python3
"""Read-only client. Never prints authentication headers or environment values."""
import argparse, hashlib, json, os, pathlib, sys, urllib.error, urllib.parse, urllib.request

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise RuntimeError('Redirect refused; configure the final BioSkillsHub URL.')

def main():
    parser=argparse.ArgumentParser()
    commands=parser.add_subparsers(dest='action',required=True)
    commands.add_parser('list')
    get=commands.add_parser('get'); get.add_argument('skill_id'); get.add_argument('version',type=int); get.add_argument('--output',required=True)
    args=parser.parse_args()
    base=os.environ.get('BIOSKILLS_URL','http://localhost:3000').rstrip('/')
    parsed=urllib.parse.urlparse(base)
    if parsed.scheme not in ('http','https') or parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise RuntimeError('Use an HTTP(S) base URL without credentials, query or fragment.')
    if parsed.scheme=='http' and parsed.hostname not in ('localhost','127.0.0.1','::1'):
        raise RuntimeError('Use HTTPS or a localhost SSH tunnel for token transport.')
    token=os.environ.get('BIOSKILLS_TOKEN')
    if not token: raise RuntimeError('Set BIOSKILLS_TOKEN securely in the environment first.')
    suffix='/api/agent/skills'
    if args.action=='get':
        if args.version<1: raise RuntimeError('Version must be positive.')
        suffix+=f'/{urllib.parse.quote(args.skill_id,safe="")}/versions/{args.version}'
    request=urllib.request.Request(base+suffix,headers={'Authorization':'Bearer '+token})
    try:
        with urllib.request.build_opener(NoRedirect()).open(request,timeout=30) as response: data=json.load(response)
    except urllib.error.HTTPError as exc:
        raise RuntimeError({401:'Token invalid, expired or revoked.',403:'Acquire the skill in the website first.',404:'Requested version unavailable.'}.get(exc.code,f'Service returned HTTP {exc.code}.')) from None
    if args.action=='list': print(json.dumps(data,indent=2));return
    digest=hashlib.sha256(data['content'].encode()).hexdigest()
    if digest!=data['sha256']: raise RuntimeError('Content hash mismatch.')
    output=pathlib.Path(args.output); output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(data['content'])
    manifest={k:data[k] for k in ('skill_id','number','sha256','validation','published_at')}
    output.with_suffix(output.suffix+'.manifest.json').write_text(json.dumps(manifest,indent=2))
    print(f'Saved version {data["number"]} and provenance manifest. Validation: {data["validation"]}')

if __name__=='__main__':
    try: main()
    except Exception as exc: print(str(exc),file=sys.stderr);sys.exit(1)
