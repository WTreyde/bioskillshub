import hashlib, importlib.util, json, pathlib, tempfile, unittest, urllib.error, http.client
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('client','scripts/agent_client.py')
client=importlib.util.module_from_spec(spec);spec.loader.exec_module(client)

class AgentClientTests(unittest.TestCase):
    def fixture(self):
        text='Verified UTF-8 fixture: μ'
        return dict(skill_id='fixture',number=1,content=text,sha256=hashlib.sha256(text.encode()).hexdigest(),validation='Synthetic only',published_at='2026-09-19T00:00:00Z')

    def test_verified_pair_and_existing_download_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            output=pathlib.Path(directory)/'SKILL.md'; data=self.fixture()
            client.save_download(data,'fixture',1,output)
            self.assertEqual(output.read_text(),data['content'])
            self.assertEqual(json.loads(output.with_suffix('.md.manifest.json').read_text())['sha256'],data['sha256'])
            self.assertEqual(output.stat().st_mode & 0o777,0o600)
            with self.assertRaisesRegex(RuntimeError,'Existing files were preserved'):
                client.save_download(data,'fixture',1,output)
            self.assertEqual(output.read_text(),data['content'])

    def test_invalid_hash_identity_or_missing_provenance_never_writes(self):
        for change in ({'sha256':'bad'},{'number':2},{'skill_id':'other'},{'published_at':None}):
            with self.subTest(change=change), tempfile.TemporaryDirectory() as directory:
                output=pathlib.Path(directory)/'SKILL.md'
                with self.assertRaises(RuntimeError):client.save_download({**self.fixture(),**change},'fixture',1,output)
                self.assertFalse(output.exists())

    def test_manifest_collision_rolls_back_new_content(self):
        with tempfile.TemporaryDirectory() as directory:
            output=pathlib.Path(directory)/'SKILL.md'; manifest=output.with_suffix('.md.manifest.json')
            manifest.write_text('existing')
            with self.assertRaises(RuntimeError):client.save_download(self.fixture(),'fixture',1,output)
            self.assertFalse(output.exists());self.assertEqual(manifest.read_text(),'existing')

    def test_interrupted_download_and_expired_token_are_sanitized(self):
        for error, expected in [(http.client.IncompleteRead(b'private'), 'interrupted'),
                                (urllib.error.HTTPError('http://localhost',401,'private',{},None),'expired')]:
            with patch.object(client.urllib.request,'build_opener') as opener:
                opener.return_value.open.side_effect=error
                with self.assertRaisesRegex(RuntimeError,expected) as caught:client.fetch('http://localhost','secret-test-token','/api/agent/skills')
                self.assertNotIn('private',str(caught.exception))
                self.assertNotIn('secret-test-token',str(caught.exception))

    def test_redirect_and_nonlocal_http_refused(self):
        with self.assertRaisesRegex(RuntimeError,'Redirect refused'):
            client.NoRedirect().redirect_request(None,None,302,'',{},'https://elsewhere.invalid')
        with patch.object(client.urllib.request,'build_opener') as opener:
            with self.assertRaisesRegex(RuntimeError,'HTTPS'):client.fetch('http://elsewhere.invalid','token','/api/agent/skills')
            opener.assert_not_called()

    def test_oversized_and_malformed_responses_rejected(self):
        for body in [b'x'*(client.MAX_RESPONSE_BYTES+1),b'{broken',b'[]']:
            with patch.object(client.urllib.request,'build_opener') as opener:
                opener.return_value.open.return_value.__enter__.return_value.read.return_value=body
                with self.assertRaises(RuntimeError):client.fetch('http://localhost','token','/api/agent/skills')

    def test_hidden_prompt_and_explicit_url(self):
        with patch.object(client.sys,'argv',['agent_client.py','--url','https://demo.example','--prompt-token','list']), patch.object(client.sys.stdin,'isatty',return_value=True), patch.object(client.getpass,'getpass',return_value='fixture-token') as prompt, patch.object(client,'fetch',return_value={'skills':[]}) as fetch, patch('builtins.print'):
            client.main()
            prompt.assert_called_once()
            fetch.assert_called_once_with('https://demo.example','fixture-token','/api/agent/skills')

    def test_prompt_refuses_noninteractive_input(self):
        with patch.object(client.sys,'argv',['agent_client.py','--prompt-token','list']), patch.object(client.sys.stdin,'isatty',return_value=False), patch.object(client,'fetch') as fetch:
            with self.assertRaisesRegex(RuntimeError,'interactive terminal'):client.main()
            fetch.assert_not_called()
