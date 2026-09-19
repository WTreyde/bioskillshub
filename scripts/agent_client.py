#!/usr/bin/env python3
"""Read-only client. Never prints authentication headers or environment values."""
import argparse, hashlib, http.client, json, os, pathlib, sys, tempfile
import urllib.error, urllib.parse, urllib.request

MAX_RESPONSE_BYTES = 1024 * 1024

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise RuntimeError('Redirect refused; configure the final BioSkillsHub URL.')

def fetch(base, token, suffix):
    parsed = urllib.parse.urlparse(base)
    if parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise RuntimeError('Use an HTTP(S) base URL without credentials, query or fragment.')
    if parsed.scheme == 'http' and parsed.hostname not in ('localhost', '127.0.0.1', '::1'):
        raise RuntimeError('Use HTTPS or a localhost SSH tunnel for token transport.')
    if not token:
        raise RuntimeError('Set BIOSKILLS_TOKEN securely in the environment first.')
    request = urllib.request.Request(base.rstrip('/') + suffix, headers={'Authorization': 'Bearer ' + token})
    try:
        with urllib.request.build_opener(NoRedirect()).open(request, timeout=30) as response:
            body = response.read(MAX_RESPONSE_BYTES + 1)
            if len(body) > MAX_RESPONSE_BYTES:
                raise RuntimeError('Service response exceeds the client size limit.')
            data = json.loads(body)
    except urllib.error.HTTPError as exc:
        raise RuntimeError({401: 'Token invalid, expired or revoked.', 403: 'Acquire the skill in the website first.', 404: 'Requested version unavailable.'}.get(exc.code, f'Service returned HTTP {exc.code}.')) from None
    except (urllib.error.URLError, TimeoutError, http.client.HTTPException, OSError):
        raise RuntimeError('Download interrupted or service unavailable; no files saved.') from None
    except (ValueError, UnicodeError):
        raise RuntimeError('Service returned invalid JSON.') from None
    if not isinstance(data, dict):
        raise RuntimeError('Service returned an invalid response object.')
    return data

def save_download(data, skill_id, version, output):
    required = ('skill_id', 'content', 'sha256', 'validation', 'published_at')
    if any(not isinstance(data.get(k), str) for k in required) or type(data.get('number')) is not int:
        raise RuntimeError('Incomplete version response; no files saved.')
    if data['skill_id'] != skill_id or data['number'] != version:
        raise RuntimeError('Response does not match the requested skill and version.')
    content = data['content'].encode('utf-8')
    if hashlib.sha256(content).hexdigest() != data['sha256']:
        raise RuntimeError('Content hash mismatch.')
    output = pathlib.Path(output)
    manifest_path = output.with_suffix(output.suffix + '.manifest.json')
    manifest = {k: data[k] for k in ('skill_id', 'number', 'sha256', 'validation', 'published_at')}
    output.parent.mkdir(parents=True, exist_ok=True)
    # Stage both files before exposing either. Exclusive links preserve earlier downloads.
    created = []
    try:
        with tempfile.TemporaryDirectory(prefix='.bioskills-', dir=output.parent) as staging:
            files = [(output, content), (manifest_path, json.dumps(manifest, indent=2).encode('utf-8'))]
            for index, (_, body) in enumerate(files):
                temporary = pathlib.Path(staging) / str(index)
                with temporary.open('xb') as stream:
                    os.chmod(temporary, 0o600)
                    stream.write(body)
                    stream.flush()
                    os.fsync(stream.fileno())
            for index, (destination, _) in enumerate(files):
                os.link(pathlib.Path(staging) / str(index), destination)
                created.append(destination)
    except OSError:
        for destination in created:
            destination.unlink()
        raise RuntimeError('Could not save download; choose unused writable output and manifest paths. Existing files were preserved.') from None
    return manifest

def main():
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest='action', required=True)
    commands.add_parser('list')
    get = commands.add_parser('get')
    get.add_argument('skill_id'); get.add_argument('version', type=int); get.add_argument('--output', required=True)
    args = parser.parse_args()
    suffix = '/api/agent/skills'
    if args.action == 'get':
        if args.version < 1:
            raise RuntimeError('Version must be positive.')
        suffix += f'/{urllib.parse.quote(args.skill_id, safe="")}/versions/{args.version}'
    data = fetch(os.environ.get('BIOSKILLS_URL', 'http://localhost:3000'), os.environ.get('BIOSKILLS_TOKEN'), suffix)
    if args.action == 'list':
        if not isinstance(data.get('skills'), list):
            raise RuntimeError('Service returned an invalid skills list.')
        print(json.dumps(data, indent=2))
        return
    save_download(data, args.skill_id, args.version, args.output)
    print(f'Saved version {args.version} and provenance manifest. Review its validation status before use.')

if __name__ == '__main__':
    try:
        main()
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr); sys.exit(1)
    except Exception:
        print('Client failed; check the service and output location privately.', file=sys.stderr); sys.exit(1)
